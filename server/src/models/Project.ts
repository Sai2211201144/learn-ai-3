
import { Schema, model, Document, Types } from 'mongoose';

// Interface for a single step in the project
export interface IProjectStep extends Document {
    id: string;
    title: string;
    description: string;
    codeStub: string;
    challenge: string;
}

const ProjectStepSchema = new Schema<IProjectStep>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    codeStub: { type: String, required: true },
    challenge: { type: String, required: true },
}, { _id: false });


// Interface for the main Project document
export interface IProject extends Document {
    title: string;
    description: string;
    steps: IProjectStep[];
    course: {
        id: string;
        title: string;
    };
    progress: Map<string, number>; // stepId -> completion timestamp
    user: Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    steps: [ProjectStepSchema],
    course: {
        id: { type: String, required: true },
        title: { type: String, required: true }
    },
    progress: {
        type: Map,
        of: Number,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true, // Ensure virtuals like 'id' are included
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            // Convert Map to object for JSON serialization
            if (ret.progress) {
                (ret as any).progress = Object.fromEntries(ret.progress);
            }
        }
    },
    toObject: {
        virtuals: true, // Ensure virtuals are included when converting to object
    }
});

export const Project = model<IProject>('Project', ProjectSchema);