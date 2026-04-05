import { Request, Response } from 'express';
import { 
    createDish, 
    getAllDishes, 
    updateDish, 
    deleteDish 
} from '../services/dishService';

export async function handleCreateDish(req: Request, res: Response) {
    try {
        // Pass the request body directly to the service to create a new menu item
        const dish = await createDish(req.body);

        return res.status(201).json({
            "message": "Dish created successfully",
            "data": dish
        });
    } catch (error) {
        console.error("Dish creation failed: ", error);
        return res.status(500).json({
            "message": "Dish could not be created!",
            "error": (error as Error).message
        });
    }
}

export async function handleGetAllDishes(req: Request, res: Response) {
    try {
        // Retrieve the full menu for display on the frontend
        const dishes = await getAllDishes();

        return res.status(200).json({
            "message": "Menu retrieved successfully",
            "data": dishes
        });
    } catch (error) {
        console.error("Menu retrieval failed: ", error);
        return res.status(500).json({
            "message": "Menu could not be retrieved!",
            "error": (error as Error).message
        });
    }
}

export async function handleUpdateDish(req: Request, res: Response) {
    try {
        const dishId = Number(req.params.id);
        
        // Update the specific dish pricing, name, or category
        const updatedDish = await updateDish(dishId, req.body);

        return res.status(200).json({
            "message": "Dish updated successfully",
            "data": updatedDish
        });
    } catch (error) {
        console.error("Dish update failed: ", error);
        return res.status(500).json({
            "message": "Dish could not be updated!",
            "error": (error as Error).message
        });
    }
}

export async function handleDeleteDish(req: Request, res: Response) {
    try {
        const dishId = Number(req.params.id);

        // Remove the dish from the database entirely
        await deleteDish(dishId);

        return res.status(200).json({
            "message": "Dish deleted successfully",
            "data": { id: dishId }
        });
    } catch (error) {
        console.error("Dish deletion failed: ", error);
        return res.status(500).json({
            "message": "Dish could not be deleted!",
            "error": (error as Error).message
        });
    }
}