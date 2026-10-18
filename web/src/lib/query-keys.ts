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