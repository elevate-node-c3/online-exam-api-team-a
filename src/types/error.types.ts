export interface IAppError extends Error {
  statusCode: number;
  data?: Record<string, unknown> | undefined;
}
