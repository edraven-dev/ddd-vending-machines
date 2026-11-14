import { isAxiosError } from 'axios';

export const errorMessage = (error: unknown): string => {
  const body: unknown = isAxiosError(error) ? error.response?.data : undefined;
  if (typeof body === 'object' && body !== null && 'message' in body) {
    if (Array.isArray(body.message)) {
      return body.message.join('\r\n');
    }
    if (typeof body.message === 'string') {
      return body.message;
    }
  }
  return error instanceof Error ? error.message : String(error);
};
