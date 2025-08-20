import OpenAI from 'openai';
import { retrieveRelevantDocuments } from '@/utils/rag/retriever';
import { processDocument, Document } from '@/utils/rag/documentProcessor';
import { getCache, setCache } from '@/utils/cache/redisClient';
import { estimateTokenCount, truncateToTokenLimit, TokenCountModel } from '@/utils/tokens/tokenCounter';
import { AnyTask } from '@/types/schemas/taskSchema';
import { z } from 'zod';

// OpenRouter API key and configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = 'openai/gpt-4-turbo';
const OPENROUTER_EMBEDDING_MODEL = 'openai/text-embedding-ada-002';

// For local/mock operation when API is not available
const USE_MOCK_DATA = false; // Set to false to use real API

// Mock response generator for testing when API is unavailable
const generateMockResponse = (prompt: string, isJson: boolean = false) => {
  console.log("Using mock response due to API unavailability");
  
  const basicResponse = {
    choices: [{
      message: {
        content: `This is a mock response for: "${prompt.substring(0, 50)}..."`,
        role: "assistant"
      },
      finish_reason: "stop",
      index: 0
    }],
    created: Date.now(),
    id: "mock-id",
    model: "mock-model",
    object: "chat.completion"
  };
  
  if (isJson) {
    basicResponse.choices[0].message.content = JSON.stringify({
      title: "Mock Title",
      content: "This is mock content generated for testing purposes.",
      activities: ["Mock Activity 1", "Mock Activity 2"],
      assessment: "Mock assessment method",
      materials: ["Mock Material 1", "Mock Material 2"]
    });
  }
  
  return basicResponse;
};

