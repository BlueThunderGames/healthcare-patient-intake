"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { useAuth, type Role } from "@/hooks/use-auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    return (
      <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <p role="status" className="sr-only">
            Verifying account access
          </p>
          <div className="animate-pulse rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="mt-3 h-8 w-52 rounded bg-muted" />
            <div className="mt-8 h-36 rounded bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (auth.isError || !auth.user) {
    const message =
      auth.error instanceof Error
        ? auth.error.message
        : "We couldn't verify your account.";

    return (
      <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CircleAlert
                aria-hidden="true"
                className="size-6 text-destructive"
              />
              <CardTitle>Unable to verify account access</CardTitle>
              <CardDescription role="alert">{message}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  return children;
}
