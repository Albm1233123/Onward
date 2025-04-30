import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, {IUser} from '../models/userModel';

interface DecodedToken {
    id: string;
}

declare module 'express' {
    interface Request {
        user?: IUser; 
    }
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined = req.headers.authorization;
    
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log ('Token recived in middleware:', token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
            console.log ('Decoded token:', decoded);

            req.user = await User.findById(decoded.id).select('-password');

            return next();
        } catch (error) {
            console.error('Error in auth middleware:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
            return
        }
    }

    if(!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return
    }
};

export { protect };