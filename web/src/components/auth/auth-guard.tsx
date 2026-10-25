"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AccountErrorState,
  AccountPageSkeleton,
} from "@/components/account/account-page-state";
import { useAuth, type Role } from "@/hooks/use-auth";

type AuthGuardProps = {
  children: ReactNode;
  allowedRoles?: readonly Role[];
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const auth = useAuth();
  const isForbidden =
    auth.user !== null &&
    allowedRoles !== undefined &&
    !allowedRoles.includes(auth.user.role);

  useEffect(() => {
    if (auth.isUnauthenticated) {
      router.replace("/login");
    } else if (isForbidden) {
      router.replace("/account");
    }
  }, [auth.isUnauthenticated, isForbidden, router]);

  if (auth.isLoading || auth.isUnauthenticated || isForbidden) {
    return <AccountPageSkeleton label="Verifying account access" />;
  }

  if (auth.isError || !auth.user) {
    const message =
      auth.error instanceof Error
        ? auth.error.message
        : "We couldn't verify your account.";

    return (
      <AccountErrorState
        title="Unable to verify account access"
        message={message}
      />
    );
  }

  return children;
}
