import mongoose, { Schema, model, models, type Model } from 'mongoose';

export interface IComment {
  body: string;
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
}

export type CommentDocument = mongoose.HydratedDocument<IComment>;
export type CommentModel = Model<IComment>;

const commentSchema = new Schema<IComment>(
  {
    body: { type: String, required: true, trim: true, maxlength: 10_000 },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, createdAt: 1 });

export const Comment: CommentModel =
  (models.Comment as CommentModel | undefined) ??
  model<IComment>('Comment', commentSchema);
