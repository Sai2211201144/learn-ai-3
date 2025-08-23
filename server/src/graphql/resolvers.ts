
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Project } from '../models/Project';
import { Article } from '../models/Article';
import { Types } from 'mongoose';
import * as geminiService from '../services/geminiService';

const XP_PER_LESSON = 100;
const calculateRequiredXp = (level: number) => level * 500;

const getPopulatedUser = async (email: string) => {
    const user = await User.findOne({ email })
        .populate('courses')
        .populate('projects')
        .populate('articles')
        .populate('folders.courses')
        .populate('folders.articles');
    
    if (!user) return null;

    // Mongoose's .toObject() with virtuals is the most reliable way
    const userObject = user.toObject({ virtuals: true });

    // Ensure progress maps are correctly serialized
    if (userObject.courses) {
        for (const course of userObject.courses as any[]) {
            if (course.progress instanceof Map) {
                course.progress = Object.fromEntries(course.progress);
            }
        }
    }
    if (userObject.projects) {
        for (const project of userObject.projects as any[]) {
            if (project.progress instanceof Map) {
                project.progress = Object.fromEntries(project.progress);
            }
        }
    }
    
    return userObject;
}

export const root = {
    // --- QUERIES ---
    me: async ({ email }: { email: string }) => {
        return getPopulatedUser(email);
    },

    // --- MUTATIONS ---
    login: async ({ email, name }: { email: string, name: string }) => {
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, name, courses: [], folders: [], projects: [], articles: [] });
        }
        const populatedUser = await getPopulatedUser(email);
        if (!populatedUser) throw new Error("Failed to retrieve user after login/creation.");
        return populatedUser;
    },

    createCourse: async ({ email, courseInput }: { email: string, courseInput: any }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const newCourse = new Course({ ...courseInput, user: user._id });
        await newCourse.save();
        
        user.courses.push(newCourse._id);
        await user.save();
        
        return newCourse.toObject({ virtuals: true });
    },

    deleteCourse: async ({ email, courseId }: { email: string, courseId: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const courseObjectId = new Types.ObjectId(courseId);

        // Remove from user's course list
        (user.courses as any).pull(courseObjectId);
        // Remove from any folder
        for (const folder of user.folders) {
            (folder.courses as any).pull(courseObjectId);
        }

        await user.save();
        await Course.findByIdAndDelete(courseId);
        
        return true;
    },

    toggleLessonProgress: async ({ email, courseId, lessonId }: { email: string, courseId: string, lessonId: string }) => {
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        const user = await User.findOne({ email });
        if (!user || course.user.toString() !== user._id.toString()) {
            throw new Error("Unauthorized");
        }
        
        const wasCompleted = course.progress.has(lessonId);

        if (wasCompleted) {
            course.progress.delete(lessonId);
            // Note: XP is not removed when un-completing a lesson.
        } else {
            course.progress.set(lessonId, Date.now());
            // Award XP only when completing for the first time
            user.xp += XP_PER_LESSON;
            
            // Check for level up. Use a loop in case of multiple level-ups.
            let requiredXp = calculateRequiredXp(user.level);
            while (user.xp >= requiredXp) {
                user.level += 1;
                user.xp -= requiredXp;
                requiredXp = calculateRequiredXp(user.level);
            }
            
            await user.save();
        }

        await course.save();
        
        return {
            progress: Object.fromEntries(course.progress),
            xp: user.xp,
            level: user.level
        };
    },

    saveNote: async ({ email, courseId, lessonId, note }: { email: string, courseId: string, lessonId: string, note: string }) => {
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        const user = await User.findOne({ email });
        if (!user || course.user.toString() !== user._id.toString()) {
            throw new Error("Unauthorized");
        }
        
        let subtopicFound = false;
        for (const topic of course.topics) {
            const subtopic = topic.subtopics.find((s: any) => s.id === lessonId);
            if (subtopic) {
                subtopic.notes = note;
                subtopicFound = true;
                break;
            }
        }

        if (!subtopicFound) throw new Error("Subtopic not found");

        await course.save();
        return true;
    },

    createFolder: async ({ email, folderName }: { email: string, folderName: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const newFolder = { name: folderName, courses: [], articles: [] };
        user.folders.push(newFolder as any);
        await user.save();

        // Return the newly created folder, which now has an ID
        const createdFolder = user.folders.slice(-1)[0];
        return createdFolder.toObject({ virtuals: true });
    },
    
    updateFolderName: async({ email, folderId, newName }: { email: string, folderId: string, newName: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const folder = user.folders.find(f => f.id === folderId);
        if (folder) {
            folder.name = newName;
            await user.save();
            await user.populate([
                { path: 'folders.courses' },
                { path: 'folders.articles' }
            ]);
            const updatedFolder = user.folders.find(f => f.id === folderId);
            if (!updatedFolder) throw new Error("Folder not found after update.");
            return updatedFolder.toObject({ virtuals: true });
        }
        throw new Error("Folder not found");
    },
    
    deleteFolder: async ({ email, folderId }: { email: string, folderId: string }) => {
        await User.updateOne(
            { email },
            { $pull: { folders: { _id: new Types.ObjectId(folderId) } } }
        );
        return true;
    },
    
    moveCourseToFolder: async ({ email, courseId, folderId }: { email: string, courseId: string, folderId: string | null }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const courseObjectId = new Types.ObjectId(courseId);

        // Remove course from all existing folders first
        for (const folder of user.folders) {
            (folder.courses as any).pull(courseObjectId);
        }
        
        // Add to new folder if one is specified
        if (folderId) {
            const targetFolder = user.folders.find(f => f.id === folderId);
            if (targetFolder) {
                // Avoid duplicates
                if (!targetFolder.courses.some(id => id.toString() === courseObjectId.toString())) {
                    targetFolder.courses.push(courseObjectId);
                }
            } else {
                throw new Error("Target folder not found");
            }
        }

        await user.save();
        
        const populatedUser = await getPopulatedUser(email);
        if (!populatedUser) throw new Error("Failed to retrieve user after moving course.");
        return populatedUser;
    },

    // --- PROJECT MUTATIONS ---

    createProject: async ({ email, projectInput }: { email: string, projectInput: any }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const newProject = new Project({ ...projectInput, user: user._id });
        await newProject.save();

        user.projects.push(newProject._id);
        await user.save();

        return newProject.toObject({ virtuals: true });
    },

    deleteProject: async ({ email, projectId }: { email: string, projectId: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        await Project.deleteOne({ _id: new Types.ObjectId(projectId), user: user._id });
        (user.projects as any).pull(new Types.ObjectId(projectId));
        await user.save();
        
        return true;
    },

    toggleProjectStepProgress: async ({ email, projectId, stepId }: { email: string, projectId: string, stepId: string }) => {
        const project = await Project.findById(projectId);
        if (!project) throw new Error("Project not found");
        
        const user = await User.findOne({ email });
        if (!user || project.user.toString() !== user._id.toString()) {
            throw new Error("Unauthorized");
        }

        if (project.progress.has(stepId)) {
            project.progress.delete(stepId);
        } else {
            project.progress.set(stepId, Date.now());
        }

        await project.save();
        return Object.fromEntries(project.progress);
    },

    // --- ARTICLE MUTATIONS ---

    createArticle: async ({ email, articleInput, folderId }: { email: string, articleInput: any, folderId?: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const newArticle = new Article({ ...articleInput, user: user._id });
        await newArticle.save();

        user.articles.push(newArticle._id);

        if (folderId) {
            const folder = user.folders.find(f => f.id === folderId);
            if (folder) {
                folder.articles.push(newArticle._id);
            }
        }
        
        await user.save();
        return newArticle.toObject({ virtuals: true });
    },

    deleteArticle: async ({ email, articleId }: { email: string, articleId: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const articleObjectId = new Types.ObjectId(articleId);

        // Remove from user's main article list
        (user.articles as any).pull(articleObjectId);
        // Remove from any folder
        for (const folder of user.folders) {
            (folder.articles as any).pull(articleObjectId);
        }
        
        await user.save();
        await Article.findByIdAndDelete(articleId);

        return true;
    },
    
    moveArticleToFolder: async ({ email, articleId, folderId }: { email: string, articleId: string, folderId: string | null }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const articleObjectId = new Types.ObjectId(articleId);

        // Remove article from all existing folders
        for (const folder of user.folders) {
            (folder.articles as any).pull(articleObjectId);
        }

        if (folderId) {
            const targetFolder = user.folders.find(f => f.id === folderId);
            if (targetFolder) {
                if (!targetFolder.articles.some(id => id.toString() === articleObjectId.toString())) {
                    targetFolder.articles.push(articleObjectId);
                }
            } else {
                throw new Error("Target folder not found");
            }
        }

        await user.save();
        
        const populatedUser = await getPopulatedUser(email);
        if (!populatedUser) throw new Error("Failed to retrieve user after moving article.");
        return populatedUser;
    },

    // --- INTERVIEW PREP MUTATIONS ---

    generateInterviewQuestions: async ({ email, courseId, difficulty, count }: { email: string; courseId: string; difficulty: string; count: number; }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const course = await Course.findById(courseId);
        if (!course || course.user.toString() !== user._id.toString()) {
            throw new Error("Course not found or unauthorized");
        }
        
        const existingQuestions = course.interviewQuestionSets?.flatMap(set => set.questions.map(q => q.question)) || [];
        const newQuestions = await geminiService.generateInterviewQuestions(course.title, difficulty, count, existingQuestions);

        const newQuestionSet = {
            id: new Types.ObjectId().toString(),
            timestamp: Date.now(),
            difficulty,
            questionCount: newQuestions.length,
            questions: newQuestions,
        };

        course.interviewQuestionSets = course.interviewQuestionSets || [];
        course.interviewQuestionSets.push(newQuestionSet);
        
        await course.save();
        return course.toObject({ virtuals: true });
    },

    elaborateAnswer: async ({ email, courseId, questionSetId, qIndex, question, answer }: { email: string; courseId: string; questionSetId: string; qIndex: number; question: string; answer: string; }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const course = await Course.findById(courseId);
        if (!course || course.user.toString() !== user._id.toString()) {
            throw new Error("Course not found or unauthorized");
        }

        const elaboratedAnswer = await geminiService.elaborateOnAnswer(question, answer);
        
        const questionSet = course.interviewQuestionSets?.find(set => set.id === questionSetId);
        if (questionSet && questionSet.questions[qIndex]) {
            questionSet.questions[qIndex].answer = elaboratedAnswer;
            await course.save();
            // Mongoose subdocuments don't have a .toObject method by default in this context.
            // We'll manually construct a plain object.
            return {
                id: questionSet.id,
                timestamp: questionSet.timestamp,
                difficulty: questionSet.difficulty,
                questionCount: questionSet.questionCount,
                questions: questionSet.questions.map(q => ({ question: q.question, answer: q.answer }))
            };
        }

        throw new Error("Question set or question index not found");
    },

    // --- LIVE INTERVIEW MUTATIONS ---

    startLiveInterview: async ({ email, topic }: { email: string; topic: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const message = await geminiService.startLiveInterview(topic);
        return { message };
    },

    sendLiveInterviewMessage: async ({ email, topic, history }: { email: string; topic: string; history: any[] }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const message = await geminiService.generateLiveInterviewResponse(topic, history);
        return { message };
    },
};