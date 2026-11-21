import { Schema, model } from 'mongoose';

export interface ITeacher {
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    specialization: { type: String, required: true, trim: true, maxlength: 120 },
    experience: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false },
);

teacherSchema.index({ email: 1 });

export const Teacher = model<ITeacher>('Teacher', teacherSchema);
