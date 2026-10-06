"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CircleAlert,
  FileHeart,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PatientRecord = {
  id: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type PageState =
  | { status: "loading" }
  | { status: "ready"; record: PatientRecord }
  | { status: "empty" }
  | { status: "forbidden" }
  | { status: "not-found" }
  | { status: "error"; message: string };

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RecordPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecord() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients/me/record`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          setPageState({ status: "forbidden" });
          return;
        }

        if (response.status === 404) {
          setPageState({ status: "not-found" });
          return;
        }

        if (!response.ok) {
          throw new Error("We couldn't load your record. Please try again.");
        }

        const result = (await response.json()) as {
          record: PatientRecord | null;
        };

        setPageState(
          result.record
            ? { status: "ready", record: result.record }
            : { status: "empty" },
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load record:", error);
        setPageState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        });
      }
    }

    void loadRecord();
    return () => controller.abort();
  }, [router]);

  if (pageState.status === "loading") {
    return (
      <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <p role="status" className="sr-only">
            Loading your record
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

  if (
    pageState.status === "error" ||
    pageState.status === "forbidden" ||
    pageState.status === "not-found"
  ) {
    const content = {
      error: {
        title: "Unable to load your record",
        message: pageState.status === "error" ? pageState.message : "",
      },
      forbidden: {
        title: "Record access unavailable",
        message: "This account does not have access to a patient record.",
      },
      "not-found": {
        title: "Patient profile unavailable",
        message: "We couldn't find a patient profile for this account.",
      },
    }[pageState.status];

    return (
      <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/account">
              <ArrowLeft aria-hidden="true" />
              Back to account
            </Link>
          </Button>
          <Card>
            <CardHeader>
              <CircleAlert
                aria-hidden="true"
                className="size-6 text-destructive"
              />
              <CardTitle>{content.title}</CardTitle>
              <CardDescription role="alert">
                {content.message}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  if (pageState.status === "empty") {
    return (
      <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-4xl">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/account">
              <ArrowLeft aria-hidden="true" />
              Back to account
            </Link>
          </Button>
          <Card>
            <CardHeader>
              <FileHeart aria-hidden="true" className="size-6 text-primary" />
              <CardTitle>No clinical record yet</CardTitle>
              <CardDescription>
                A clinician has not created a clinical record for your account.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  const { record } = pageState;

  return (
    <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">
              PATIENT PORTAL
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your clinical record
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Review the clinical notes currently available to you.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/account">
              <ArrowLeft aria-hidden="true" />
              Back to account
            </Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <FileHeart aria-hidden="true" className="size-5" />
              </span>
              <div>
                <CardTitle>Clinical notes</CardTitle>
                <CardDescription className="mt-1">
                  Record #{record.id}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/30 p-4 sm:p-5">
              <p className="whitespace-pre-wrap text-sm leading-7">
                {record.notes}
              </p>
            </div>
            <dl className="grid gap-5 border-t pt-5 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CalendarClock aria-hidden="true" className="size-4" />
                  Created
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDateTime(record.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CalendarClock aria-hidden="true" className="size-4" />
                  Last updated
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDateTime(record.updatedAt)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <aside className="mt-5 flex items-start gap-3 rounded-lg border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          <p>
            Clinical records are read-only for patients and can only be updated
            by authorized clinical staff.
          </p>
        </aside>
      </div>
    </main>
  );
}