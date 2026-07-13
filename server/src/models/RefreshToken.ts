import mongoose, { Schema, Types, type Document as MongooseDocument } from 'mongoose';

export interface IRefreshToken extends MongooseDocument {
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: {
      type: Date,
      default: undefined
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Mongo TTL index: once a token's expiresAt passes, the document is automatically pruned.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
