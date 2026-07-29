import * as z from 'zod';
import { objectIdSchema } from './global.schema';

export const attemptIdParamSchema = z.strictObject({ id: objectIdSchema });

export const attemptListQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const submittedAnswerSchema = z.strictObject({
  questionId: objectIdSchema,
  selectedOptionIds: z.array(objectIdSchema).min(1),
});

export const submitAttemptSchema = z
  .strictObject({ answers: z.array(submittedAnswerSchema).min(1) })
  .superRefine(({ answers }, ctx) => {
    const questionIds = new Set<string>();

    answers.forEach((answer, answerIndex) => {
      if (questionIds.has(answer.questionId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each question may only be submitted once',
          path: ['answers', answerIndex, 'questionId'],
        });
      }
      questionIds.add(answer.questionId);

      if (
        new Set(answer.selectedOptionIds).size !==
        answer.selectedOptionIds.length
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Selected option IDs must be unique',
          path: ['answers', answerIndex, 'selectedOptionIds'],
        });
      }
    });
  });

export type attemptListQueryDTO = z.infer<typeof attemptListQuerySchema>;
export type submitAttemptDTO = z.infer<typeof submitAttemptSchema>;
