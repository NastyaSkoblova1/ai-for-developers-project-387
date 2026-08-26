export class ApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function notFound(message: string): ApiError {
  return new ApiError(404, message, 404);
}

export function conflict(message: string): ApiError {
  return new ApiError(409, message, 409);
}

export function badRequest(message: string): ApiError {
  return new ApiError(400, message, 400);
}
