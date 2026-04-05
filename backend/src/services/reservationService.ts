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
        // 1 hour in milliseconds
        const reservationWindow = 60 * 60 * 1000;
        const bufferStart = new Date(data.datetime.getTime() - reservationWindow);
        const bufferEnd = new Date(data.datetime.getTime() + reservationWindow);

        // Check if any reservation exists for this table within the 2-hour window
        const conflict = await prisma.reservation.findFirst({
            where: {
                tableId: data.tableId,
                datetime: {
                    gte: bufferStart,
                    lte: bufferEnd
                }
            }
        });

        if (conflict) {
            throw new Error(`Table ${data.tableId} is already occupied during this time slot (Conflict with Reservation #${conflict.id}).`);
        }
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
        // Fetch current reservation to get existing values for the collision check
        const current = await prisma.reservation.findUnique({ where: { id } });
        if (!current) throw new Error("Reservation not found.");

        // Use new data if provided, otherwise fallback to existing
        const effectiveTableId = data.tableId ?? current.tableId;
        const effectiveDatetime = data.datetime ? new Date(data.datetime) : current.datetime;

        // Only run the collision check if table or time is actually changing
        if (data.tableId !== undefined || data.datetime !== undefined) {
            // 1 hour in milliseconds
            const reservationWindow = 60 * 60 * 1000;
            const bufferStart = new Date(effectiveDatetime.getTime() - reservationWindow);
            const bufferEnd = new Date(effectiveDatetime.getTime() + reservationWindow);

            const conflict = await prisma.reservation.findFirst({
                where: {
                    tableId: effectiveTableId,
                    // Exclude the current reservation itself
                    id: { not: id },
                    datetime: {
                        gte: bufferStart,
                        lte: bufferEnd
                    }
                }
            });

            if (conflict) {
                throw new Error(`Conflict: Table ${effectiveTableId} is occupied by Reservation #${conflict.id} at this time.`);
            }
        }

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
            where: { id },
            data: dataToUpdate,
            include: { dishes: { include: { dish: true } } }
        });
    } catch (error) {
        console.error(`Update Error:`, error);
        throw new Error((error as Error).message);
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