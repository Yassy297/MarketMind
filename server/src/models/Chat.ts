import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';

export interface IChat extends MongooseDocument {
  userId: Types.ObjectId;
  documentId?: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      default: null
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
