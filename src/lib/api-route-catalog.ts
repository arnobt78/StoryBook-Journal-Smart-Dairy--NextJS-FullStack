/**
 * Static API route catalog — single source of truth for /api/openapi and /api-documentation UI.
 * Field definitions mirror Zod schemas in validations.ts, search.ts, ai-assist.ts.
 */

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiAuthMode = "none" | "session" | "session+rateLimit";

export type ApiSchemaField = {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
};

export type ApiResponseDoc = {
  status: number;
  description: string;
  envelope?: string;
};

export type ApiEndpointDoc = {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  tag: ApiDocTag;
  auth: ApiAuthMode;
  queryParams?: ApiSchemaField[];
  requestBody?: { schemaName: string; fields: ApiSchemaField[] };
  responses: ApiResponseDoc[];
  notes?: string;
};

export type ApiDocTag =
  | "System"
  | "Auth"
  | "Books"
  | "Entries"
  | "Search"
  | "Realtime"
  | "AI";

export type ApiSchemaDoc = {
  name: string;
  description: string;
  fields: ApiSchemaField[];
};

export type ApiRouteCatalog = {
  openapi: "3.1.0";
  info: {
    title: string;
    version: string;
    description: string;
  };
  tags: { name: ApiDocTag; description: string }[];
  endpoints: ApiEndpointDoc[];
  schemas: ApiSchemaDoc[];
};

const SCHEMAS: ApiSchemaDoc[] = [
  {
    name: "registerSchema",
    description: "POST /api/auth/register body",
    fields: [
      { name: "email", type: "string (email)", required: true },
      { name: "password", type: "string (min 8)", required: true },
      { name: "displayName", type: "string (1–60)", required: true },
    ],
  },
  {
    name: "loginSchema",
    description: "Credentials sign-in (client validation)",
    fields: [
      { name: "email", type: "string (email)", required: true },
      { name: "password", type: "string", required: true },
    ],
  },
  {
    name: "createBookSchema",
    description: "POST /api/books body",
    fields: [
      { name: "title", type: "string (1–100)", required: true },
      { name: "description", type: "string (max 300)", required: false },
      { name: "coverColor", type: "string (#hex)", required: false },
      { name: "coverEmoji", type: "string (cover icon slug)", required: false },
      {
        name: "theme",
        type: "enum: warm-paper | dark-academia | midnight-journal | soft-minimal | vintage-diary",
        required: false,
      },
      { name: "visibility", type: "enum: private | public", required: false },
    ],
  },
  {
    name: "updateBookSchema",
    description: "PATCH /api/books/[bookId] — partial createBookSchema",
    fields: [{ name: "(all createBookSchema fields)", type: "optional partial", required: false }],
  },
  {
    name: "createEntrySchema",
    description: "POST /api/entries body",
    fields: [
      { name: "bookId", type: "string (cuid)", required: true },
      { name: "title", type: "string (max 200)", required: false },
      { name: "content", type: "string", required: false },
      { name: "mood", type: "string", required: false },
      { name: "weather", type: "string", required: false },
      { name: "location", type: "string (max 100)", required: false },
      { name: "tags", type: "string[] (max 30 each)", required: false },
    ],
  },
  {
    name: "updateEntrySchema",
    description: "PATCH /api/entries/[entryId] — autosave partial",
    fields: [
      { name: "title", type: "string (max 200)", required: false },
      { name: "content", type: "string", required: false },
      { name: "mood", type: "string", required: false },
      { name: "weather", type: "string", required: false },
      { name: "location", type: "string (max 100)", required: false },
      { name: "tags", type: "string[]", required: false },
      { name: "isFavorite", type: "boolean", required: false },
      { name: "isArchived", type: "boolean", required: false },
    ],
  },
  {
    name: "searchQuerySchema",
    description: "GET /api/search query params",
    fields: [
      { name: "q", type: "string (1–200)", required: true },
      { name: "bookId", type: "string (cuid)", required: false },
      { name: "mood", type: "string (max 8)", required: false },
      { name: "limit", type: "number (1–50, default 20)", required: false },
    ],
  },
  {
    name: "aiAssistRequestSchema",
    description: "POST /api/ai/assist and /api/ai/assist/stream body",
    fields: [
      { name: "title", type: "string (max 200)", required: false },
      { name: "content", type: "string (min 1)", required: true },
      { name: "mood", type: "string", required: false },
      { name: "assistSessionId", type: "string (8–64)", required: false },
    ],
  },
];

