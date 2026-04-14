import { AxiosInstance } from 'axios';

interface PaginationMeta {
  count: number;
  total: number;
  current_page: number;
  per_page: number;
  next_page_link: string | null;
  previous_page_link: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Fetches a single page from a paginated endpoint.
 * The Aircall API returns { <resource_key>: [...], meta: {...} }
 */
export async function fetchPage<T>(
  client: AxiosInstance,
  path: string,
  resourceKey: string,
  params: Record<string, string | number | undefined> = {},
): Promise<PaginatedResponse<T>> {
  const response = await client.get(path, { params });
  return {
    data: response.data[resourceKey] || [],
    meta: response.data.meta,
  };
}

/**
 * Auto-paginates through all pages of a list endpoint.
 * Follows meta.next_page_link until no more pages.
 * Respects the 10,000 item limit for calls and contacts.
 */
export async function fetchAllPages<T>(
  client: AxiosInstance,
  path: string,
  resourceKey: string,
  params: Record<string, string | number | undefined> = {},
  onPage?: (pageNum: number, total: number) => void,
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  const perPage = 50; // max per_page

  while (true) {
    const result = await fetchPage<T>(client, path, resourceKey, {
      ...params,
      page,
      per_page: perPage,
    });

    allItems.push(...result.data);

    if (onPage) {
      onPage(page, result.meta.total);
    }

    if (!result.meta.next_page_link || result.data.length === 0) {
      break;
    }

    page++;

    // Safety: Aircall caps at 10,000 items
    if (allItems.length >= 10000) {
      process.stderr.write('Warning: Reached 10,000 item limit.\n');
      break;
    }
  }

  return allItems;
}
