"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CircleAlert,
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

type AccountUser = {
  id: number;
  email: string;
  role: string;
};

type PageState =
  | { status: "loading" }
  | { status: "ready"; user: AccountUser }
  | { status: "error"; message: string };

export default function AccountPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>({
    status: "loading",
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("We couldn't load your account. Please try again.");
        }

        const result = (await response.json()) as { user: AccountUser };
        setPageState({ status: "ready", user: result.user });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load account:", error);
        setPageState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        });
      }
    }

    void loadUser();
    return () => controller.abort();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("We couldn't sign you out. Please try again.");
      }

      router.replace("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
      setLogoutError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while signing out.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (pageState.status === "loading") {
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

  if (pageState.status === "error") {
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
              <CardDescription role="alert">{pageState.message}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  const { user } = pageState;

  return (
    <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">
              PATIENT PORTAL
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your sign-in details and view your patient profile.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut aria-hidden="true" />
            {isLoggingOut ? "Signing out…" : "Sign out"}
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

        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <Card>
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
        </div>
      </div>
    </main>
  );
}
