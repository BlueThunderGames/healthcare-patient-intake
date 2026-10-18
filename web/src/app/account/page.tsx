"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CircleAlert,
  FileHeart,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountPage() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth.user;

  useEffect(() => {
    if (auth.isUnauthenticated) {
      router.replace("/login");
    }
  }, [auth.isUnauthenticated, router]);

  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiFetch<void>("/api/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: queryKeys.auth.me,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.patients.all,
      });
      router.replace("/login");
    },
  });

  const logoutError =
  logoutMutation.error instanceof Error
    ? logoutMutation.error.message
    : null;

  if (auth.isLoading || auth.isUnauthenticated) {
    return (
      <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <p role="status" className="sr-only">
            Loading your account
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

  if (auth.isError || !user) {
    const message =
      auth.error instanceof Error
        ? auth.error.message
        : "We couldn't load your account.";
    return (
      <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CircleAlert
                aria-hidden="true"
                className="size-6 text-destructive"
              />
              <CardTitle>Unable to load your account</CardTitle>
              <CardDescription role="alert">{message}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">
              {user.role === "PATIENT" ? "PATIENT PORTAL" : "CARE PORTAL"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your sign-in details and access available portal tools.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut aria-hidden="true" />
            {logoutMutation.isPending ? "Signing out…" : "Sign out"}
          </Button>
        </header>

        {logoutError && (
          <p
            role="alert"
            className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {logoutError}
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <UserRound aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <CardTitle>Account details</CardTitle>
                  <CardDescription className="mt-1">
                    Information linked to your sign-in
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 border-t pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Email address
                  </dt>
                  <dd className="mt-1 break-all font-medium">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Account role
                  </dt>
                  <dd className="mt-1">
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {user.role}
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {user.role === "PATIENT" && (
            <>
              <Card className="justify-between">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                      <ShieldCheck aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <CardTitle>Patient profile</CardTitle>
                      <CardDescription className="mt-1">
                        Review your personal details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    View the profile information associated with your patient
                    account.
                  </p>
                  <Button asChild className="mt-5 w-full">
                    <Link href="/account/profile">
                      View profile
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="justify-between">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                      <FileHeart aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <CardTitle>Clinical record</CardTitle>
                      <CardDescription className="mt-1">
                        View your available clinical notes
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Review the read-only clinical record maintained by your care
                    team.
                  </p>
                  <Button asChild className="mt-5 w-full">
                    <Link href="/account/record">
                      View record
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </main>
  );
}