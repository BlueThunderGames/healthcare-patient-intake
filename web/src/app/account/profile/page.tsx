"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type PatientProfile = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
};

type PageState =
  | { status: "loading" }
  | { status: "success"; patient: PatientProfile }
  | { status: "not-found" }
  | { status: "error"; message: string };

function formatDateOfBirth(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 break-words text-base font-medium text-card-foreground">
          {value}
        </dd>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPatientData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients/me`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 404) {
          setPageState({ status: "not-found" });
          return;
        }

        if (!response.ok) {
          throw new Error("We couldn't load your profile. Please try again.");
        }

        const data = (await response.json()) as {
          profile: PatientProfile;
        };

        setPageState({ status: "success", patient: data.profile });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load patient profile:", error);
        setPageState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        });
      }
    }

    void fetchPatientData();
    return () => controller.abort();
  }, [router]);

  if (pageState.status === "loading") {
    return (
      <main className="min-h-full flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <p role="status" className="sr-only">
            Loading your profile
          </p>
          <div className="animate-pulse rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="mt-3 h-8 w-48 rounded bg-muted" />
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div className="h-14 rounded bg-muted" />
              <div className="h-14 rounded bg-muted" />
              <div className="h-14 rounded bg-muted" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (pageState.status === "not-found" || pageState.status === "error") {
    const isNotFound = pageState.status === "not-found";
    const message = isNotFound
      ? "We couldn't find a patient profile for this account."
      : pageState.message;

    return (
      <main className="min-h-full flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/account">
              <ArrowLeft aria-hidden="true" />
              Back to account
            </Link>
          </Button>
          <section
            aria-labelledby="profile-error-heading"
            className="rounded-xl border bg-card p-6 shadow-sm sm:p-8"
          >
            <CircleAlert
              aria-hidden="true"
              className="size-6 text-destructive"
            />
            <h1
              id="profile-error-heading"
              className="mt-4 text-xl font-semibold tracking-tight"
            >
              {isNotFound ? "Profile unavailable" : "Unable to load profile"}
            </h1>
            <p role="alert" className="mt-2 text-sm text-muted-foreground">
              {message}
            </p>
          </section>
        </div>
      </main>
    );
  }

  const { patient } = pageState;

  return (
    <main className="min-h-full flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">
              PATIENT PORTAL
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your profile
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Review the personal information associated with your account.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/account">
              <ArrowLeft aria-hidden="true" />
              Back to account
            </Link>
          </Button>
        </header>

        <section
          aria-labelledby="personal-information-heading"
          className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
        >
          <div className="border-b px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <UserRound aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2
                  id="personal-information-heading"
                  className="font-semibold tracking-tight"
                >
                  Personal information
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Your registered patient details
                </p>
              </div>
            </div>
          </div>

          <dl className="grid gap-7 px-6 py-7 sm:grid-cols-2 sm:px-8">
            <ProfileField
              icon={UserRound}
              label="First name"
              value={patient.firstName}
            />
            <ProfileField
              icon={UserRound}
              label="Last name"
              value={patient.lastName}
            />
            <ProfileField
              icon={CalendarDays}
              label="Date of birth"
              value={formatDateOfBirth(patient.dateOfBirth)}
            />
          </dl>
        </section>

        <aside className="mt-5 flex items-start gap-3 rounded-lg border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          <p>
            Your personal information is protected and available only to
            authorized users of the patient portal.
          </p>
        </aside>
      </div>
    </main>
  );
}
