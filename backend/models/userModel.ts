import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
})

userSchema.pre<IUser>('save', async function (next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.Password);
}

const User = model<IUser>('User', userSchema);
export default User;