import prisma from "../config/db";

export interface OrderData {
    userId: number;
    location: string;
    type: "DELIVERY" | "TAKEAWAY";
    paymentMethod: "CASH" | "ONLINE";
}

export interface DishOrder {
    dishId: number;
    quantity: number;
}

export async function createOrder(data: OrderData, items: DishOrder[]) {
    try {
        let calculatedTotal = 0;

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

        const roundedTotal = Math.round(calculatedTotal * 100) / 100;

        // Persist order with rounded totals and specific fulfillment type/payment method
        return await prisma.order.create({
            data: {
                userId: data.userId,
                location: data.location,
                type: data.type,
                paymentMethod: data.paymentMethod,
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
    try {
        // Selectively fetch user data to prevent sensitive credential leaks
        const order = await prisma.order.findUnique({
            where: { id },
            include: { 
                user: {
                    select: { id: true, name: true, email: true, phone_number: true }
                },
                dishes: { include: { dish: true } } 
            }
        });
        if (!order) throw new Error("Order not found");
        return order;
    } catch (error) {
        throw new Error((error as Error).message);
    }
}

export async function getAllOrders() {
    try {
        // Return full order list for administrative oversight with sanitized user profiles
        return await prisma.order.findMany({
            include: { 
                user: {
                    select: { id: true, name: true, email: true, phone_number: true }
                },
                dishes: { include: { dish: true } } 
            },
            orderBy: { datetime: 'desc' }
        });
    } catch (error) {
        throw new Error("Failed to retrieve orders.");
    }
}

export async function updateOrder(id: number, data: any, items?: DishOrder[]) {
    try {
        const currentOrder = await prisma.order.findUnique({ where: { id } });
        if (!currentOrder) throw new Error("Order not found");

        // Prevent modification if the order has transitioned from the PENDING state
        if (currentOrder.status !== 'PENDING') {
            throw new Error("Cannot modify order once it has moved past PENDING status.");
        }

        const dataToUpdate: any = {};
        if (data.location) dataToUpdate.location = data.location;
        if (data.type) dataToUpdate.type = data.type;
        if (data.paymentMethod) dataToUpdate.paymentMethod = data.paymentMethod;

        if (items) {
            let calculatedTotal = 0;
            const dishIds = items.map(item => item.dishId);
            const dishes = await prisma.dish.findMany({ where: { id: { in: dishIds } } });
            const priceMap = new Map(dishes.map(dish => [dish.id, dish.price]));

            for (const item of items) {
                const price = priceMap.get(item.dishId);
                calculatedTotal += (price || 0) * item.quantity;
            }

            dataToUpdate.total = Math.round(calculatedTotal * 100) / 100;
            dataToUpdate.dishes = {
                deleteMany: {},
                create: items.map(item => ({
                    quantity: item.quantity,
                    dish: { connect: { id: item.dishId } }
                }))
            };
        }

        return await prisma.order.update({
            where: { id },
            data: dataToUpdate,
            include: { dishes: { include: { dish: true } } }
        });
    } catch (error) {
        throw new Error((error as Error).message);
    }
}

export async function updateOrderStatus(id: number, status: any) {
    try {
        // Allow administrative updates to fulfillment status codes
        return await prisma.order.update({
            where: { id },
            data: { status }
        });
    } catch (error) {
        throw new Error("Failed to update order status.");
    }
}

export async function deleteOrder(id: number) {
    try {
        const currentOrder = await prisma.order.findUnique({ where: { id } });
        if (!currentOrder) throw new Error("Order not found");

        // Prevent deletion if the order has transitioned from the PENDING state
        if (currentOrder.status !== 'PENDING') {
            throw new Error("Cannot delete order once it has moved past PENDING status.");
        }

        // Clean up linked dish items before deleting the order record
        await prisma.orderDish.deleteMany({ where: { orderId: id } });
        return await prisma.order.delete({ where: { id } });
    } catch (error) {
        throw new Error((error as Error).message);
    }
}