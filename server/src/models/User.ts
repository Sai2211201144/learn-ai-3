

import { Schema, model, Document, Types } from 'mongoose';

interface ICourseRef {
    _id: Types.ObjectId;
}

interface IFolder extends Document {
    name: string;
    courses: Types.Array<Types.ObjectId>;
    articles: Types.Array<Types.ObjectId>;
}

const FolderSchema = new Schema<IFolder>({
    name: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }]
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});


interface IUser extends Document {
    email: string;
    name: string;
    courses: Types.Array<Types.ObjectId>;
    projects: Types.Array<Types.ObjectId>;
    articles: Types.Array<Types.ObjectId>;
    folders: Types.DocumentArray<IFolder>;
    xp: number;
    level: number;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    name: {
        type: String,
        required: true,
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project',
    }],
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article',
    }],
    folders: [FolderSchema],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            // Also transform folder subdocuments
            if (ret.folders) {
                for (const folder of ret.folders) {
                    if (folder._id) {
                        folder.id = folder._id;
                        delete folder._id;
                    }
                }
            }
        }
    }
});


export const User = model<IUser>('User', UserSchema);