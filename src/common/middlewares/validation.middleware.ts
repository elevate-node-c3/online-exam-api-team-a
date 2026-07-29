import * as z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { unlink } from 'node:fs/promises';
import { errorRes } from '../utils/response.util';

type schemaKeys = Partial<Record<keyof Request, z.ZodType>>;

const removeUploadedFiles = async (req: Request) => {
  const files = [
    ...(req.file ? [req.file] : []),
    ...(Array.isArray(req.files)
      ? req.files
      : Object.values(req.files ?? {}).flat()),
  ];

  await Promise.all(
    files.map((file) => unlink(file.path).catch(() => undefined)),
  );
};

// Groups Zod issues by field: { password: ['msg1', 'msg2'], confirmPassword: ['msg3'] }
const formatIssues = (issues: z.core.$ZodIssue[]) => {
  const grouped: Record<string, string[]> = {};
  for (const issue of issues) {
    const field = issue.path.join('.') || 'root';
    if (!grouped[field]) grouped[field] = [];
    grouped[field].push(issue.message);
  }
  return grouped;
};

export const validate = (schema: schemaKeys) => {
  const validationKeys = Object.keys(schema) as (keyof Request)[];
  return async (req: Request, res: Response, next: NextFunction) => {
    const issues: z.core.$ZodIssue[] = [];
    validationKeys.forEach((key) => {
      const validationRes = schema[key]!.safeParse(req[key]);
      if (!validationRes.success) {
        issues.push(...validationRes.error.issues);
      } else if (
        validationRes.data &&
        typeof validationRes.data === 'object'
      ) {
        Object.assign(req[key] as object, validationRes.data);
      } else {
        (req as unknown as Record<string, unknown>)[key as string] =
          validationRes.data;
      }
    });
    if (issues.length > 0) {
      await removeUploadedFiles(req);
      return errorRes({
        res,
        message: 'Validation Error',
        status: 400,
        error: formatIssues(issues),
      });
    }
    return next();
  };
};