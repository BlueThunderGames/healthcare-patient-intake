import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ClinicianPatientsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGuard allowedRoles={["CLINICIAN"]}>{children}</AuthGuard>;
}
