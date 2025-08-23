

import { Course, KnowledgeLevel, Project, InterviewQuestionSet, ChatMessage, Article } from '../types';

const API_URL = '/graphql';

async function graphqlRequest(query: string, variables: Record<string, any> = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const { data, errors } = await response.json();

        if (errors) {
            console.error('GraphQL Errors:', errors);
            throw new Error(errors[0].message || 'An error occurred with the API request.');
        }

        return data;
    } catch (error) {
        console.error('Network or API Error:', error);
        throw error;
    }
}

const USER_DATA_FRAGMENT = `
    id
    email
    name
    xp
    level
    courses {
        id
        title
        description
        about
        category
        technologies
        learningOutcomes
        skills
        overview {
            duration
            totalTopics
            totalSubtopics
            keyFeatures
        }
        knowledgeLevel
        progress
        interviewQuestionSets {
            id
            timestamp
            difficulty
            questionCount
            questions {
                question
                answer
            }
        }
        topics {
            title
            subtopics {
                id
                title
                type
                notes
                isAdaptive
                data {
                    objective
                    contentBlocks {
                        id
                        type
                        text
                        code
                        diagram
                        quiz { q options answer explanation }
                        interactiveModel
                        hyperparameterSimulator
                        triageChallenge
                    }
                    description
                    questions { q options answer explanation }
                    codeStub
                    challenge
                }
            }
        }
    }
    projects {
        id
        title
        description
        steps { id title description codeStub challenge }
        course { id title }
        progress
    }
    articles {
        id
        title
        subtitle
        blogPost
        course { id title }
    }
    folders {
        id
        name
        courses {
            id
        }
        articles {
            id
        }
    }
`;

export const login = (email: string, name: string) => {
    const mutation = `
        mutation Login($email: String!, $name: String!) {
            login(email: $email, name: $name) {
                ${USER_DATA_FRAGMENT}
            }
        }
    `;
    return graphqlRequest(mutation, { email, name });
};


export const getMyData = (email: string) => {
    const query = `
      query GetMyData($email: String!) {
        me(email: $email) {
            ${USER_DATA_FRAGMENT}
        }
      }
    `;
    return graphqlRequest(query, { email });
};

export const createCourse = (email: string, courseInput: Omit<Course, 'id' | 'progress'>) => {
    const mutation = `
        mutation CreateCourse($email: String!, $courseInput: CourseInput!) {
            createCourse(email: $email, courseInput: $courseInput) {
                id
                title
            }
        }
    `;
    return graphqlRequest(mutation, { email, courseInput });
};

export const deleteCourse = (email: string, courseId: string) => {
    const mutation = `
        mutation DeleteCourse($email: String!, $courseId: String!) {
            deleteCourse(email: $email, courseId: $courseId)
        }
    `;
    return graphqlRequest(mutation, { email, courseId });
};

export const toggleLessonProgress = (email: string, courseId: string, lessonId: string) => {
    const mutation = `
        mutation ToggleLessonProgress($email: String!, $courseId: String!, $lessonId: String!) {
            toggleLessonProgress(email: $email, courseId: $courseId, lessonId: $lessonId) {
                progress
                xp
                level
            }
        }
    `;
    return graphqlRequest(mutation, { email, courseId, lessonId });
};

export const saveNote = (email: string, courseId: string, lessonId: string, note: string) => {
    const mutation = `
        mutation SaveNote($email: String!, $courseId: String!, $lessonId: String!, $note: String!) {
            saveNote(email: $email, courseId: $courseId, lessonId: $lessonId, note: $note)
        }
    `;
    return graphqlRequest(mutation, { email, courseId, lessonId, note });
};

export const createFolder = (email: string, folderName: string) => {
    const mutation = `
        mutation CreateFolder($email: String!, $folderName: String!) {
            createFolder(email: $email, folderName: $folderName) {
                id
                name
                courses { id }
                articles { id }
            }
        }
    `;
    return graphqlRequest(mutation, { email, folderName });
};

export const updateFolderName = (email: string, folderId: string, newName: string) => {
    const mutation = `
        mutation UpdateFolderName($email: String!, $folderId: String!, $newName: String!) {
            updateFolderName(email: $email, folderId: $folderId, newName: $newName) {
                id
                name
                courses { id }
                articles { id }
            }
        }
    `;
    return graphqlRequest(mutation, { email, folderId, newName });
};

export const deleteFolder = (email: string, folderId: string) => {
    const mutation = `
        mutation DeleteFolder($email: String!, $folderId: String!) {
            deleteFolder(email: $email, folderId: $folderId)
        }
    `;
    return graphqlRequest(mutation, { email, folderId });
};