const ENDPOINTS: ApiEndpointDoc[] = [
  {
    id: "health-get",
    method: "GET",
    path: "/api/health",
    summary: "Liveness probe",
    description: "Public uptime check — no dependency probes. Returns 200 when App Router responds.",
    tag: "System",
    auth: "none",
    responses: [
      { status: 200, description: "Service alive", envelope: "{ ok, service, timestamp }" },
    ],
  },
  {
    id: "status-get",
    method: "GET",
    path: "/api/status",
    summary: "Enriched system status",
    description: "Dependency health + platform/personal aggregate counts. No PII.",
    tag: "System",
    auth: "session",
    responses: [
      { status: 200, description: "Status payload", envelope: "{ success, data: ApiStatusPayload }" },
      { status: 401, description: "Unauthorized" },
    ],
  },
  {
    id: "openapi-get",
    method: "GET",
    path: "/api/openapi",
    summary: "OpenAPI-style route catalog",
    tag: "System",
    auth: "session",
    responses: [
      { status: 200, description: "Route catalog JSON", envelope: "{ success, data: ApiRouteCatalog }" },
      { status: 401, description: "Unauthorized" },
    ],
  },
  {
    id: "auth-nextauth",
    method: "GET",
    path: "/api/auth/[...nextauth]",
    summary: "NextAuth handlers",
    description: "OAuth callbacks, session, CSRF, sign-in/out.",
    tag: "Auth",
    auth: "none",
    responses: [{ status: 200, description: "NextAuth response" }],
    notes: "Also accepts POST for credentials/OAuth flows.",
  },
  {
    id: "auth-register",
    method: "POST",
    path: "/api/auth/register",
    summary: "Register new account",
    tag: "Auth",
    auth: "none",
    requestBody: { schemaName: "registerSchema", fields: SCHEMAS[0].fields },
    responses: [
      { status: 201, description: "User created + seed journal", envelope: "{ success, data }" },
      { status: 400, description: "Validation error" },
      { status: 409, description: "Email already exists" },
    ],
  },
  {
    id: "books-list",
    method: "GET",
    path: "/api/books",
    summary: "List user's journals",
    description: "Includes entry count per book via _count.",
    tag: "Books",
    auth: "session",
    responses: [
      { status: 200, description: "Book list", envelope: "{ success, data: JournalBook[] }" },
      { status: 401, description: "Unauthorized" },
    ],
  },
  {
    id: "books-create",
    method: "POST",
    path: "/api/books",
    summary: "Create journal + starter entry",
    description: "Atomic transaction — BookSpread never receives empty entries[].",
    tag: "Books",
    auth: "session",
    requestBody: { schemaName: "createBookSchema", fields: SCHEMAS[2].fields },
    responses: [
      { status: 201, description: "Book created", envelope: "{ success, data }" },
      { status: 400, description: "Validation error" },
      { status: 401, description: "Unauthorized" },
    ],
    notes: "Triggers afterJournalMutation → Redis pub/sub for SSE.",
  },
  {
    id: "books-detail",
    method: "GET",
    path: "/api/books/[bookId]",
    summary: "Book detail with entries",
    tag: "Books",
    auth: "session",
    responses: [
      { status: 200, description: "Book + entries", envelope: "{ success, data }" },
      { status: 401, description: "Unauthorized" },
      { status: 404, description: "Not found or not owned" },
    ],
  },
  {
    id: "books-update",
    method: "PATCH",
    path: "/api/books/[bookId]",
    summary: "Update journal metadata",
    tag: "Books",
    auth: "session",
    requestBody: { schemaName: "updateBookSchema", fields: SCHEMAS[3].fields },
    responses: [
      { status: 200, description: "Updated book", envelope: "{ success, data }" },
      { status: 400, description: "Validation error" },
      { status: 401, description: "Unauthorized" },
      { status: 404, description: "Not found" },
    ],
  },
  {
    id: "books-delete",
    method: "DELETE",
    path: "/api/books/[bookId]",
    summary: "Delete journal and cascade entries",
    tag: "Books",
    auth: "session",
    responses: [
      { status: 200, description: "Deleted", envelope: "{ success: true }" },
      { status: 401, description: "Unauthorized" },
      { status: 404, description: "Not found" },
    ],
  },
  {
    id: "entries-create",
    method: "POST",
    path: "/api/entries",
    summary: "Create entry in owned book",
    tag: "Entries",
    auth: "session",
    requestBody: { schemaName: "createEntrySchema", fields: SCHEMAS[4].fields },
    responses: [
      { status: 201, description: "Entry created", envelope: "{ success, data }" },
      { status: 400, description: "Validation error" },
      { status: 401, description: "Unauthorized" },
      { status: 404, description: "Book not found" },
    ],
  },
  {
    id: "entries-update",
    method: "PATCH",
    path: "/api/entries/[entryId]",
    summary: "Update entry (autosave)",
    tag: "Entries",
    auth: "session",
    requestBody: { schemaName: "updateEntrySchema", fields: SCHEMAS[5].fields },
    responses: [
      { status: 200, description: "Updated entry", envelope: "{ success, data }" },
      { status: 400, description: "Validation error" },
      { status: 401, description: "Unauthorized" },
      { status: 404, description: "Not found" },
    ],
  },
  {
    id: "entries-delete",
    method: "DELETE",
    path: "/api/entries/[entryId]",
    summary: "Delete entry",
    tag: "Entries",
    auth: "session",
    responses: [
      { status: 200, description: "Deleted", envelope: "{ success: true }" },
      { status: 401, description: "Unauthorized" },
      { status: 404, description: "Not found" },
    ],
  },
  {
    id: "search-get",
    method: "GET",
    path: "/api/search",
    summary: "Search entries by title/content",
    tag: "Search",
    auth: "session",
    queryParams: SCHEMAS[6].fields,
    responses: [
      { status: 200, description: "Search hits", envelope: "{ success, data: SearchHit[] }" },
      { status: 400, description: "Invalid query" },
      { status: 401, description: "Unauthorized" },
    ],
    notes: "force-dynamic — always fresh results.",
  },
  {
    id: "journal-events",
    method: "GET",
    path: "/api/journal/events",
    summary: "SSE journal mutation stream",
    description: "Cross-tab sync — polls Redis buffer every 500ms (3000ms without Redis).",
    tag: "Realtime",
    auth: "session",
    queryParams: [{ name: "since", type: "number (epoch ms)", required: false, description: "Dedupe on reconnect" }],
    responses: [
      { status: 200, description: "text/event-stream", envelope: "data: JournalSyncEvent" },
      { status: 401, description: "Unauthorized" },
    ],
    notes: "Client: useJournalRealtime → notifyJournalCacheUpdated.",
  },
  {
    id: "ai-assist",
    method: "POST",
    path: "/api/ai/assist",
    summary: "Sync AI writing assist",
    tag: "AI",
    auth: "session+rateLimit",
    requestBody: { schemaName: "aiAssistRequestSchema", fields: SCHEMAS[7].fields },
    responses: [
      { status: 200, description: "Completion text", envelope: "{ text }" },
      { status: 400, description: "Validation error" },
      { status: 401, description: "Unauthorized" },
      { status: 429, description: "Rate limited (10/min)" },
    ],
  },
  {
    id: "ai-assist-stream",
    method: "POST",
    path: "/api/ai/assist/stream",
    summary: "SSE AI writing assist stream",
    tag: "AI",
    auth: "session+rateLimit",
    requestBody: { schemaName: "aiAssistRequestSchema", fields: SCHEMAS[7].fields },
    responses: [
      { status: 200, description: "text/event-stream tokens" },
      { status: 401, description: "Unauthorized" },
      { status: 429, description: "Rate limited" },
    ],
  },
];

