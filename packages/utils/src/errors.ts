import type { ApiErrorBody } from "@mais-aprovacao/types";

export function createApiError(error: string, code: string): ApiErrorBody {
  return { error, code };
}
