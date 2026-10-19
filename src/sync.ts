export type AppState = {
  accounts: unknown[];
  transactions: unknown[];
  budgets: unknown[];
  goals: unknown[];
  baseCurrency: string;
};

export class SyncError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const KEY_STORAGE = 'pf_access_key';

export function getStoredKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function storeKey(key: string) {
  try {
    localStorage.setItem(KEY_STORAGE, key);
  } catch {
    /* ignore */
  }
}

export function clearKey() {
  try {
    localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

async function request(method: 'GET' | 'PUT', key: string, body?: unknown) {
  const res = await fetch('/api/state', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-app-key': key,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    throw new SyncError(res.status, `request failed (${res.status})`);
  }

  return res.json();
}

export async function loadState(key: string): Promise<{ data: AppState | null; updatedAt: string | null }> {
  return request('GET', key);
}

export async function saveState(key: string, state: AppState): Promise<void> {
  await request('PUT', key, { data: state });
}
