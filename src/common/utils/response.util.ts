import { errorResponseDTO, successResponseDTO } from '../types/global.types';

export const successRes = <T>({
  res,
  message,
  status,
  data,
}: successResponseDTO<T>) => {
  const body =
    data !== undefined
      ? { statusCode: status, message, data }
      : { statusCode: status, message };

  res.status(status).json(body);
};

export const errorRes = <T>({
  res,
  message,
  status,
  error,
}: errorResponseDTO<T>) => {
  const body =
    error !== undefined
      ? { statusCode: status, message, error }
      : { statusCode: status, message };
  res.status(status).json(body);
};
