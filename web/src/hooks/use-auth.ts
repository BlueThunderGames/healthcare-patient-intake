import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export type Role = "PATIENT" | "CLINICIAN" | "ADMIN";

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
};

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
      error: query.error,
      isError: query.isError, 
      isAuthenticated: Boolean(user),
      isUnauthenticated:
        query.error instanceof ApiError &&
        query.error.status === 401,
      hasRole: (...roles: Role[]) =>
        user !== null && roles.includes(user.role),
    };
}