import prisma from "../config/db";
import { Prisma } from '@prisma/client';

export interface ReservationData {
    userId: number;
    tableId: number;
    datetime: Date;
}

export interface UpdateReservationData {
    tableId?: number;
    datetime?: Date;
    preOrders?: DishOrder[];
}

export interface DishOrder {
    dishId: number;
    quantity: number;
}

export async function createReservation(data: ReservationData, orders: DishOrder[]) {
    try {
        let calculatedTotal = 0;

        // Fetch dish prices from the database to ensure the total is calculated securely
        if (orders && orders.length > 0) {
            const dishIds = orders.map(order => order.dishId);
            const dishes = await prisma.dish.findMany({
                where: { id: { in: dishIds } }
            });

            const priceMap = new Map(dishes.map(dish => [dish.id, dish.price]));

            for (const order of orders) {
                const price = priceMap.get(order.dishId);
                if (price === undefined) {
                    throw new Error(`Dish with ID ${order.dishId} not found.`);
                }
                calculatedTotal += price * order.quantity;
            }
        }

        // Round the total to two decimal places to prevent floating point inaccuracies
        const roundedTotal = Math.round(calculatedTotal * 100) / 100;

        // Create the reservation and link pre-ordered dishes in a single database transaction
        return await prisma.reservation.create({
            data: {
                userId: data.userId,
                tableId: data.tableId,
                datetime: data.datetime,
                total: roundedTotal > 0 ? roundedTotal : null,
                dishes: {
                    create: orders.map((item) => ({
                        quantity: item.quantity,
                        dish: {
                            connect: { id: item.dishId }
                        }
                    }))
                }
            },
            include: {
                dishes: {
                    include: {
                        dish: true
                    }
                }
            }
        });
    }
    catch(error) {
        console.error("Error in createReservation service:", error);
        throw new Error((error as Error).message || 'Database failed to create reservation.');
    }
}

export async function getAllReservations() {
    try {
        // Retrieve all reservations while omitting sensitive user data like password hashes
        return await prisma.reservation.findMany({
            select: {
                id: true,
                datetime: true,
                userId: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone_number: true
                    }
                },
                table: {
                    select: {
                        id: true,
                        capacity: true
                    }
                },
                dishes: {
                    select: {
                        dish: {
                            select: {
                                name: true,
                                price: true
                            }
                        },
                        quantity: true
                    }
                },
                total: true
            }
        });
    }
    catch(error) {
        console.error("Error while fetching reservations: ", error);
        throw new Error('Database failed to retrieve reservations.');
    }
}

export async function getReservationById(id: number) {
    try {
        // Fetch a specific reservation with secure user data selection for ownership verification
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            select: {
                id: true,
                datetime: true,
                userId:true,
                user: { select: { id: true, name: true, email: true, phone_number: true } },
                table: { select: { id: true, capacity: true } },
                dishes: { select: { dish: { select: { name: true, price: true } }, quantity: true } },
                total: true
            }
        });

        if (!reservation) {
            throw new Error('Reservation not found.');
        }

        return reservation;
    } catch(error) {
        console.error(`Error while fetching reservation with id ${id}:`, error);
        throw new Error((error as Error).message || 'Database failed to retrieve reservation.');
    }
}

export async function updateReservation(id: number, data: UpdateReservationData) {
    try {
        const dataToUpdate: Prisma.ReservationUpdateInput = {};

        if (data.tableId !== undefined) {
            dataToUpdate.table = { connect: { id: data.tableId } };
        }

        if (data.datetime !== undefined) {
            dataToUpdate.datetime = new Date(data.datetime);
        }

        // Recalculate totals and refresh the bridge table if the pre-order list is modified
        if (data.preOrders !== undefined) {
            let calculatedTotal = 0;

            if (data.preOrders.length > 0) {
                const dishIds = data.preOrders.map(order => order.dishId);
                const dishes = await prisma.dish.findMany({ where: { id: { in: dishIds } } });
                const priceMap = new Map(dishes.map(dish => [dish.id, dish.price]));

                for (const order of data.preOrders) {
                    const price = priceMap.get(order.dishId);
                    if (price === undefined) {
                        throw new Error(`Dish with ID ${order.dishId} not found.`);
                    }
                    calculatedTotal += price * order.quantity;
                }
            }

            const roundedTotal = Math.round(calculatedTotal * 100) / 100;
            dataToUpdate.total = roundedTotal > 0 ? roundedTotal : null;

            dataToUpdate.dishes = {
                deleteMany: {}, 
                create: data.preOrders.map((item) => ({
                    quantity: item.quantity,
                    dish: { connect: { id: item.dishId } }
                }))
            };
        }

        return await prisma.reservation.update({
            where: { id: id },
            data: dataToUpdate,
            include: {
                dishes: { 
                    orderBy: { id: 'asc' },
                    include: { dish: true } 
                }
            }
        });
    }
    catch(error) {
        console.error(`Error in updateReservation service for id ${id}:`, error);
        throw new Error((error as Error).message || 'Database failed to update reservation.');
    }
}

export async function deleteReservation(id: number) {
    try {
        // Remove associated pre-orders before deleting the parent reservation record
        await prisma.reservationDish.deleteMany({
            where: { reservationId: id }
        });

        return await prisma.reservation.delete({
            where: { id: id }
        });
    }
    catch(error) {
        console.error(`Error in deleteReservation service for id ${id}:`, error);
        throw new Error('Database failed to delete reservation.');   
    }
}