import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/client.js";

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals.user?.role;

    if (!userRole || userRole !== role) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have the required role",
        },
      });
    }

    next();
  };
}
