import type { NextFunction, Request, Response } from "express";

import { verifyCustomerToken } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      customer?: {
        customerId: string;
        email: string;
      };
    }
  }
}

export function requireCustomer(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Customer unauthorized" });
    return;
  }

  try {
    req.customer = verifyCustomerToken(authorization.slice("Bearer ".length));
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired customer session" });
  }
}

export function optionalCustomer(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (authorization?.startsWith("Bearer ")) {
    try {
      req.customer = verifyCustomerToken(authorization.slice("Bearer ".length));
    } catch {
      // Ignore invalid customer token in optional middleware
    }
  }

  next();
}
