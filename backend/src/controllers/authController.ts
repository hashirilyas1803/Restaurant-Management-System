import { Request, Response } from 'express';
import { 
    registerUser, 
    loginUser, 
    getUserById, 
    updateUser, 
    deleteUser, 
    RegisterData, 
    LoginData, 
    UpdateUserData, 
    blacklistToken
} from '../services/authService';

export async function handleRegister(req: Request, res: Response) {
    try {
        // Construct the registration data object from the request body
        const data: RegisterData = {
            name: req.body.name,
            email: req.body.email,
            passwordRaw: req.body.password,
            phone_number: req.body.phone_number
        };

        // Create the user using the service layer
        const user = await registerUser(data);

        // Return the response in case of success
        return res.status(201).json({
            "message": "User registered successfully",
            "data": user
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("User registration failed at the service layer! ", error);
        return res.status(400).json({
            "message": "User could not be registered!",
            "error": (error as Error).message
        });
    }
}

export async function handleLogin(req: Request, res: Response) {
    try {
        // Construct the login data object from the request body
        const data: LoginData = {
            email: req.body.email,
            passwordRaw: req.body.password
        };

        // Authenticate the user using the service layer
        const result = await loginUser(data);

        // Return the response in case of success
        return res.status(200).json({
            "message": "User logged in successfully",
            "data": result
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("User login failed at the service layer! ", error);
        return res.status(401).json({
            "message": "Login failed!",
            "error": (error as Error).message
        });
    }
}

export async function handleGetUserProfile(req: Request, res: Response) {
    try {
        // Retrieve the requested user ID from the parameters
        const requestedUserId = Number(req.params.id);

        // Ensure users can only access their own profile unless they are an admin
        if (req.user?.userId !== requestedUserId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                "message": "Access denied",
                "error": "You do not have permission to view this profile"
            });
        }

        // Retrieve the user using the service layer
        const user = await getUserById(requestedUserId);

        // Return the response in case of success
        return res.status(200).json({
            "message": "User profile retrieved successfully",
            "data": user
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("User retrieval failed at the service layer! ", error);
        return res.status(404).json({
            "message": "User could not be retrieved!",
            "error": (error as Error).message
        });
    }
}

export async function handleUpdateUser(req: Request, res: Response) {
    try {
        // Retrieve the requested user ID from the parameters
        const requestedUserId = Number(req.params.id);

        // Ensure users can only update their own profile unless they are an admin
        if (req.user?.userId !== requestedUserId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                "message": "Access denied",
                "error": "You do not have permission to update this profile"
            });
        }

        // Construct the update payload from the request body
        const dataForUpdate: UpdateUserData = {
            name: req.body.name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            passwordRaw: req.body.password
        };

        // Update the user using the service layer
        const updatedUser = await updateUser(requestedUserId, dataForUpdate);

        // Return the response in case of success
        return res.status(200).json({
            "message": "User updated successfully",
            "data": updatedUser
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("User update failed at the service layer! ", error);
        return res.status(400).json({
            "message": "User could not be updated!",
            "error": (error as Error).message
        });
    }
}

export async function handleDeleteUser(req: Request, res: Response) {
    try {
        // Retrieve the requested user ID from the parameters
        const requestedUserId = Number(req.params.id);

        // Ensure users can only delete their own profile unless they are an admin
        if (req.user?.userId !== requestedUserId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                "message": "Access denied",
                "error": "You do not have permission to delete this profile"
            });
        }

        // Delete the user using the service layer
        await deleteUser(requestedUserId);

        // Return the No Content status code for a successful delete operation
        return res.status(200).json({
            "message": "User deleted successfully",
            "data": { id: requestedUserId }
        });
    }
    catch(error) {
        // Return an error in case of an exception and log the error
        console.error("User deletion failed at the service layer! ", error);
        return res.status(500).json({
            "message": "User could not be deleted!",
            "error": (error as Error).message
        });
    }
}

export async function handleLogout(req: Request, res: Response) {
    try {
        const authHeader = req.headers.authorization;

        // Verify the presence of the authorization header
        if (!authHeader) {
            return res.status(401).json({
                "message": "Logout failed",
                "error": "Missing authorization header"
            });
        }

        // Extract and cast the token to string
        const token = authHeader.split(' ')[1] as string;

        if (!token) {
            return res.status(401).json({
                "message": "Logout failed",
                "error": "Invalid token format"
            });
        }

        // Persist the token to the blacklist via the service layer
        await blacklistToken(token);

        return res.status(200).json({
            "message": "User logged out successfully. Token invalidated.",
            "data": null
        });
    }
    catch(error) {
        // Handle potential database or logic errors during logout
        console.error("Logout failed at the service layer: ", error);
        return res.status(500).json({
            "message": "Logout failed!",
            "error": (error as Error).message
        });
    }
}