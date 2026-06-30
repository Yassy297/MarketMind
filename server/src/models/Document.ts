import mongoose, { Schema, type Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  title: string;
  content: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    source: { type: String }
  },
  { timestamps: true }
);

export const Document = mongoose.model<IDocument>('Document', documentSchema);
import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';

export interface IDocument extends MongooseDocument {
  userId: Types.ObjectId;
  title: string;
  filename: string;
  fileType: string;
  storagePath: string;
  extractedText?: string;
  embeddingStatus: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    fileType: {
      type: String,
      required: true,
      trim: true
    },
    storagePath: {
      type: String,
      required: true,
      trim: true
    },
    extractedText: {
      type: String,
      default: ''
    },
    embeddingStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

export const Document = mongoose.model<IDocument>('Document', documentSchema);
