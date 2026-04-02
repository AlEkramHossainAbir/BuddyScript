import { AxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      fallbackMessage
    );
  }

  return fallbackMessage;
}
