# TanStack Query Guide for the Healthcare App

This is a living reference for the TanStack Query integration in `web/`.
It targets the TanStack Query v5 API and should be updated whenever the
application's query architecture changes.

The examples describe the intended architecture. During implementation, update
the file paths and examples to match the final code exactly.

## Implementation Checkpoint — October 5, 2026

### Completed

- Installed `@tanstack/react-query` v5.
- Added this project-specific TanStack Query reference.
- Completed the ShadCN patient-record page.
- Added loading, empty, forbidden, not-found, and error record states.
- Added a patient-only clinical-record card to the account page.
- Made the account dashboard role-aware.
- Aligned frontend date-of-birth validation with the API.
- Changed successful login navigation to replace the login history entry.
- Verified frontend lint and production build before beginning the query refactor.

### Current stopping point

TanStack Query is installed, but no `QueryClient` or provider has been created
yet. The existing account, profile, and record pages still use their original
`useEffect` request lifecycle code.

The working tree contains uncommitted frontend changes. Review `git status`
before continuing.

### Start here next session

1. Create `src/app/providers.tsx` as a Client Component.
2. Create one stable `QueryClient` using lazy `useState`.
3. Wrap the root layout's children with `QueryClientProvider`.
4. Run `npm run lint` and `npm run build`.
5. Add `src/lib/api.ts` with `apiFetch<T>` and `ApiError`.
6. Add centralized query keys.
7. Implement `useAuth()` over the `["auth", "me"]` query.
8. Add the protected route layout.
9. Refactor account, profile, and record pages one at a time.
10. Extract `formatDateOnly` and `formatDateTime` into `src/lib/date.ts`.

Do not refactor every page simultaneously. Verify each layer before moving to
the next one.

### Dependency audit note

`npm audit --omit=dev` reported existing vulnerabilities in Next.js, ShadCN's
dependency tree, and `source-map-js`. The critical Next.js advisory is fixed by
Next `16.3.8`. TanStack Query was not implicated. Do not run
`npm audit fix --force`; perform targeted dependency upgrades separately.

## 1. What TanStack Query Is

TanStack is an open-source collection of headless frontend libraries. TanStack
Query, formerly called React Query, manages asynchronous server state in React
applications.

Server state is data whose source of truth lives outside the browser:

- The authenticated user
- Patient profiles
- Patient records
- Patient lists
- Documents
- Audit events

TanStack Query does not replace:

- `useState` for local UI state
- React Hook Form for form state
- Zod for runtime validation
- Express authorization
- The HttpOnly session cookie
- Next.js routing and rendering

It replaces repetitive request lifecycle code:

```text
useEffect
  -> AbortController
  -> fetch
  -> loading state
  -> success state
  -> error state
  -> refetch logic
  -> cache synchronization
```

## 2. Laravel Mental Model

TanStack Query is not a direct Laravel equivalent, but these comparisons are
useful:

| TanStack Query concept | Laravel/PHP analogy |
| --- | --- |
| Query function | Repository/service method that retrieves data |
| Query key | Structured cache key |
| Query cache | Client-side application cache |
| `staleTime` | How long cached data is considered fresh |
| Query invalidation | `Cache::forget()` followed by reloading data |
| Mutation | Create/update/delete action |
| `setQueryData` | Directly replacing a known cached value |
| Query provider | Application-level infrastructure registration |

The major difference is location: Laravel executes on the server, while
TanStack Query coordinates server data inside the browser.

## 3. Server State vs. Client State

Use TanStack Query for server state:

```ts
const patientRecordQuery = useQuery(...);
```

Use React state for temporary UI state:

