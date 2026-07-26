import * as z from 'zod';
import { objectIdSchema } from './global.schema';
import { QuestionType } from '../enums/quiz.enum';

const quizOptionSchema = z.strictObject({
  text: z.string().min(3),
});

const quizQuestionSchema = z.strictObject({
  text: z.string().min(3),
  type: z.enum(QuestionType),
  options: z.array(quizOptionSchema).min(1),
  correctOptionIndex: z.array(z.number()).min(1),
});

const quizBaseSchema = z.strictObject({
  quizName: z.string().min(3),
  description: z.string(),
  time: z.number().min(30).max(120),
  instructions: z.array(z.string()).optional(),
  passingThreshold: z.number().min(20).max(100).optional(),
  diplomaId: objectIdSchema,
  questions: z.array(quizQuestionSchema).min(1).max(10),
});

const validateQuestions = (
  questions: z.infer<typeof quizQuestionSchema>[],
  ctx: z.core.$RefinementCtx,
) => {
  questions.forEach((question, qIndex) => {
    question.correctOptionIndex.forEach((optionIndex) => {
      if (optionIndex < 0 || optionIndex >= question.options.length) {
        ctx.addIssue({
          code: 'custom',
          message: `correctOptionIndex ${optionIndex} is out of range for question ${qIndex}`,
          path: ['questions', qIndex, 'correctOptionIndex'],
        });
      }
    });
    if (
      question.type === QuestionType.RADIO_BUTTON &&
      question.correctOptionIndex.length !== 1
    ) {
      ctx.addIssue({
        code: 'custom',
        message: `Questions of type ${QuestionType.RADIO_BUTTON} can have only 1 answer`,
        path: ['questions', qIndex, 'correctOptionIndex'],
      });
    }
  });
};

export const createQuizSchema = quizBaseSchema.superRefine((data, ctx) => {
  validateQuestions(data.questions, ctx);
});

export const updateQuizSchema = quizBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (data.questions) validateQuestions(data.questions, ctx);
  });

export const quizIdParamSchema = z.strictObject({
  id: objectIdSchema,
});

export type createQuizDTO = z.infer<typeof createQuizSchema>;
export type updateQuizDTO = z.infer<typeof updateQuizSchema>;
