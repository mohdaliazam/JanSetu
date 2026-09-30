// Wraps fetch calls to /api endpoints
// Handles error responses and returns typed data
// Throws ApiError with code, message, retryable flag

export class ApiError extends Error {
  code: string;
  retryable: boolean;
  requestId?: string;
  constructor(code: string, message: string, retryable: boolean, requestId?: string) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.requestId = requestId;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    credentials: 'same-origin',
    headers: {} as Record<string,string>,
  };
  if (body !== undefined) {
    (opts.headers as Record<string,string>)['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: { code: 'UNKNOWN', message: res.statusText, retryable: false } }));
    throw new ApiError(data.error?.code || 'UNKNOWN', data.error?.message || res.statusText, data.error?.retryable || false, data.requestId);
  }
  return res.json();
}

// Session
export const createSession = () => request<{workspaceExpiresAt:string, synthetic:true, providerMode:string}>('POST', '/api/session', {});
export const checkSession = () => request<{workspaceExpiresAt:string, synthetic:true, providerMode:string}>('POST', '/api/session', {});

// Localities
export const getLocalities = (params?: {state_code?:string, district_id?:string}) => {
  const searchParams = new URLSearchParams();
  if (params?.state_code) searchParams.set('state_code', params.state_code);
  if (params?.district_id) searchParams.set('district_id', params.district_id);
  const qs = searchParams.toString();
  return request<{items:any[]}>('GET', `/api/localities${qs ? '?' + qs : ''}`);
};

// Drafts
export const createDraft = (data: {text:string, localityId:string, languageHint?:string}) =>
  request<any>('POST', '/api/drafts', data);
export const getDraft = (id: string) => request<any>('GET', `/api/drafts/${id}`);
export const confirmDraft = (id: string, data: {category:string, localityId:string, acknowledged:true}) =>
  request<any>('POST', `/api/drafts/${id}/confirm`, data);

// Reports
export const getReports = (params?: {cursor?:string, limit?:number}) => {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.set('cursor', params.cursor);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return request<{items:any[], nextCursor?:string}>('GET', `/api/reports${qs ? '?' + qs : ''}`);
};

// Groups
export const getGroups = (params?: {state_code?:string, district_id?:string, category?:string}) => {
  const searchParams = new URLSearchParams();
  if (params?.state_code) searchParams.set('state_code', params.state_code);
  if (params?.district_id) searchParams.set('district_id', params.district_id);
  if (params?.category) searchParams.set('category', params.category);
  const qs = searchParams.toString();
  return request<{items:any[], insufficientData:any[], formulaVersion:string}>('GET', `/api/groups${qs ? '?' + qs : ''}`);
};

export const getGroupDetail = (id: string) => request<any>('GET', `/api/groups/${id}`);
export const generateBrief = (groupId: string) => request<any>('POST', `/api/groups/${groupId}/brief`, {});
export const getExport = (groupId: string) => request<any>('GET', `/api/groups/${groupId}/export`);