```ts
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

Use React Hook Form for form state:

```ts
const form = useForm<UpdateRecordInput>();
```

Do not copy query results into `useState` without a specific reason:

```ts
// Avoid: two sources of truth.
const query = useQuery(...);
const [record, setRecord] = useState(query.data);
```

Render from `query.data`, or update the query cache after a mutation.

## 4. Why It Fits This Project

This application calls Express directly from Client Components. The Express API
owns authentication and sets an HttpOnly cookie. Browser requests must include:

```ts
credentials: "include"
```

Because the browser, not the Next.js server, owns this request flow, a client-side
server-state library is appropriate.

TanStack Query will provide:

- One cached current-user request
- Request deduplication across components
- Consistent loading and error state
- Cancellation through `AbortSignal`
- Record/profile caching
- Mutation state for future clinician updates
- Explicit cache invalidation after writes

## 5. Planned Project Structure

```text
web/src/
  app/
    providers.tsx
    (protected)/
      layout.tsx
      account/
        page.tsx
        profile/page.tsx
        record/page.tsx
  hooks/
    use-auth.ts
    use-patient-profile.ts
    use-patient-record.ts
  lib/
    api.ts
    date.ts
    query-keys.ts
  components/
    shared/
      page-loading.tsx
      page-error.tsx
      empty-state.tsx
```

This structure is intentionally small. Do not create a generic repository layer,
query factory framework, or global state store unless later requirements justify
it.

## 6. QueryClient and QueryClientProvider

Install the React adapter:

```powershell
npm install @tanstack/react-query
```

The `QueryClient` owns the query and mutation caches. React components access it
through `QueryClientProvider`.

The provider must be a Client Component:

```tsx
"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Create the client once. Creating `new QueryClient()` during every render destroys
the cache and defeats the library.

The root layout remains a Server Component and renders the Client provider:

```tsx
<body>
  <Providers>{children}</Providers>
</body>
```

## 7. The API Client

TanStack Query does not make HTTP requests itself. Query functions can use
`fetch`, Axios, or another HTTP client.

