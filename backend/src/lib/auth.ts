import type { AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config.js";

export type AdminTokenPayload = {
  adminId: string;
  email: string;
  role: AdminRole;
};

export type CustomerTokenPayload = {
  customerId: string;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
}

export function signCustomerToken(payload: CustomerTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "30d" });
}

export function verifyCustomerToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as CustomerTokenPayload;
}

