import mongoose, { Schema, type Document as MongooseDocument } from 'mongoose';

export interface IConversation extends MongooseDocument {
  title?: string;
  messages: { role: string; text: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    title: { type: String, required: false },
    messages: { type: [{ role: String, text: String, createdAt: Date }], default: [] }
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
