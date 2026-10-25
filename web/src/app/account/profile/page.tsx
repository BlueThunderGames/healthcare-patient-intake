"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ShieldCheck,
  UserRound,
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
import { usePatientProfile } from "@/hooks/use-patient-profile";
import { ApiError } from "@/lib/api";
import { formatDateOnly } from "@/lib/date";

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
  const profileQuery = usePatientProfile();

  if (profileQuery.isPending) {
    return <AccountPageSkeleton label="Loading your profile" />;
  }

  if (profileQuery.isError) {
    const isNotFound =
      profileQuery.error instanceof ApiError &&
      profileQuery.error.status === 404;
    const message = isNotFound
      ? "We couldn't find a patient profile for this account."
      : profileQuery.error instanceof Error
        ? profileQuery.error.message
        : "We couldn't load your profile. Please try again.";

    return (
      <AccountErrorState
        title={isNotFound ? "Profile unavailable" : "Unable to load profile"}
        message={message}
        backHref="/account"
      />
    );
  }

  const patient = profileQuery.data.profile;

  return (
    <AccountPageShell>
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

      <Card
        aria-labelledby="personal-information-heading"
        className="gap-0 overflow-hidden py-0"
      >
        <CardHeader className="border-b px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <UserRound aria-hidden="true" className="size-5" />
            </span>
            <div>
              <CardTitle
                id="personal-information-heading"
                className="text-base"
              >
                Personal information
              </CardTitle>
              <CardDescription className="mt-0.5">
                Your registered patient details
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-7 sm:px-8">
          <dl className="grid gap-7 sm:grid-cols-2">
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
              value={formatDateOnly(patient.dateOfBirth)}
            />
          </dl>
        </CardContent>
      </Card>

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
    </AccountPageShell>
  );
}