This project should use one small `apiFetch` wrapper:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is required");
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? "The request failed",
    );
  }

  return body as T;
}
```

Responsibilities of `apiFetch`:

- Prefix the API base URL
- Include credentials
- Parse JSON consistently
- Handle `204 No Content`
- Convert API failures into a typed `ApiError`

It should not:

- Redirect the browser
- Know which roles are allowed
- Render error messages
- Store application data

## 8. Query Keys

Every query is identified by a serializable array:

```ts
["auth", "me"]
["patients", "me", "profile"]
["patients", "me", "record"]
["patients", patientId]
["patients", patientId, "record"]
```

Query keys control caching. Two queries with the same key share cached data.

Define keys centrally:

```ts
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  patients: {
    all: ["patients"] as const,
    me: {
      profile: ["patients", "me", "profile"] as const,
      record: ["patients", "me", "record"] as const,
    },
    detail: (patientId: number) =>
      ["patients", patientId] as const,
    record: (patientId: number) =>
      ["patients", patientId, "record"] as const,
  },
};
```

Rules:

1. The top-level key must be an array.
2. Include every variable used by the query function.
3. Keep array ordering consistent.
4. Build keys from broad to specific.
5. Do not use display labels as keys.

## 9. Basic Queries

A query describes how to retrieve data:

```ts
type PatientRecord = {
  id: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type PatientRecordResponse = {
  record: PatientRecord | null;
};

export function usePatientRecord() {
  return useQuery({
    queryKey: queryKeys.patients.me.record,
    queryFn: ({ signal }) =>
      apiFetch<PatientRecordResponse>(
        "/api/patients/me/record",
        { signal },
      ),
  });
}
```

The component receives:

```ts
query.data
query.error
query.isPending
query.isError
query.isSuccess
query.isFetching
query.refetch()
```

`isPending` means the query has no resolved data yet.

`isFetching` means a request is currently running. A query can have cached data
and still be fetching in the background.

## 10. Automatic Cancellation

TanStack Query passes an `AbortSignal` to the query function:

```ts
queryFn: ({ signal }) =>
  apiFetch("/api/patients/me", { signal })
```

The API wrapper passes the signal to `fetch`. This replaces the repeated
`AbortController` lifecycle currently written in each page.

If the signal is not consumed, the request can finish and populate the cache even
after the component unmounts. That can sometimes be useful, but this project will
consume the signal for predictable cancellation.

## 11. Authentication

The HttpOnly signed cookie remains the source of authentication. TanStack Query
stores only the safe user returned by `/api/auth/me`:

```ts
type Role = "PATIENT" | "CLINICIAN" | "ADMIN";

type AuthUser = {
  id: number;
  email: string;
  role: Role;
};
```

The authentication hook uses one global query key:

```ts
export function useAuth() {
  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: ({ signal }) =>
      apiFetch<{ user: AuthUser }>("/api/auth/me", { signal }),
    retry: false,
    staleTime: 60_000,
  });

  const user = query.data?.user ?? null;

  return {
    user,
    isLoading: query.isPending,
    isAuthenticated: Boolean(user),
    isUnauthenticated:
      query.error instanceof ApiError &&
      query.error.status === 401,
    hasRole: (...roles: Role[]) =>
      user !== null && roles.includes(user.role),
  };
}
```

Important:

- Do not store the session cookie in React state.
- Do not store the session in `localStorage`.
- Do not decode or inspect the signed cookie in browser JavaScript.
- Frontend role checks control UI only.
- Express remains the security boundary.

## 12. Protected Layout

Authenticated pages should share a route-group layout:

```text
app/(protected)/account/page.tsx
app/(protected)/account/profile/page.tsx
app/(protected)/account/record/page.tsx
```

Parentheses create a route group and do not change the URL.

The protected layout:

1. Calls `useAuth()`
2. Shows one authentication loading state
3. Redirects `401` responses to `/login`
4. Renders authenticated child routes

Individual pages no longer fetch `/api/auth/me`.

Role checks can hide or guard frontend screens, but the matching Express endpoint
must still use `requireRole`.

## 13. Login and Logout

Login is a mutation because it changes session state:

```ts
const loginMutation = useMutation({
  mutationFn: (input: LoginInput) =>
    apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  onSuccess: (result) => {
    queryClient.setQueryData(
      queryKeys.auth.me,
      { user: result.user },
    );
  },
});
```

`setQueryData` is appropriate because login already returns the complete current
user. An additional `/me` request is unnecessary.

Logout should clear authenticated cache data:

```ts
const logoutMutation = useMutation({
  mutationFn: () =>
    apiFetch<void>("/api/auth/logout", {
      method: "POST",
    }),
  onSuccess: () => {
    queryClient.removeQueries({
      queryKey: ["auth"],
    });
    queryClient.removeQueries({
      queryKey: ["patients"],
    });
  },
});
```

Removing patient data prevents one user's cached information from briefly
appearing after another user signs in on the same browser.

## 14. Mutations and Invalidation

Queries read data. Mutations create, update, or delete data.

A future clinician record update could use:

```ts
const updateRecordMutation = useMutation({
  mutationFn: ({
    patientId,
    notes,
  }: {
    patientId: number;
    notes: string;
  }) =>
    apiFetch(`/api/patients/${patientId}/record`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }),
  onSuccess: (_result, variables) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.patients.record(
        variables.patientId,
      ),
    });
  },
});
```

Invalidation marks matching cached queries as stale and refetches active ones.

Use `setQueryData` when the mutation response already contains the exact complete
replacement data. Use invalidation when refetching is simpler or safer.

## 15. Important Defaults

TanStack Query defaults are intentionally aggressive:

- Query data is stale immediately by default.
- Stale active queries can refetch on mount.
- Stale queries can refetch when the window regains focus.
- Stale queries can refetch when the browser reconnects.
- Failed queries retry three times by default.
- Inactive queries remain cached for five minutes by default.

Important options:

### `staleTime`

How long resolved data is considered fresh:

```ts
staleTime: 30_000
```

During those 30 seconds, normal remount/focus behavior will use fresh cached data
without refetching.

### `gcTime`

How long an inactive query remains cached:

```ts
gcTime: 5 * 60_000
```

This does not control freshness. Freshness and garbage collection are separate.

### `retry`

Automatic failed-request retries:

```ts
retry: (failureCount, error) => {
  if (
    error instanceof ApiError &&
    [401, 403, 404].includes(error.status)
  ) {
    return false;
  }

  return failureCount < 1;
}
```

Do not retry deterministic authorization or not-found responses.

## 16. Date Formatting

Date-only values and timestamps have different semantics.

### Date-only values

A date of birth has no time zone. Parsing `"1990-01-15"` directly as a JavaScript
`Date` can shift the displayed date in some time zones.

```ts
export function formatDateOnly(value: string) {
  const [year, month, day] = value
    .slice(0, 10)
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Date(year, month - 1, day).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}
```

### Timestamps

`createdAt` and `updatedAt` represent real instants and should use normal timestamp
parsing:

```ts
export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}
```

Keep these as two functions rather than creating one ambiguous date formatter.

## 17. Shared Page-State Components

TanStack Query owns request state, but visual loading/error/empty components can
still be shared:

```tsx
<PageLoading label="Loading your record" />

