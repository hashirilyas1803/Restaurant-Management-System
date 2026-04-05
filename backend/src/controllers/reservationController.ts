import { createReservation, getAllReservations, updateReservation, deleteReservation, ReservationData, UpdateReservationData, DishOrder, getReservationById } from "../services/reservationService";
import { Request, Response } from 'express';

export async function handleCreateReservation(req: Request, res: Response) {
    try {
        // Pull the userId directly from the verified token
        const currentUser = req.user!;

        const data: ReservationData = {
            userId: currentUser.userId, 
            tableId: req.body.tableId, 
            datetime: new Date(req.body.datetime)
        };

        const orders: DishOrder[] = req.body.preOrders || []; 

        const reservation = await createReservation(data, orders);

        return res.status(201).json({
            "message": "Reservation created successfully",
            "data": reservation
        });
    }
    catch(error) {
        console.error("Reservation Creation failed: ", error);
        return res.status(500).json({
            "message": "Reservation could not be created!",
            "error": (error as Error).message
        });
    }
}

export async function handleGetReservation(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        // Pull the userId directly from the verified token
        const currentUser = req.user!;
        const reservation = await getReservationById(id);

        if (reservation.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return res.status(403).json({ "message": "Access denied" });
        }

        return res.status(200).json({ "message": "Reservation retrieved", "data": reservation });
    } catch (error) {
        return res.status(404).json({ "message": "Not found", "error": (error as Error).message });
    }
}

export async function handleGetAllReservations(req: Request, res: Response) {
    try {
        const currentUser = req.user!;
        let reservations = await getAllReservations();

        // If the user is a Customer, filter the results to only show their reservations
        // Admins will bypass this and see the full list
        if (currentUser.role === 'CUSTOMER') {
            reservations = reservations.filter(r => r.user.id === currentUser.userId);
        }

        return res.status(200).json({
            "message": "Reservations retrieved successfully",
            "data": reservations
        });
    }
    catch(error) {
        console.error("Reservation Retrieval failed: ", error);
        return res.status(500).json({
            "message": "Reservations could not be retrieved!",
            "error": (error as Error).message
        });
    }
}

export async function handleUpdateReservation(req: Request, res: Response) {
    try {
        const reservationId = Number(req.params.id);
        const currentUser = req.user!;

        // Perform the ownership check before proceeding
        const reservation = await getReservationById(reservationId);
        if (reservation.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return res.status(403).json({
                "message": "Access denied",
                "error": "You do not have permission to update this reservation"
            });
        }
        
        // If the check passes, proceed with the update
        const updatedReservation = await updateReservation(reservationId, req.body);

        return res.status(200).json({
            "message": "Reservation updated successfully",
            "data": updatedReservation
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("Reservation Update failed at the service layer! ", error);
        return res.status(500).json({
            "message": "Reservation could not be updated!",
            "error": (error as Error).message
        });
    }
}


export async function handleDeleteReservation(req: Request, res: Response) {
    try {
        const reservationId = Number(req.params.id);
        const currentUser = req.user!;

        // Perform the ownership check before proceeding
        const reservation = await getReservationById(reservationId);
        if (reservation.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return res.status(403).json({
                "message": "Access denied",
                "error": "You do not have permission to delete this reservation"
            });
        }

        // If the check passes, proceed with the deletion
        await deleteReservation(reservationId);

        return res.status(200).json({
            "message": "Reservation deleted successfully",
            "data": { id: reservationId }
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("Reservation Deletion failed at the service layer! ", error);
        return res.status(500).json({
            "message": "Reservation could not be deleted!", 
            "error": (error as Error).message
        });
    }
}