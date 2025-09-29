import { FilterQuery } from 'mongoose';

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export function parsePagination(params: PaginationParams) {
  const page = Math.max(1, parseInt(String(params.page || '1')));
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit || '20'))));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildTextQuery<T>(q?: string): FilterQuery<T> {
  if (!q) return {} as FilterQuery<T>;
  return { $text: { $search: q } } as FilterQuery<T>;
}


