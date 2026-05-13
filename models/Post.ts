import mongoose, { Schema, model, models, type Model } from 'mongoose';
import { nanoid } from 'nanoid';
import slugify from 'slugify';

export interface IPost {
  title: string;
  slug: string;
  content: string;
  author: mongoose.Types.ObjectId;
  published: boolean;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
}

export type PostDocument = mongoose.HydratedDocument<IPost>;
export type PostModel = Model<IPost>;

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    published: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [], index: true },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true },
);

postSchema.pre('save', async function () {
  if (!this.isModified('title') && !this.isNew) return;
  const base = slugify(this.title as string, { lower: true, strict: true, trim: true }) || 'post';
  this.slug = `${base}-${nanoid(6)}`;
});

export const Post: PostModel =
  (models.Post as PostModel | undefined) ?? model<IPost>('Post', postSchema);