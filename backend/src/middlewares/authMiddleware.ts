import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../services/authService';

// Extend the Express Request interface to include the decoded user payload
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                role: string;
            };
        }
    }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            "message": "Authentication failed",
            "error": "Missing or invalid authorization header"
        });
    }

    // Cast index access to string to satisfy strict type checking
    const token = authHeader.split(' ')[1] as string;

    try {
        // Check if the token has been explicitly invalidated via logout
        const isRevoked = await isTokenBlacklisted(token);
        if (isRevoked) {
            return res.status(401).json({
                "message": "Authentication failed",
                "error": "Token has been invalidated. Please log in again."
            });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret) as unknown as { userId: number, role: string };

        req.user = decoded;
        next();
    }
    catch(error) {
        console.error("JWT Verification failed: ", error);
        return res.status(401).json({
            "message": "Authentication failed",
            "error": "Invalid or expired token"
        });
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    // Check if the user object exists and has the admin role
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            "message": "Authorization failed",
            "error": "Admin access required for this action"
        });
    }

    // Proceed to the next middleware or route handler if authorized
    next();
}

export function requireCustomer(req: Request, res: Response, next: NextFunction) {
    // Check if the user object exists and has the customer role
    if (!req.user || req.user.role !== 'CUSTOMER') {
        return res.status(403).json({
            "message": "Authorization failed",
            "error": "This action is available to customers only"
        });
    }

    // Proceed to the next middleware or route handler if authorized
    next();
}