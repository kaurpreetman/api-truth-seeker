export type IvySession = {
  accessToken: string;
  refreshToken: string;
  email: string;
};

export type Listing = {
  listing_id: string;
  listing_url: string;
  website: string;
  apartment_name: string;
  locality: string;
  property_type: string;
  bedroom: number;
  bathroom: number;
  balcony?: number;
  floor: number;
  total_floors: number;
  furnishing: string;
  facing_direction?: string;
  covered_parking?: number;
  price: number;
  carpet_area: number;
  super_built_up_area?: number;
  latitude: number;
  longitude: number;
  posted_by: string;
  posted_by_name: string;
  posted_by_contact: string;
  project_id?: string | null;
  description: string;
  posted_at: string;
  is_verified?: boolean;
  is_live?: boolean;
};

export type Rental = Listing & {
  title: string;
  deposit: number;
  maintenance: number;
};

export type Project = {
  project_id: string;
  project_url: string;
  apartment_name: string;
  developer_name: string;
  locality: string;
  project_status: string;
  total_units: number;
  total_towers: number;
  total_floors: number;
  launch_date: string;
  possession_date: string;
  rera_number: string;
  min_area_sqft: number;
  max_area_sqft: number;
  total_listings: number;
  price_min: number;
  price_max: number;
  amenities: string[];
  latitude: number;
  longitude: number;
};

export type Collection<T> = {
  limit: number;
  offset: number;
  count: number;
  total: number;
  has_more: boolean;
  results: T[];
};

const SESSION_KEY = "ivy-homes-session";

export function readStoredSession(): IvySession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IvySession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function storeSession(session: IvySession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({ detail: "Unexpected response from the property service." }))) as T & {
    detail?: string;
  };
  if (!response.ok) throw new Error(payload.detail ?? `Request failed (${response.status})`);
  return payload;
}

export async function ivyRequest<T>(path: string, session: IvySession, init?: RequestInit) {
  const request = (activeSession: IvySession) => fetch(`/api/ivy${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${activeSession.accessToken}`,
      "Content-Type": "application/json",
    },
  });
  let response = await request(session);
  if (response.status === 401 && session.refreshToken) {
    const nextSession = await refresh(session);
    response = await request(nextSession);
  }
  return readResponse<T>(response);
}

export async function login(email: string, password: string) {
  const response = await fetch("/api/ivy/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await readResponse<{ access_token: string; refresh_token: string; user: { email: string } }>(response);
  const session = { accessToken: payload.access_token, refreshToken: payload.refresh_token, email: payload.user.email };
  storeSession(session);
  return session;
}

export async function refresh(session: IvySession) {
  const response = await fetch("/api/ivy/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  });
  const payload = await readResponse<{ access_token: string; refresh_token: string; user: { email: string } }>(response);
  const nextSession = { accessToken: payload.access_token, refreshToken: payload.refresh_token, email: payload.user.email };
  storeSession(nextSession);
  return nextSession;
}

export function formatPrice(value: number, isRent = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: isRent ? 0 : 0,
  }).format(value);
}

export function formatProjectPrice(value: number) {
  if (value < 100) return `₹${value.toFixed(2)} Cr`;
  return formatPrice(value);
}

export function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function initials(email: string) {
  return email.split("@")[0].slice(0, 2).toUpperCase();
}