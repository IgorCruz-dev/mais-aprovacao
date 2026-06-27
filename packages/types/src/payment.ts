export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface PaymentSummary {
  id: string;
  course_id: string;
  course_title: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus | string;
  paid_at: string | null;
  created_at: string;
}
