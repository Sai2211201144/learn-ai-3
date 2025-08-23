
import { Schema, model, Document, Types } from 'mongoose';

// --- Sub-document Schemas ---

const QuizSchema = new Schema({
  q: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: Number, required: true },
  explanation: String,
}, { _id: false });

const InteractiveModelSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    layers: [{
        type: { type: String, enum: ['input', 'hidden', 'output'], required: true },
        neurons: { type: Number, required: true },
        activation: { type: String, enum: ['relu', 'sigmoid', 'tanh'] }
    }],
    sampleInput: { type: [Number], required: true },
    expectedOutput: { type: [Number], required: true },
}, { _id: false });

const HyperparameterSimulatorSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    parameters: [{
        name: { type: String, required: true },
        options: [{
            label: { type: String, required: true },
            description: { type: String, required: true }
        }]
    }],
    outcomes: [{
        combination: { type: String, required: true },
        result: {
            trainingLoss: [Number],
            validationLoss: [Number],
            description: String,
        }
    }]
}, { _id: false });

const TriageChallengeSchema = new Schema({
    scenario: { type: String, required: true },
    evidence: { type: String, required: true },
    options: [{
        title: { type: String, required: true },
        description: { type: String, required: true }
    }],
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
}, { _id: false });

const ContentBlockSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ['text', 'code', 'quiz', 'diagram', 'interactiveModel', 'hyperparameterSimulator', 'triageChallenge'] },
  text: String,
  code: String,
  diagram: String,
  quiz: QuizSchema,
  interactiveModel: InteractiveModelSchema,
  hyperparameterSimulator: HyperparameterSimulatorSchema,
  triageChallenge: TriageChallengeSchema,
}, { _id: false });

const ArticleDataSchema = new Schema({
    objective: String,
    contentBlocks: [ContentBlockSchema],
}, { _id: false });

const QuizActivityDataSchema = new Schema({
    description: String,
    questions: [QuizSchema],
}, { _id: false });

const ProjectActivityDataSchema = new Schema({
    description: String,
    codeStub: String,
    challenge: String,
}, { _id: false });

const SubtopicSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['article', 'quiz', 'project'] },
  notes: String,
  data: {
      type: new Schema({
          objective: String,
          contentBlocks: [ContentBlockSchema],
          description: String,
          questions: [QuizSchema],
          codeStub: String,
          challenge: String,
      }, { _id: false, strict: false })
  }
}, { _id: false });

const TopicSchema = new Schema({
  title: { type: String, required: true },
  subtopics: [SubtopicSchema],
}, { _id: false });

const InterviewQuestionSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
}, { _id: false });

const InterviewQuestionSetSchema = new Schema({
    id: { type: String, required: true },
    timestamp: { type: Number, required: true },
    difficulty: { type: String, required: true },
    questionCount: { type: Number, required: true },
    questions: [InterviewQuestionSchema],
}, { _id: false });


// --- Main Course Schema ---

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  topics: any[]; // Using `any` to avoid excessive Mongoose subdocument typing
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  progress: Map<string, number>;
  user: Types.ObjectId;
  about: string;
  overview: {
      duration: string;
      totalTopics: number;
      totalSubtopics: number;
      keyFeatures: string[];
  };
  learningOutcomes: string[];
  skills: string[];
  interviewQuestionSets?: any[];
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  about: { type: String, required: true },
  category: { type: String, required: true },
  technologies: [String],
  learningOutcomes: [String],
  skills: [String],
  overview: {
      duration: String,
      totalTopics: Number,
      totalSubtopics: Number,
      keyFeatures: [String],
  },
  topics: [TopicSchema],
  knowledgeLevel: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
  progress: {
      type: Map,
      of: Number, // subtopicId -> completion timestamp
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  interviewQuestionSets: [InterviewQuestionSetSchema]
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

export const Course = model<ICourse>('Course', CourseSchema);