export const moveCourseToFolder = (email: string, courseId: string, folderId: string | null) => {
    const mutation = `
        mutation MoveCourseToFolder($email: String!, $courseId: String!, $folderId: String) {
            moveCourseToFolder(email: $email, courseId: $courseId, folderId: $folderId) {
                id
                folders {
                    id
                    name
                    courses { id }
                    articles { id }
                }
            }
        }
    `;
    return graphqlRequest(mutation, { email, courseId, folderId });
};

// --- Article API Calls ---
export const createArticle = (email: string, articleInput: Omit<Article, 'id'>, folderId: string | null) => {
    const mutation = `
        mutation CreateArticle($email: String!, $articleInput: ArticleInput!, $folderId: String) {
            createArticle(email: $email, articleInput: $articleInput, folderId: $folderId) {
                id
                title
                subtitle
                blogPost
                course { id title }
            }
        }
    `;
    return graphqlRequest(mutation, { email, articleInput, folderId });
};

export const deleteArticle = (email: string, articleId: string) => {
    const mutation = `
        mutation DeleteArticle($email: String!, $articleId: String!) {
            deleteArticle(email: $email, articleId: $articleId)
        }
    `;
    return graphqlRequest(mutation, { email, articleId });
};

export const moveArticleToFolder = (email: string, articleId: string, folderId: string | null) => {
    const mutation = `
        mutation MoveArticleToFolder($email: String!, $articleId: String!, $folderId: String) {
            moveArticleToFolder(email: $email, articleId: $articleId, folderId: $folderId) {
                id
                folders {
                    id
                    name
                    courses { id }
                    articles { id }
                }
            }
        }
    `;
    return graphqlRequest(mutation, { email, articleId, folderId });
};


// --- Project API Calls ---

export const createProject = (email: string, projectInput: Omit<Project, 'id' | 'progress'>) => {
    const mutation = `
        mutation CreateProject($email: String!, $projectInput: ProjectInput!) {
            createProject(email: $email, projectInput: $projectInput) {
                id
                title
                description
                steps { id title description codeStub challenge }
                course { id title }
                progress
            }
        }
    `;
    return graphqlRequest(mutation, { email, projectInput });
};

export const deleteProject = (email: string, projectId: string) => {
    const mutation = `
        mutation DeleteProject($email: String!, $projectId: String!) {
            deleteProject(email: $email, projectId: $projectId)
        }
    `;
    return graphqlRequest(mutation, { email, projectId });
};

export const toggleProjectStepProgress = (email: string, projectId: string, stepId: string) => {
    const mutation = `
        mutation ToggleProjectStepProgress($email: String!, $projectId: String!, $stepId: String!) {
            toggleProjectStepProgress(email: $email, projectId: $projectId, stepId: $stepId)
        }
    `;
    return graphqlRequest(mutation, { email, projectId, stepId });
};

// --- Interview Prep API Calls ---

export const generateInterviewQuestions = (email: string, courseId: string, difficulty: KnowledgeLevel, count: number) => {
    const mutation = `
        mutation GenerateInterviewQuestions($email: String!, $courseId: String!, $difficulty: String!, $count: Int!) {
            generateInterviewQuestions(email: $email, courseId: $courseId, difficulty: $difficulty, count: $count) {
                 id
                 interviewQuestionSets {
                    id timestamp difficulty questionCount questions { question answer }
                }
            }
        }
    `;
    return graphqlRequest(mutation, { email, courseId, difficulty, count });
};

export const elaborateAnswer = (email: string, courseId: string, questionSetId: string, qIndex: number, question: string, answer: string): Promise<{ elaborateAnswer: InterviewQuestionSet }> => {
    const mutation = `
        mutation ElaborateAnswer($email: String!, $courseId: String!, $questionSetId: String!, $qIndex: Int!, $question: String!, $answer: String!) {
            elaborateAnswer(email: $email, courseId: $courseId, questionSetId: $questionSetId, qIndex: $qIndex, question: $question, answer: $answer) {
                id
                timestamp
                difficulty
                questionCount
                questions {
                    question
                    answer
                }
            }
        }
    `;
    return graphqlRequest(mutation, { email, courseId, questionSetId, qIndex, question, answer });
};

// --- Live Interview API Calls ---

export const startLiveInterview = (email: string, topic: string): Promise<{ startLiveInterview: { message: string } }> => {
    const mutation = `
        mutation StartLiveInterview($email: String!, $topic: String!) {
            startLiveInterview(email: $email, topic: $topic) {
                message
            }
        }
    `;
    return graphqlRequest(mutation, { email, topic });
};

export const sendLiveInterviewMessage = (email: string, topic: string, history: ChatMessage[]): Promise<{ sendLiveInterviewMessage: { message: string } }> => {
    const mutation = `
        mutation SendLiveInterviewMessage($email: String!, $topic: String!, $history: [ChatMessageInput!]!) {
            sendLiveInterviewMessage(email: $email, topic: $topic, history: $history) {
                message
            }
        }
    `;
    return graphqlRequest(mutation, { email, topic, history });
};