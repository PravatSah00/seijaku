// The single entry point app uses to trigger emails.

import { sendTransactional } from "./email.service.js";
import { buildOrderConfirmationParams, OrderForConfirmation } from "./builders/orderConfirmation.js";

/**
 * Sends an order confirmation email.
 */
export async function sendOrderConfirmationEmail(
    to: { email: string; name: string },
    params: Record<string, unknown>
) {
    return sendTransactional({
        template: "ORDER_CONFIRMATION",
        to: { email: to.email, name: to.name },
        params: params,
    });
}

// export function sendPaymentSuccess(order: OrderForPaymentSuccess) {
//     return sendTransactional({
//         template: "PAYMENT_SUCCESS",
//         to: { email: order.customerEmail, name: order.customerName },
//         params: buildPaymentSuccessParams(order),
//     });
// }

// export function sendPaymentFailed(
//     order: OrderForPaymentFailed,
//     reason?: string,
// ) {
//     return sendTransactional({
//         template: "PAYMENT_FAILED",
//         to: { email: order.customerEmail, name: order.customerName },
//         params: buildPaymentFailedParams(order, reason),
//     });
// }

// export function sendShipmentTracking(
//     order: OrderForShipment,
//     shipment: ShipmentInfo,
// ) {
//     return sendTransactional({
//         template: "SHIPMENT_TRACKING",
//         to: { email: order.customerEmail, name: order.customerName },
//         params: buildShipmentTrackingParams(order, shipment),
//     });
// }