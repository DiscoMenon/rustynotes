import mongoose, { Schema, model, models, type Model } from 'mongoose';

export interface IUser {
  email: string;
  name: string;
  passwordHash?: string;
  image?: string;
}

export type UserDocument = mongoose.HydratedDocument<IUser>;
export type UserModel = Model<IUser>;

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, select: false },
    image: { type: String },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });

export const User: UserModel =
  (models.User as UserModel | undefined) ?? model<IUser>('User', userSchema);
