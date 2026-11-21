import { Schema, model } from 'mongoose';

export interface IUser {
  fullName: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { timestamps: true, versionKey: false },
);

export const User = model<IUser>('User', userSchema);