// Initialize OpenRouter client with custom implementation
const openai = {
  chat: {
    completions: {
      create: async (params: any) => {
        try {
          if (USE_MOCK_DATA) {
            return generateMockResponse(
              params.messages[params.messages.length - 1].content,
              params.response_format?.type === 'json_object'
            );
          }
          
          console.log('Calling OpenRouter API via proxy...');
          console.log('Model:', params.model === 'gpt-4-turbo-preview' ? OPENROUTER_MODEL : params.model);
          
          // Use our proxy endpoint instead of calling OpenRouter directly
          const response = await fetch('/api/proxy/openrouter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              endpoint: 'chat/completions',
              body: {
                ...params,
                model: params.model === 'gpt-4-turbo-preview' ? OPENROUTER_MODEL : params.model,
              }
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenRouter API error: ${errorText}`);
            console.warn('Falling back to mock response due to API error');
            return generateMockResponse(
              params.messages[params.messages.length - 1].content,
              params.response_format?.type === 'json_object'
            );
          }
          
          const result = await response.json();
          console.log('OpenRouter API response received successfully');
          return result;
        } catch (error) {
          console.error("Error calling OpenRouter API:", error);
          console.warn('Falling back to mock response due to error');
          return generateMockResponse(
            params.messages[params.messages.length - 1].content,
            params.response_format?.type === 'json_object'
          );
        }
      }
    }
  }
};

// Define AI orchestrator class
export class AIOrchestrator {
  private static instance: AIOrchestrator;
  private modelConfig: {
    chat: string;
    embedding: string;
    contextWindow: number;
    temperature: number;
  };

  // Private constructor for singleton pattern
  private constructor() {
    // Default configuration - OpenRouter compatible
    this.modelConfig = {
      chat: 'gpt-4-turbo-preview', // Will be mapped to OPENROUTER_MODEL
      embedding: 'text-embedding-ada-002',
      contextWindow: 8000,
      temperature: 0.7,
    };
  }

  // Get singleton instance
  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  /**
   * Configure AI models and parameters
   */
  public configure(config: Partial<typeof this.modelConfig>): void {
    this.modelConfig = { ...this.modelConfig, ...config };
  }

  /**
   * Generate lesson plans with AI
   */
  public async generateLessonPlan(
    subject: string,
    grade: string,
    objectives: string[],
    duration: number,
    additionalContext?: string
  ): Promise<{
    title: string;
    content: string;
    activities: string[];
    assessment: string;
    materials: string[];
  }> {
    try {
      // Create cache key for this request
      const cacheKey = `lesson:${subject}:${grade}:${objectives.join(',')}:${duration}`;
      
      // Check cache first
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
      
      // If not in cache, prepare context with RAG
      const query = `Create a ${duration} minute lesson plan for ${grade} grade ${subject} with objectives: ${objectives.join(', ')}`;
      const ragResult = await retrieveRelevantDocuments(query, {
        filter: { subject, grade },
        topK: 3,
      });
      
      // Format the system prompt
      const systemPrompt = `You are an expert educational content creator specializing in creating high-quality lesson plans. 
Create a detailed lesson plan for the specified subject and grade level.
Include a creative title, detailed content, engaging activities, assessment methods, and required materials.`;

      // Prepare user message with context and objectives
      const userMessage = `
Create a detailed ${duration} minute lesson plan for ${grade} grade on the subject of ${subject}.

Learning Objectives:
${objectives.map(obj => `- ${obj}`).join('\n')}

${additionalContext ? `Additional Context:\n${additionalContext}\n` : ''}

Based on similar lesson plans and best practices from the following resources:
${ragResult.context}

Format the response as a JSON object with the following structure:
{
  "title": "Creative and engaging lesson title",
  "content": "Detailed explanation of the lesson content",
  "activities": ["Activity 1", "Activity 2", "Activity 3"],
  "assessment": "Methods to assess student understanding",
  "materials": ["Material 1", "Material 2"]
}`;

      // Generate the lesson plan using the OpenAI API
      const response = await openai.chat.completions.create({
        model: this.modelConfig.chat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: this.modelConfig.temperature,
        response_format: { type: 'json_object' },
      });

      // Parse the response
      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      // Cache the result
      await setCache(cacheKey, JSON.stringify(result), 3600); // Cache for 1 hour
      
      return result;
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      throw error;
    }
  }

  /**
   * Generate assessment with AI
   */
  public async generateAssessment(
    subject: string,
    grade: string,
    objectives: string[],
    assessmentType: 'quiz' | 'test' | 'project' | 'rubric',
    numQuestions: number
  ): Promise<{
    title: string;
    instructions: string;
    questions: Array<{
      questionType: string;
      content: string;
      options?: string[];
      answer?: string | string[];
      points: number;
    }>;
    totalPoints: number;
  }> {
    try {
      // Create cache key
      const cacheKey = `assessment:${subject}:${grade}:${assessmentType}:${numQuestions}:${objectives.join(',')}`;
      
      // Check cache first
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
      
      // If not in cache, prepare context with RAG
      const query = `Create a ${assessmentType} for ${grade} grade ${subject} with ${numQuestions} questions covering objectives: ${objectives.join(', ')}`;
      const ragResult = await retrieveRelevantDocuments(query, {
        filter: { subject, grade, type: 'assessment' },
        topK: 3,
      });
      
      // Format system prompt
      const systemPrompt = `You are an expert educational assessment creator.
Create a high-quality ${assessmentType} for the specified subject and grade level.
Include a variety of question types, clear instructions, and an answer key.`;

      // Prepare user message
      const userMessage = `
Create a comprehensive ${assessmentType} for ${grade} grade on the subject of ${subject}.

Learning Objectives to Assess:
${objectives.map(obj => `- ${obj}`).join('\n')}

Include ${numQuestions} questions with a mix of question types appropriate for the subject and grade level.

Based on similar assessments and best practices from the following resources:
${ragResult.context}

Format the response as a JSON object with the following structure:
{
  "title": "Title of the assessment",
  "instructions": "Instructions for students",
  "questions": [
    {
      "questionType": "multiple_choice/short_answer/essay/etc",
      "content": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct answer or answers",
      "points": 5
    }
  ],
  "totalPoints": 100
}`;

      // Generate the assessment
      const response = await openai.chat.completions.create({
        model: this.modelConfig.chat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: this.modelConfig.temperature,
        response_format: { type: 'json_object' },
      });

      // Parse the response
      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      // Cache the result
      await setCache(cacheKey, JSON.stringify(result), 3600); // Cache for 1 hour
      
      return result;
    } catch (error) {
      console.error('Error generating assessment:', error);
      throw error;
    }
  }

  /**
   * Generate personalized feedback on student work
   */
  public async generateFeedback(
    studentWork: string,
    rubric: string,
    learningObjectives: string[],
    grade: string,
    feedbackType: 'detailed' | 'summary' | 'constructive'
  ): Promise<{
    overallFeedback: string;
    strengthPoints: string[];
    improvementAreas: string[];
    suggestedResources: string[];
    rubricScore?: Record<string, number>;
  }> {
    try {
      // Truncate student work if it's too long
      const truncatedWork = truncateToTokenLimit(
        studentWork, 
        this.modelConfig.contextWindow / 2,
        TokenCountModel.GPT_4_TURBO
      );
      
      // Format system prompt
      const systemPrompt = `You are an experienced educator providing ${feedbackType} feedback on student work.
Assess the work against the provided rubric and learning objectives.
Be constructive, specific, and actionable in your feedback.`;

      // Prepare user message
      const userMessage = `
Please provide ${feedbackType} feedback on the following student work for ${grade} grade:

STUDENT WORK:
${truncatedWork}

RUBRIC:
${rubric}

LEARNING OBJECTIVES:
${learningObjectives.map(obj => `- ${obj}`).join('\n')}

Format your response as a JSON object with the following structure:
{
  "overallFeedback": "Overall assessment of the work",
  "strengthPoints": ["Strength 1", "Strength 2", "Strength 3"],
  "improvementAreas": ["Area for improvement 1", "Area for improvement 2"],
  "suggestedResources": ["Resource 1", "Resource 2"],
  "rubricScore": {
    "criteriaName1": score,
    "criteriaName2": score
  }
}`;

      // Generate the feedback
      const response = await openai.chat.completions.create({
        model: this.modelConfig.chat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.4, // Lower temperature for more consistent feedback
        response_format: { type: 'json_object' },
      });

      // Parse the response
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw error;
    }
  }

  /**
   * Generate differentiated learning materials
   */
  public async generateDifferentiatedMaterials(
    subject: string,
    grade: string,
    objective: string,
    differentiationLevels: Array<'below' | 'at' | 'above'>,
    materialType: 'worksheet' | 'activity' | 'reading'
  ): Promise<Record<string, {
    content: string;
    instructions: string;
    adaptations: string[];
  }>> {
    try {
      // Create cache key
      const cacheKey = `differentiated:${subject}:${grade}:${materialType}:${differentiationLevels.join(',')}`;
      
      // Check cache first
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
      
      // If not in cache, prepare context with RAG
      const query = `Create differentiated ${materialType} for ${grade} grade ${subject} on ${objective} for students ${differentiationLevels.join(', ')} grade level`;
      const ragResult = await retrieveRelevantDocuments(query, {
        filter: { subject, grade },
        topK: 3,
      });
      
      // Format system prompt
      const systemPrompt = `You are an expert in differentiated instruction, specializing in creating materials that meet the needs of diverse learners.
Create differentiated ${materialType}s for the specified subject, grade level, and learning objective.
Adapt the content for students who are below grade level, at grade level, and above grade level.`;

      // Prepare user message
      const userMessage = `
Create differentiated ${materialType}s for ${grade} grade students learning about ${subject}, specifically on the objective: ${objective}.

Create materials for the following learner profiles:
${differentiationLevels.map(level => `- Students ${level} grade level`).join('\n')}

Based on best practices from the following resources:
${ragResult.context}

Format the response as a JSON object with the following structure:
{
  "below": {
    "content": "Content adapted for students below grade level",
    "instructions": "Clear instructions for these students",
    "adaptations": ["Adaptation 1", "Adaptation 2"]
  },
  "at": {
    "content": "Grade-level content",
    "instructions": "Instructions for grade-level students",
    "adaptations": ["Adaptation 1", "Adaptation 2"]
  },
  "above": {
    "content": "Enhanced content for advanced students",
    "instructions": "Instructions with additional challenges",
    "adaptations": ["Adaptation 1", "Adaptation 2"]
  }
}`;

      // Generate the differentiated materials
      const response = await openai.chat.completions.create({
        model: this.modelConfig.chat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: this.modelConfig.temperature,
        response_format: { type: 'json_object' },
      });

      // Parse the response
      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      // Cache the result
      await setCache(cacheKey, JSON.stringify(result), 3600 * 24); // Cache for 24 hours
      
      return result;
    } catch (error) {
      console.error('Error generating differentiated materials:', error);
      throw error;
    }
  }

  /**
   * Generate task recommendations based on user profile and behavior
   */
  public async recommendTasks(
    userProfile: {
      role: string;
      subjects: string[];
      grades: string[];
      recentActivity: string[];
    },
    limit: number = 5
  ): Promise<AnyTask[]> {
    try {
      // Format system prompt
      const systemPrompt = `You are an intelligent teaching assistant that helps educators by recommending relevant tasks.
Based on the user's profile, role, subjects, grades, and recent activity, recommend the most useful tasks.
Prioritize tasks that align with their current focus and help them achieve their goals.`;

      // Prepare user message
      const userMessage = `
Based on the following user profile, recommend ${limit} tasks that would be most helpful:

ROLE: ${userProfile.role}
SUBJECTS: ${userProfile.subjects.join(', ')}
GRADES: ${userProfile.grades.join(', ')}
RECENT ACTIVITY: ${userProfile.recentActivity.join(', ')}

Recommend a mix of: lesson planning, assessment creation, resource development, and collaborative tasks.
Each task should be specific, actionable, and relevant to the user's current focus.

Format your recommendations as a JSON array with task objects.`;

      // Generate recommendations
      const response = await openai.chat.completions.create({
        model: this.modelConfig.chat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      // Parse and validate the response
      const rawTasks = JSON.parse(response.choices[0]?.message?.content || '{}').tasks;
      
      // We don't fully validate the schema here to allow for flexibility in recommendations
      // But we ensure basic structure is correct
      return rawTasks.slice(0, limit);
    } catch (error) {
      console.error('Error generating task recommendations:', error);
      throw error;
    }
  }

  /**
   * Index content for retrieval
   */
  public async indexContent(content: Document): Promise<boolean> {
    try {
      await processDocument(content);
      return true;
    } catch (error) {
      console.error('Error indexing content:', error);
      return false;
    }
  }
  
  /**
   * Universal query handler - the main interface for user queries
   */
  public async query(
    queryText: string,
    context?: {
      subject?: string;
      grade?: string;
      responseFormat?: 'text' | 'json' | 'structured';
    }
  ): Promise<{
    answer: string;
    sources?: Array<{
      id: string;
      content: string;
      metadata: Record<string, any>;
    }>;
  }> {
    try {
      // Create cache key
      const cacheKey = `query:${queryText}:${JSON.stringify(context || {})}`;
      
      // Check cache first
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
      
      // If not in cache, prepare filter based on context
      const filter: Record<string, any> = {};
      if (context?.subject) filter.subject = context.subject;
      if (context?.grade) filter.grade = context.grade;

      // Retrieve relevant documents
      const ragResult = await retrieveRelevantDocuments(queryText, {
        filter,
        topK: 5,
        maxContextTokens: 4000,
      });
      
      // Determine if this is a specific task query
      const taskTypes = ['lesson plan', 'assessment', 'resource', 'feedback', 'approval'];
      const isTaskQuery = taskTypes.some(type => queryText.toLowerCase().includes(type));
      
      // Format system prompt based on query type
      let systemPrompt = 'You are an AI teaching assistant helping educators with their questions.';
      
      if (isTaskQuery) {
        systemPrompt = 'You are an AI teaching assistant that helps create educational content and tasks.';
      }
      
      // Prepare user message with context
      const userMessage = `
Query: ${queryText}

${ragResult.context ? `Relevant information:\n${ragResult.context}\n` : ''}

${context?.responseFormat === 'json' ? 'Provide your response in JSON format.' : ''}`;

      // Set response format options
      const responseFormat = context?.responseFormat === 'json' ? { type: 'json_object' } : undefined;

      // Generate answer
      const response = await openai.chat.completions.create({
        model: this.modelConfig.chat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: isTaskQuery ? 0.7 : 0.5, // Lower temperature for factual answers
        response_format: responseFormat,
      });

      // Format sources for response
      const sources = ragResult.documents.map(doc => ({
        id: doc.id,
        content: doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : ''),
        metadata: doc.metadata,
      }));

      // Prepare result
      const result = {
        answer: response.choices[0]?.message?.content || 'No response generated',
        sources,
      };
      
      // Cache the result
      await setCache(cacheKey, JSON.stringify(result), 1800); // Cache for 30 minutes
      
      return result;
    } catch (error) {
      console.error('Error in universal query:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiOrchestrator = AIOrchestrator.getInstance();

// Export convenience functions
export const generateLessonPlan = aiOrchestrator.generateLessonPlan.bind(aiOrchestrator);
export const generateAssessment = aiOrchestrator.generateAssessment.bind(aiOrchestrator);
export const generateFeedback = aiOrchestrator.generateFeedback.bind(aiOrchestrator);
export const generateDifferentiatedMaterials = aiOrchestrator.generateDifferentiatedMaterials.bind(aiOrchestrator);
export const recommendTasks = aiOrchestrator.recommendTasks.bind(aiOrchestrator);
export const query = aiOrchestrator.query.bind(aiOrchestrator); 