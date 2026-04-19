import "express";

declare global {
  namespace Express {
    interface Request {
      parsed_query?: Record<string, unknown>;
      parsed_params?: Record<string, unknown>;
    }
  }
}
