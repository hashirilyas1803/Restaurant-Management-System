import { Request, Response } from 'express';
import { 
    requestCatering, 
    getCateringById, 
    getAllCaterings,
    updateCatering,
    updateCateringStatus,
    deleteCatering 
} from '../services/cateringService';

export async function handleRequestCatering(req: Request, res: Response) {
    try {
        const currentUser = req.user!;
        // Expect an array of dish IDs for the menu selection
        const menuItems = req.body.menuItemIds || [];

        const request = await requestCatering(
            { 
                userId: currentUser.userId, 
                eventName: req.body.eventName,
                guestCount: req.body.guestCount,
                location: req.body.location, 
                datetime: new Date(req.body.datetime) 
            },
            menuItems
        );

        return res.status(201).json({
            "message": "Catering request submitted successfully",
            "data": request
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Catering request failed!",
            "error": (error as Error).message
        });
    }
}

export async function handleGetAllCaterings(req: Request, res: Response) {
    try {
        const currentUser = req.user!;
        let requests = await getAllCaterings();

        // Enforce ownership: Customers only see their own bookings
        if (currentUser.role === 'CUSTOMER') {
            requests = requests.filter(r => r.userId === currentUser.userId);
        }

        return res.status(200).json({
            "message": "Catering requests retrieved successfully",
            "data": requests
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Retrieval failed",
            "error": (error as Error).message
        });
    }
}

export async function handleUpdateCatering(req: Request, res: Response) {
    try {
        const requestId = Number(req.params.id);
        const currentUser = req.user!;
        
        const request = await getCateringById(requestId);
        // Verify authorization for the specific record
        if (request.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return res.status(403).json({ "message": "Access denied" });
        }

        const updated = await updateCatering(requestId, req.body);
        return res.status(200).json({
            "message": "Catering request updated successfully",
            "data": updated
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Update failed",
            "error": (error as Error).message
        });
    }
}

export async function handleApproveRejectCatering(req: Request, res: Response) {
    try {
        const requestId = Number(req.params.id);
        const { status } = req.body;

        const updatedRequest = await updateCateringStatus(requestId, status);

        return res.status(200).json({
            "message": `Catering request ${status.toLowerCase()} successfully`,
            "data": updatedRequest
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Status update failed!",
            "error": (error as Error).message
        });
    }
}

export async function handleDeleteCatering(req: Request, res: Response) {
    try {
        const requestId = Number(req.params.id);
        const currentUser = req.user!;

        const request = await getCateringById(requestId);
        if (request.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return res.status(403).json({ "message": "Access denied" });
        }

        await deleteCatering(requestId);
        return res.status(200).json({
            "message": "Catering request deleted successfully",
            "data": { id: requestId }
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Deletion failed!",
            "error": (error as Error).message
        });
    }
}