import type { Enrollment, CourseLesson } from "@mais-aprovacao/types";

export function isEnrollmentActive(enrollment: Enrollment): boolean {
  if (enrollment.status !== "active") return false;
  if (!enrollment.expires_at) return true;
  return new Date(enrollment.expires_at) > new Date();
}

export function hasAccessToLesson(
  enrollment: Enrollment,
  lesson: CourseLesson
): boolean {
  if (lesson.is_preview) return true;
  return isEnrollmentActive(enrollment);
}
