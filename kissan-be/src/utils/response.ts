export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const successResponse = <T>(
  data: T,
  message = "Success",
): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (
  error: string,
  message = "Error",
): ApiResponse => ({
  success: false,
  error,
  message,
});
