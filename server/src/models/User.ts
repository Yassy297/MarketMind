import mongoose, { Schema, type Document as MongooseDocument } from 'mongoose';

export interface IUser extends MongooseDocument {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  watchlist: string[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    watchlist: {
      type: [String],
      default: []
    },
    avatar: {
      type: String,
      default: undefined,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
