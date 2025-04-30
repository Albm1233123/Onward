import User from '../models/userModel';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// {} = Params, Body, Headers, and Query types

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '1d',
    });
}

interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const registerUser = async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
    const { firstName, lastName, email, password } = req.body;

    try{
        const userExists = await User.findOne({ email });
        if(userExists) {
            res.status(400).json({ message: 'User already exists' });
            return
        }
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
        });

        if(user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                token: generateToken(user._id as string)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

interface LoginRequest {
    email: string;
    password: string;
}

const loginUser = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const {email , password} = req.body;

    try{
        const user = await User.findOne({ email });
        
        if(user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                token: generateToken(user._id as string)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// make get profile later

export { registerUser, loginUser };
