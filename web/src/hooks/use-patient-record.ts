import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

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