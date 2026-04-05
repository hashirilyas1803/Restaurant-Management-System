import prisma from "../config/db";

export interface CateringRequest {
    userId: number;
    eventName: string;
    guestCount: number;
    location: string;
    datetime: Date;
}

export async function requestCatering(data: CateringRequest, menuItems: number[]) {
    try {
        let calculatedTotal = 0;
        
        // Calculate the event total based on a per-head pricing model for selected dishes
        if (menuItems && menuItems.length > 0) {
            const dishes = await prisma.dish.findMany({ where: { id: { in: menuItems } } });
            const menuBasePrice = dishes.reduce((sum, dish) => sum + dish.price, 0);
            calculatedTotal = menuBasePrice * data.guestCount;
        }

        const roundedTotal = Math.round(calculatedTotal * 100) / 100;

        // Store catering request and set initial portions in the bridge table to match guest count
        const catering = await prisma.catering.create({
            data: {
                userId: data.userId,
                eventName: data.eventName,
                guestCount: data.guestCount,
                location: data.location,
                datetime: data.datetime,
                total: roundedTotal,
                dishes: {
                    create: menuItems.map(dishId => ({
                        quantity: data.guestCount,
                        dish: { connect: { id: dishId } }
                    }))
                }
            },
            include: { dishes: { include: { dish: true } } }
        });

        // Simulate the notification system
        console.log(`[MOCK SERVICE] Notifying Admin of new Catering Request: ${data.eventName}`);
        
        const referenceNumber = `CAT-${catering.id}-${Math.floor(Math.random() * 1000)}`;
        console.log(`[MOCK SERVICE] Generated Reference Number: ${referenceNumber}`);

        return catering;
    } catch (error) {
        console.error("Error in requestCatering service:", error);
        throw new Error((error as Error).message);
    }
}

export async function getAllCaterings() {
    try {
        // Retrieve catering events
        return await prisma.catering.findMany({
            include: { 
                user: { select: { id: true, name: true, email: true, phone_number: true } }, 
                dishes: { include: { dish: true } } 
            },
            orderBy: { datetime: 'desc' }
        });
    } catch (error) {
        throw new Error("Failed to retrieve catering requests.");
    }
}

export async function getCateringById(id: number) {
    try {
        // Fetch the booking
        const booking = await prisma.catering.findUnique({
            where: { id },
            include: { 
                user: { select: { id: true, name: true, email: true, phone_number: true } },
                dishes: { include: { dish: true } } 
            }
        });
        if (!booking) throw new Error("Catering request not found");
        return booking;
    } catch (error) {
        throw new Error((error as Error).message);
    }
}

export async function updateCatering(id: number, data: any) {
    try {
        const existing = await prisma.catering.findUnique({ 
            where: { id }, 
            include: { dishes: true } 
        });
        if (!existing) throw new Error("Catering event not found.");

        // Prevent modification if the catering has transitioned from the PENDING state
        if (existing.status !== 'PENDING') {
            throw new Error("Cannot modify catering once it has moved past PENDING status.");
        }

        const dataToUpdate: any = {};
        if (data.eventName) dataToUpdate.eventName = data.eventName;
        if (data.location) dataToUpdate.location = data.location;
        if (data.datetime) dataToUpdate.datetime = new Date(data.datetime);

        const newGuestCount = data.guestCount || existing.guestCount;
        const menuItems = data.menuItemIds || existing.dishes.map(d => d.dishId);

        // Re-sync bridge table quantities and recalculate total if guest count or menu changes
        if (data.guestCount !== undefined || data.menuItemIds !== undefined) {
            const dishes = await prisma.dish.findMany({ where: { id: { in: menuItems } } });
            const menuBasePrice = dishes.reduce((sum, dish) => sum + dish.price, 0);
            
            dataToUpdate.guestCount = newGuestCount;
            dataToUpdate.total = Math.round((menuBasePrice * newGuestCount) * 100) / 100;
            dataToUpdate.dishes = {
                deleteMany: {},
                create: menuItems.map((dishId: number) => ({
                    quantity: newGuestCount,
                    dish: { connect: { id: dishId } }
                }))
            };
        }

        return await prisma.catering.update({
            where: { id },
            data: dataToUpdate,
            include: { dishes: { include: { dish: true } } }
        });
    } catch (error) {
        throw new Error((error as Error).message);
    }
}

export async function updateCateringStatus(id: number, nextStatus: any) {
    try {
        const booking = await prisma.catering.findUnique({ where: { id } });
        if (!booking) throw new Error("Catering request not found.");

        // Define valid transitions for the event booking lifecycle to ensure administrative consistency
        const validTransitions: Record<string, string[]> = {
            // Start/Default state
            PENDING: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],

            // Allow approval or rejection, but prevent moving back to the default state
            CHANGES_REQUESTED: ['APPROVED', 'REJECTED'],

            // Allow cancellation after approval, but prevent moving back to review
            APPROVED: ['REJECTED'],

            // Terminal state
            REJECTED: []
        };

        const currentStatus = booking.status;

        // Use the null-coalescing operator to provide an empty array if the status is not mapped
        const allowedNextStates = validTransitions[currentStatus] ?? [];

        // Enforce the state machine to prevent finalized events from returning to a pending or review state
        if (!allowedNextStates.includes(nextStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}.`);
        }

        return await prisma.catering.update({
            where: { id },
            data: { status: nextStatus }
        });
    } catch (error) {
        console.error(`Status transition error for Catering Request ${id}:`, error);
        throw new Error((error as Error).message || "Failed to update catering status.");
    }
}

export async function deleteCatering(id: number) {
    try {
        const currentCatering = await prisma.catering.findUnique({ where: { id } });
        if (!currentCatering) throw new Error("Catering not found");

        // Prevent deletion if the catering has transitioned from the PENDING state
        if (currentCatering.status !== 'PENDING') {
            throw new Error("Cannot delete catering once it has moved past PENDING status.");
        }
        
        // Clear bridging table relations before deleting the parent record
        await prisma.cateringDish.deleteMany({ where: { cateringId: id } });
        return await prisma.catering.delete({ where: { id } });
    } catch (error) {
        throw new Error((error as Error).message);
    }
}