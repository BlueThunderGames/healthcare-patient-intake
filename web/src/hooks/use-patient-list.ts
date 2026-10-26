import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export type PatientListItem = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
};

type PatientListResponse = {
  patients: PatientListItem[];
};

export function usePatientList(search: string) {
  const query = search.trim();
  const params = query ? `?q=${encodeURIComponent(query)}` : "";

  return useQuery({
    queryKey: queryKeys.patients.list(query),
    queryFn: ({ signal }) =>
      apiFetch<PatientListResponse>(`/api/patients${params}`, { signal }),
    placeholderData: keepPreviousData,
  });
}
