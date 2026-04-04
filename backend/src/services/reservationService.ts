import { Prisma } from "@prisma/client";
import prisma from "../config/db";

// Interfaces for data transfer
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

        // Calculate the total securely by fetching actual prices from the database
        if (orders && orders.length > 0) {
            // Extract all dish IDs from the incoming order
            const dishIds = orders.map(order => order.dishId);
            
            // Fetch those specific dishes from the database
            const dishes = await prisma.dish.findMany({
                where: { id: { in: dishIds } }
            });

            // Create a quick lookup map for prices: { 1: 15.99, 2: 9.50 }
            const priceMap = new Map(dishes.map(dish => [dish.id, dish.price]));

            // Calculate the total based on the quantity requested and the database price
            for (const order of orders) {
                const price = priceMap.get(order.dishId);
                if (price === undefined) {
                    throw new Error(`Dish with ID ${order.dishId} not found.`);
                }
                calculatedTotal += price * order.quantity;
            }
        }

        // Create the reservation and any associated pre-ordered dishes
        const reservation = await prisma.reservation.create({
            data: {
                userId: data.userId,
                tableId: data.tableId,
                datetime: data.datetime,
                total: calculatedTotal > 0 ? calculatedTotal : null,
                // Create ReservationDish entries
                dishes: {
                    create: orders.map((item) => ({
                        quantity: item.quantity,
                        dish: {
                            connect: { id: item.dishId }
                        }
                    }))
                }
            },
            // Ensure the response includes the nested dishes
            include: {
                dishes: {
                    include: {
                        dish: true
                    }
                }
            }
        });

        return reservation;
    }
    catch(error) {
        console.error("Error in createReservation service:", error);
        throw new Error((error as Error).message || 'Database failed to create reservation.');
    }
}

export async function getAllReservations() {
    try {
        // Retrieve all reservations with selective fields to avoid exposing sensitive data
        const reservations = await prisma.reservation.findMany({
            select: {
                id: true,
                datetime: true,
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
        return reservations;
    }
    catch(error) {
        console.error("Error while fetching reservations: ", error);
        throw new Error('Database failed to retrieve reservations.');
    }
}

export async function getReservationById(id: number) {
    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            // Use the same detailed select as getAllReservations
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
        throw new Error('Database failed to retrieve reservation.');
    }
}


export async function updateReservation(id: number, data: UpdateReservationData) {
    try {
        const dataToUpdate: Prisma.ReservationUpdateInput = {};

        // Updating a relationship
        if (data.tableId !== undefined) {
            dataToUpdate.table = { connect: { id: data.tableId } };
        }

        // Updating the datetime
        if (data.datetime !== undefined) {
            dataToUpdate.datetime = new Date(data.datetime);
        }

        // Calculate the new total
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

            // Rounding and error check
            const roundedTotal = Math.round(calculatedTotal * 100) / 100;
            dataToUpdate.total = roundedTotal > 0 ? roundedTotal : null;

            // Updating the dishes relationship
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
                dishes: { include: { dish: true } }
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
        // Using deleteMany on the join table first to handle cascading deletes
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