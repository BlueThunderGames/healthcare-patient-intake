import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export type PatientProfile = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
};

type PatientProfileResponse = {
  profile: PatientProfile;
};

export function usePatientProfile() {
  return useQuery({
    queryKey: queryKeys.patients.me.profile,
    queryFn: ({ signal }) =>
      apiFetch<PatientProfileResponse>("/api/patients/me", { signal }),
  });
}
