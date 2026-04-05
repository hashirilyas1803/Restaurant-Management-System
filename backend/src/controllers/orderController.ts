import { Request, Response } from 'express';
import { 
    createOrder, 
    getOrderById, 
    getAllOrders, 
    updateOrderStatus, 
    deleteOrder, 
    updateOrder
} from '../services/orderService';

export async function handleCreateOrder(req: Request, res: Response) {
    try {
        const currentUser = req.user!;
        
        // Pass complete business data including Order Type and Payment Method
        const order = await createOrder(
            { 
                userId: currentUser.userId, 
                location: req.body.location,
                // DELIVERY or TAKEAWAY
                type: req.body.type,
                // CASH or ONLINE
                paymentMethod: req.body.paymentMethod
            },
            req.body.items || []
        );

        return res.status(201).json({ "message": "Order placed successfully", "data": order });
    } catch (error) {
        return res.status(500).json({ "message": "Order failed", "error": (error as Error).message });
    }
}

export async function handleUpdateOrder(req: Request, res: Response) {
    try {
        const orderId = Number(req.params.id);
        const currentUser = req.user!;

        // Authorization and Status Gate check are handled inside the service and controller
        const order = await getOrderById(orderId);
        if (order.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return res.status(403).json({ "message": "Access denied" });
        }

        const updatedOrder = await updateOrder(orderId, req.body, req.body.items);

        return res.status(200).json({
            "message": "Order updated successfully",
            "data": updatedOrder
        });
    } catch (error) {
        return res.status(400).json({
            "message": "Update failed",
            "error": (error as Error).message
        });
    }
}

export async function handleGetOrder(req: Request, res: Response) {
    try {
        const orderId = Number(req.params.id);
        const currentUser = req.user!;

        // Fetch order and verify that the user owns it or is an admin
        const order = await getOrderById(orderId);
        if (order.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return res.status(403).json({
                "message": "Access denied",
                "error": "You do not have permission to view this order"
            });
        }

        return res.status(200).json({
            "message": "Order retrieved successfully",
            "data": order
        });
    } catch (error) {
        return res.status(404).json({
            "message": "Order not found!",
            "error": (error as Error).message
        });
    }
}

export async function handleGetAllOrders(req: Request, res: Response) {
    try {
        const currentUser = req.user!;
        let orders = await getAllOrders();

        // Customers only see their own order history; admins see the full system list
        if (currentUser.role === 'CUSTOMER') {
            orders = orders.filter(o => o.userId === currentUser.userId);
        }

        return res.status(200).json({
            "message": "Orders retrieved successfully",
            "data": orders
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Orders could not be retrieved!",
            "error": (error as Error).message
        });
    }
}

export async function handleUpdateOrderStatus(req: Request, res: Response) {
    try {
        // This endpoint is protected for Admins to move orders through fulfillment stages
        const orderId = Number(req.params.id);
        const { status } = req.body;

        const updatedOrder = await updateOrderStatus(orderId, status);

        return res.status(200).json({
            "message": "Order status updated successfully",
            "data": updatedOrder
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Status update failed!",
            "error": (error as Error).message
        });
    }
}

export async function handleDeleteOrder(req: Request, res: Response) {
    try {
        const orderId = Number(req.params.id);
        const currentUser = req.user!;

        // Ownership check to prevent unauthorized deletion
        const order = await getOrderById(orderId);
        if (order.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return res.status(403).json({
                "message": "Access denied",
                "error": "You do not have permission to delete this order"
            });
        }

        await deleteOrder(orderId);

        return res.status(200).json({
            "message": "Order deleted successfully",
            "data": { id: orderId }
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Order could not be deleted!",
            "error": (error as Error).message
        });
    }
}