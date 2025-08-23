

import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  scalar JSON

  type Quiz {
    q: String!
    options: [String!]!
    answer: Int!
    explanation: String
  }

  type ContentBlock {
    id: String!
    type: String!
    text: String
    code: String
    diagram: String
    quiz: Quiz
    interactiveModel: JSON
    hyperparameterSimulator: JSON
    triageChallenge: JSON
  }

  type ArticleData {
      objective: String!
      contentBlocks: [ContentBlock!]!
  }

  type QuizActivityData {
      description: String!
      questions: [Quiz!]!
  }

  type ProjectActivityData {
      description: String!
      codeStub: String!
      challenge: String!
  }

  type SubtopicData {
      # Article
      objective: String
      contentBlocks: [ContentBlock!]
      # Quiz/Project
      description: String
      questions: [Quiz!]
      codeStub: String
      challenge: String
  }

  type Subtopic {
      id: String!
      title: String!
      type: String!
      notes: String
      data: SubtopicData!
      isAdaptive: Boolean
  }

  type Topic {
    title: String!
    subtopics: [Subtopic!]!
  }

  type PathOverview {
      duration: String!
      totalTopics: Int!
      totalSubtopics: Int!
      keyFeatures: [String!]!
  }

  type InterviewQuestion {
      question: String!
      answer: String!
  }

  type InterviewQuestionSet {
      id: String!
      timestamp: Float!
      difficulty: String!
      questionCount: Int!
      questions: [InterviewQuestion!]!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    about: String!
    category: String!
    technologies: [String!]!
    learningOutcomes: [String!]!
    skills: [String!]!
    overview: PathOverview!
    topics: [Topic!]!
    knowledgeLevel: String!
    progress: JSON
    interviewQuestionSets: [InterviewQuestionSet!]
  }
  
  type ArticleCourseLink {
      id: String!
      title: String!
  }

  type Article {
      id: ID!
      title: String!
      subtitle: String!
      blogPost: String!
      course: ArticleCourseLink
  }

  type Folder {
      id: ID!
      name: String!
      courses: [Course!]!
      articles: [Article!]!
  }

  type ProjectStep {
    id: String!
    title: String!
    description: String!
    codeStub: String!
    challenge: String!
  }

  type ProjectCourseLink {
      id: String!
      title: String!
  }

  type Project {
      id: ID!
      title: String!
      description: String!
      steps: [ProjectStep!]!
      course: ProjectCourseLink
      progress: JSON!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    courses: [Course!]!
    projects: [Project!]!
    articles: [Article!]!
    folders: [Folder!]!
    xp: Int!
    level: Int!
  }

  type ProgressUpdatePayload {
    progress: JSON!
    xp: Int!
    level: Int!
  }

  type LiveInterviewResponse {
      message: String!
  }
  
  # --- INPUTS ---
  
  input QuizInput {
    q: String!
    options: [String!]!
    answer: Int!
    explanation: String
  }

  input ContentBlockInput {
    id: String!
    type: String!
    text: String
    code: String
    diagram: String
    quiz: QuizInput
    interactiveModel: JSON
    hyperparameterSimulator: JSON
    triageChallenge: JSON
  }
  
  input SubtopicDataInput {
      objective: String
      contentBlocks: [ContentBlockInput!]
      description: String
      questions: [QuizInput!]
      codeStub: String
      challenge: String
  }

  input SubtopicInput {
    id: String!
    title: String!
    type: String!
    notes: String
    data: SubtopicDataInput!
    isAdaptive: Boolean
  }

  input TopicInput {
    title: String!
    subtopics: [SubtopicInput!]!
  }

  input PathOverviewInput {
      duration: String!
      totalTopics: Int!
      totalSubtopics: Int!
      keyFeatures: [String!]!
  }

  input CourseInput {
    title: String!
    description: String!
    about: String!
    category: String!
    technologies: [String!]!
    learningOutcomes: [String!]!
    skills: [String!]!
    overview: PathOverviewInput!
    topics: [TopicInput!]!
    knowledgeLevel: String!
  }

  input ArticleCourseLinkInput {
      id: String!
      title: String!
  }

  input ArticleInput {
      title: String!
      subtitle: String!
      blogPost: String!
      course: ArticleCourseLinkInput
  }

  input ProjectStepInput {
      id: String!
      title: String!
      description: String!
      codeStub: String!
      challenge: String!
  }

  input ProjectCourseLinkInput {
      id: String!
      title: String!
  }

  input ProjectInput {
      title: String!
      description: String!
      steps: [ProjectStepInput!]!
      course: ProjectCourseLinkInput!
  }

  input ChatMessageInput {
    role: String!
    content: String!
  }
  
  type Query {
    me(email: String!): User
  }

  type Mutation {
    login(email: String!, name: String!): User!
    createCourse(email: String!, courseInput: CourseInput!): Course!
    deleteCourse(email: String!, courseId: String!): Boolean!
    toggleLessonProgress(email: String!, courseId: String!, lessonId: String!): ProgressUpdatePayload!
    saveNote(email: String!, courseId: String!, lessonId: String!, note: String!): Boolean!
    
    createFolder(email: String!, folderName: String!): Folder!
    updateFolderName(email: String!, folderId: String!, newName: String!): Folder!
    deleteFolder(email: String!, folderId: String!): Boolean!
    moveCourseToFolder(email: String!, courseId: String!, folderId: String): User!

    createProject(email: String!, projectInput: ProjectInput!): Project!
    deleteProject(email: String!, projectId: String!): Boolean!
    toggleProjectStepProgress(email: String!, projectId: String!, stepId: String!): JSON!
    
    createArticle(email: String!, articleInput: ArticleInput!, folderId: String): Article!
    deleteArticle(email: String!, articleId: String!): Boolean!
    moveArticleToFolder(email: String!, articleId: String!, folderId: String): User!

    generateInterviewQuestions(email: String!, courseId: String!, difficulty: String!, count: Int!): Course!
    elaborateAnswer(email: String!, courseId: String!, questionSetId: String!, qIndex: Int!, question: String!, answer: String!): InterviewQuestionSet!
    
    startLiveInterview(email: String!, topic: String!): LiveInterviewResponse!
    sendLiveInterviewMessage(email: String!, topic: String!, history: [ChatMessageInput!]!): LiveInterviewResponse!
  }
`);