import { createReservation, getAllReservations, updateReservation, deleteReservation, ReservationData, UpdateReservationData, DishOrder } from "../services/reservationService";
import { Request, Response } from 'express';

export async function handleCreateReservation(req: Request, res: Response) {
    try {
        // Create a new data object with the correct data types
        const data: ReservationData = {
            userId: req.body.userId, 
            tableId: req.body.tableId, 
            datetime: new Date(req.body.datetime)
        };

        const orders: DishOrder[] = req.body.preOrders || []; 

        // Create the reservation using the service layer
        const reservation = await createReservation(data, orders);

        // Return the response in case of success
        return res.status(201).json({
            "message": "Reservation created successfully",
            "data": reservation
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("Reservation Creation failed at the service layer! ", error);
        return res.status(500).json({
            "message": "Reservation could not be created!",
            "error": (error as Error).message
        });
    }
}

export async function handleGetAllReservations(req: Request, res: Response) {
    try {
        // Retrieve all reservations using the service layer
        const reservations = await getAllReservations();

        // Return the response in case of success
        return res.status(200).json({
            "message": "Reservations retrieved successfully",
            "data": reservations
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("Reservation Retrieval failed at the service layer! ", error);
        return res.status(500).json({
            "message": "Reservations could not be retrieved!",
            "error": (error as Error).message
        });
    }
}

export async function handleUpdateReservation(req: Request, res: Response) {
    try {
        // Get the id from the URL parameters
        const reservationId = Number(req.params.id);

        // Get the entire request body
        const dataForUpdate: UpdateReservationData = req.body;
        
        // Call the service with TWO distinct arguments: id and data
        const updatedReservation = await updateReservation(reservationId, dataForUpdate);

        // Return the response in case of success
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
        // Delete the reservation using the service layer
        await deleteReservation(Number(req.params.id));

        // Return the No Content status code for a successful delete operation
        res.status(200).json({
            "message": "Reservation deleted successfully",
            "data": { id: Number(req.params.id) }
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