import { z } from 'zod';

/**
 * Schema for a generic task
 */
export const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  userId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
});

/**
 * Schema for a lesson planning task
 */
export const LessonPlanTaskSchema = TaskSchema.extend({
  taskType: z.literal('lesson_plan'),
  lessonDetails: z.object({
    subject: z.string(),
    grade: z.string(),
    duration: z.number().positive(),
    objectives: z.array(z.string()).min(1, 'At least one objective is required'),
    standards: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    assessment: z.string().optional(),
  }),
});

/**
 * Schema for an assessment creation task
 */
export const AssessmentTaskSchema = TaskSchema.extend({
  taskType: z.literal('assessment'),
  assessmentDetails: z.object({
    subject: z.string(),
    grade: z.string(),
    assessmentType: z.enum(['quiz', 'test', 'project', 'presentation', 'essay', 'other']),
    totalPoints: z.number().positive().optional(),
    objectives: z.array(z.string()).min(1, 'At least one objective is required'),
    questions: z.array(
      z.object({
        questionType: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'other']),
        content: z.string(),
        points: z.number().positive(),
        options: z.array(z.string()).optional(),
        correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
      })
    ).optional(),
  }),
});

/**
 * Schema for a resource creation task
 */
export const ResourceTaskSchema = TaskSchema.extend({
  taskType: z.literal('resource'),
  resourceDetails: z.object({
    subject: z.string(),
    grade: z.string(),
    resourceType: z.enum(['worksheet', 'presentation', 'video', 'interactive', 'document', 'other']),
    content: z.string().optional(),
    url: z.string().url().optional(),
    attachments: z.array(z.string()).optional(),
  }),
});

/**
 * Schema for an approval task
 */
export const ApprovalTaskSchema = TaskSchema.extend({
  taskType: z.literal('approval'),
  approvalDetails: z.object({
    itemType: z.enum(['lesson_plan', 'assessment', 'resource', 'other']),
    itemId: z.string(),
    requester: z.string(),
    reviewers: z.array(z.string()),
    comments: z.array(
      z.object({
        userId: z.string(),
        content: z.string(),
        timestamp: z.string().datetime(),
      })
    ).optional(),
  }),
});

/**
 * Schema for a feedback task
 */
export const FeedbackTaskSchema = TaskSchema.extend({
  taskType: z.literal('feedback'),
  feedbackDetails: z.object({
    itemType: z.enum(['lesson_plan', 'assessment', 'resource', 'other']),
    itemId: z.string(),
    feedbackType: z.enum(['review', 'suggestion', 'correction', 'question', 'other']),
    content: z.string(),
    attachments: z.array(z.string()).optional(),
  }),
});

/**
 * Union of all task schemas
 */
export const AnyTaskSchema = z.discriminatedUnion('taskType', [
  LessonPlanTaskSchema,
  AssessmentTaskSchema,
  ResourceTaskSchema,
  ApprovalTaskSchema,
  FeedbackTaskSchema,
]);

/**
 * Type for a generic task
 */
export type Task = z.infer<typeof TaskSchema>;

/**
 * Type for a lesson planning task
 */
export type LessonPlanTask = z.infer<typeof LessonPlanTaskSchema>;

/**
 * Type for an assessment creation task
 */
export type AssessmentTask = z.infer<typeof AssessmentTaskSchema>;

/**
 * Type for a resource creation task
 */
export type ResourceTask = z.infer<typeof ResourceTaskSchema>;

/**
 * Type for an approval task
 */
export type ApprovalTask = z.infer<typeof ApprovalTaskSchema>;

/**
 * Type for a feedback task
 */
export type FeedbackTask = z.infer<typeof FeedbackTaskSchema>;

/**
 * Type for any task
 */
export type AnyTask = z.infer<typeof AnyTaskSchema>; 