<PageError
  title="Unable to load your record"
  message={message}
/>

<EmptyState
  title="No clinical record yet"
  description="A clinician has not created a record."
/>
```

Do not build a component that knows every endpoint, role, status code, and page
layout. Share visual structure, not business decisions.

## 18. Error Handling

Transport errors and expected HTTP errors are different:

- Network/CORS failure: no HTTP response
- `401`: unauthenticated
- `403`: authenticated but forbidden
- `404`: resource absent
- `409`: conflict
- `422` or `400`: validation failure
- `500`: unexpected server failure

The API client converts HTTP failures into `ApiError`. Hooks expose them. Pages
decide what the user should see.

Do not return HTTP `200` for errors just to keep the browser console clean.

## 19. Avoiding Data Leaks Between Users

This application handles healthcare-style information. On logout:

1. Clear the server cookie.
2. Remove authentication queries.
3. Remove all patient/record/document queries.
4. Redirect to login.

Do not leave the prior user's protected data in a long-lived query cache.

The API remains responsible for authorization even if stale frontend data exists.

## 20. Common Anti-Patterns

Avoid:

- Creating a new `QueryClient` every render
- Using array indexes or display text in query keys
- Omitting IDs/filters from query keys
- Copying query data into component state
- Invalidating every query after every mutation
- Retrying `401`, `403`, or `404`
- Treating frontend role checks as security
- Using `localStorage` for the session
- Giving unrelated endpoints the same query key
- Calling queries imperatively from event handlers when a mutation is appropriate
- Building a homemade cache on top of TanStack Query
- Abstracting every query into a generic framework before patterns emerge

## 21. Debugging Checklist

When data appears wrong:

1. Confirm the query key uniquely describes the request.
2. Confirm every request variable is included in the key.
3. Inspect the Network panel.
4. Check whether cached data is fresh or stale.
5. Check whether a mutation invalidates the correct key.
6. Confirm `credentials: "include"` is present in the API client.
7. Confirm `ApiError` preserves the HTTP status and API error code.
8. Confirm logout removes protected query data.
9. Confirm the query function consumes the supplied `signal`.
10. Remember that development Strict Mode can expose lifecycle assumptions.

## 22. Interview Summary

A concise explanation:

> TanStack Query manages asynchronous server state. It provides caching, request
> deduplication, lifecycle state, cancellation, background refetching, mutation
> handling, and cache invalidation. In this application, the Express API and
> HttpOnly cookie remain the source of truth. TanStack Query caches safe API
> responses in the browser and keeps React components synchronized with them.

Be prepared to explain:

- Why query keys matter
- `staleTime` vs. `gcTime`
- Query vs. mutation
- Invalidation vs. `setQueryData`
- Why frontend role checks are not authorization
- Why logout clears protected cached data
- Why date-only values differ from timestamps

## 23. Official References

- Overview: https://tanstack.com/query/latest/docs/framework/react/overview
- Query keys: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
- Important defaults: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
- Query cancellation: https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation
- QueryClient reference: https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient

