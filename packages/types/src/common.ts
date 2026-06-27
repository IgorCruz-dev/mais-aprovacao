export interface PaginatedResponse<T> {
  next_cursor: string | null;
  items: T[];
}

export interface ApiErrorBody {
  error: string;
  code: string;
}

export type ISODateString = string;
