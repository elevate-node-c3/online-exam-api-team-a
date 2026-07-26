import * as z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { errorRes } from '../utils/response.util';

type schemaKeys = Partial<Record<keyof Request, z.ZodType>>;

export const validate = (schema: schemaKeys) => {
  const validationKeys = Object.keys(schema) as (keyof Request)[];
  return (req: Request, res: Response, next: NextFunction) => {
    const issues: z.core.$ZodIssue[] = [];
    validationKeys.forEach((key) => {
      const validationRes = schema[key]!.safeParse(req[key]);
      if (!validationRes.success) {
        issues.push(...validationRes.error.issues);
      } else {
        (req as unknown as Record<string, unknown>)[key as string] =
          validationRes.data;
      }
    });
    if (issues.length > 0) {
      return errorRes({
        res,
        message: 'Validation Error',
        status: 400,
        error: issues,
      });
    }
    return next();
  };
};
