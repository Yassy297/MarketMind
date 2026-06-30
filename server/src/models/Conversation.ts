import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';

export interface IConversation extends MongooseDocument {
  userId: Types.ObjectId;
  title?: string;
  messages: { role: string; text: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: { type: String, required: false },
    messages: { type: [{ role: String, text: String, createdAt: Date }], default: [] }
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, createdAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