const TAGS: ApiRouteCatalog["tags"] = [
  { name: "System", description: "Health, status, and API catalog" },
  { name: "Auth", description: "Registration and NextAuth session" },
  { name: "Books", description: "Journal shelf CRUD" },
  { name: "Entries", description: "Journal entry CRUD and autosave" },
  { name: "Search", description: "Scoped entry search" },
  { name: "Realtime", description: "SSE cross-tab invalidation" },
  { name: "AI", description: "Groq/OpenRouter writing assist" },
];

/** Full catalog for SSR and GET /api/openapi */
export function getApiRouteCatalog(): ApiRouteCatalog {
  return {
    openapi: "3.1.0",
    info: {
      title: "StoryBook Journal API",
      version: "1.0.0",
      description:
        "REST + SSE endpoints for journal CRUD, search, realtime sync, and AI assist. " +
        "Authenticated routes scope all data to session.user.id. " +
        "Cache invalidation: notifyJournalCacheUpdated only.",
    },
    tags: TAGS,
    endpoints: ENDPOINTS,
    schemas: SCHEMAS,
  };
}

/** Unique path+method keys for tests */
export function getApiEndpointKeys(): string[] {
  return ENDPOINTS.map((e) => `${e.method} ${e.path}`);
}

/** Group endpoints by tag for documentation UI */
export function groupEndpointsByTag(
  endpoints: ApiEndpointDoc[],
): Record<ApiDocTag, ApiEndpointDoc[]> {
  const groups = {} as Record<ApiDocTag, ApiEndpointDoc[]>;
  for (const tag of TAGS) {
    groups[tag.name] = endpoints.filter((e) => e.tag === tag.name);
  }
  return groups;
}
