import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

type RequestSyntaxError = SyntaxError & {
  status?: number;
};

export function notFoundHandler(
  _req: Request,
  res: Response,
) {
  return res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      },
    });
  }

  if (
    error instanceof SyntaxError &&
    (error as RequestSyntaxError).status === 400
  ) {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON",
      },
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
