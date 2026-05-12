import mongoose, { Schema, model, models, type Model } from 'mongoose';
import { nanoid } from 'nanoid';
import slugify from 'slugify';

export interface IPost {
  title: string;
  slug: string;
  content: string;
  author: mongoose.Types.ObjectId;
  published: boolean;
}

export type PostDocument = mongoose.HydratedDocument<IPost>;
export type PostModel = Model<IPost>;

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    // Always set in `pre('save')`; not `required` here because Mongoose validates before save hooks.
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: { type: String, required: true, default: '' },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

postSchema.pre('save', function (next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (!this.isModified('title') && !this.isNew) {
    return next();
  }

  const base =
    slugify(String(this.title), {
      lower: true,
      strict: true,
      trim: true,
    }) || 'post';

  this.slug = `${base}-${nanoid(6)}`;
  next();
});

export const Post: PostModel =
  (models.Post as PostModel | undefined) ?? model<IPost>('Post', postSchema);
