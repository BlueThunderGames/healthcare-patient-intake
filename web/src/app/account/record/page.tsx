"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  FileHeart,
  ShieldCheck,
} from "lucide-react";
import {
  AccountErrorState,
  AccountPageShell,
  AccountPageSkeleton,
} from "@/components/account/account-page-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePatientRecord } from "@/hooks/use-patient-record";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/date";

function getRecordErrorContent(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return {
      title: "Record access unavailable",
      message: "This account does not have access to a patient record.",
    };
  }

  if (error instanceof ApiError && error.status === 404) {
    return {
      title: "Patient profile unavailable",
      message: "We couldn't find a patient profile for this account.",
    };
  }

  return {
    title: "Unable to load your record",
    message:
      error instanceof Error
        ? error.message
        : "We couldn't load your record. Please try again.",
  };
}

export default function RecordPage() {
  const recordQuery = usePatientRecord();

  if (recordQuery.isPending) {
    return <AccountPageSkeleton label="Loading your record" />;
  }

  if (recordQuery.isError) {
    const content = getRecordErrorContent(recordQuery.error);

    return (
      <AccountErrorState
        title={content.title}
        message={content.message}
        backHref="/account"
      />
    );
  }

  const record = recordQuery.data.record;

  if (!record) {
    return (
      <AccountPageShell>
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
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell>
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
    </AccountPageShell>
  );
}