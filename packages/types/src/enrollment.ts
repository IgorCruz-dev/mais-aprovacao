export type EnrollmentStatus = "active" | "expired" | "cancelled" | "pending";

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  cohort_id: string | null;
  status: EnrollmentStatus;
  price_paid_cents: number | null;
  payment_method: string | null;
  stripe_payment_id: string | null;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
