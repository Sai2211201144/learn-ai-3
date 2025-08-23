import { Schema, model, Document, Types } from 'mongoose';

export interface IArticle extends Document {
    title: string;
    subtitle: string;
    blogPost: string;
    user: Types.ObjectId;
    course: Types.ObjectId; // The course it was generated from
}

const ArticleSchema = new Schema<IArticle>({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    blogPost: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' }, // Can be optional if generated from standalone creator
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export const Article = model<IArticle>('Article', ArticleSchema);
