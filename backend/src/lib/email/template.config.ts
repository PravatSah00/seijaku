import { env } from "../../config.js";

export const BREVO_TEMPLATES = {
  ORDER_CONFIRMATION: env.BREVO_TPL_ORDER_CONFIRMATION,
//   PAYMENT_SUCCESS:    env.BREVO_TPL_PAYMENT_SUCCESS,
//   PAYMENT_FAILED:     env.BREVO_TPL_PAYMENT_FAILED,
//   SHIPMENT_TRACKING:  env.BREVO_TPL_SHIPMENT_TRACKING,
} as const;

export type BrevoTemplateKey = keyof typeof BREVO_TEMPLATES;