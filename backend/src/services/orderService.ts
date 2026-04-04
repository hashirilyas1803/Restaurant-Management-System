import prisma from "../config/db";

export interface OrderData {
    userId: number;
    location: string;
}

export interface DishOrder {
    dishId: number;
    quantity: number;
}

export async function createOrder(data: OrderData, items: DishOrder[]) {
    try {
        let calculatedTotal = 0;

        // Fetch current dish prices to ensure the total is accurate and secure
        if (items && items.length > 0) {
            const dishIds = items.map(item => item.dishId);
            const dishes = await prisma.dish.findMany({ where: { id: { in: dishIds } } });
            const priceMap = new Map(dishes.map(dish => [dish.id, dish.price]));

            for (const item of items) {
                const price = priceMap.get(item.dishId);
                if (price === undefined) throw new Error(`Dish ID ${item.dishId} not found.`);
                calculatedTotal += price * item.quantity;
            }
        }

        // Round total to prevent floating point inaccuracies
        const roundedTotal = Math.round(calculatedTotal * 100) / 100;

        // Persist the order and the associated dishes in a single transaction
        return await prisma.order.create({
            data: {
                userId: data.userId,
                location: data.location,
                total: roundedTotal,
                dishes: {
                    create: items.map(item => ({
                        quantity: item.quantity,
                        dish: { connect: { id: item.dishId } }
                    }))
                }
            },
            include: { dishes: { include: { dish: true } } }
        });
    } catch (error) {
        console.error("Error in createOrder service:", error);
        throw new Error((error as Error).message);
    }
}

export async function getOrderById(id: number) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: { dishes: { include: { dish: true } } }
    });
    if (!order) throw new Error("Order not found");
    return order;
}

export async function getAllOrders() {
    return await prisma.order.findMany({
        include: { user: true, dishes: { include: { dish: true } } },
        orderBy: { datetime: 'desc' }
    });
}

export async function updateOrderStatus(id: number, status: any) {
    // Allows admins to move orders through the fulfillment lifecycle
    return await prisma.order.update({
        where: { id },
        data: { status }
    });
}

export async function deleteOrder(id: number) {
    // Cascade delete order dishes before removing the main order record
    await prisma.orderDish.deleteMany({ where: { orderId: id } });
    return await prisma.order.delete({ where: { id } });
}