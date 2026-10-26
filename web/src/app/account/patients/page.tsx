"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert, Search, Users } from "lucide-react";
import {
  AccountErrorState,
  AccountPageShell,
  AccountPageSkeleton,
} from "@/components/account/account-page-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientList } from "@/hooks/use-patient-list";
import { formatDateOnly } from "@/lib/date";

export default function PatientsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const patientsQuery = usePatientList(search);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput);
  }

  if (patientsQuery.isPending) {
    return <AccountPageSkeleton label="Loading patients" />;
  }

  if (patientsQuery.isError && !patientsQuery.data) {
    const message =
      patientsQuery.error instanceof Error
        ? patientsQuery.error.message
        : "We couldn't load the patient list. Please try again.";

    return (
      <AccountErrorState
        title="Unable to load patients"
        message={message}
        backHref="/account"
      />
    );
  }

  const patients = patientsQuery.data?.patients ?? [];

  return (
    <AccountPageShell>
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary">
            CARE PORTAL
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Patients
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Find a patient by name or email address.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/account">
            <ArrowLeft aria-hidden="true" />
            Back to account
          </Link>
        </Button>
      </header>

      <form onSubmit={handleSearch} className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor="patient-search" className="text-sm font-medium">
            Search patients
          </label>
          <Input
            id="patient-search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            type="search"
            placeholder="Name or email address"
            autoComplete="off"
          />
        </div>
        <Button type="submit" className="sm:mt-7">
          <Search aria-hidden="true" />
          Search
        </Button>
      </form>

      {patientsQuery.isError && (
        <Alert variant="destructive" className="mb-5">
          <CircleAlert aria-hidden="true" />
          <AlertDescription>
            {patientsQuery.error instanceof Error
              ? patientsQuery.error.message
              : "We couldn't load the patient list. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {patientsQuery.isFetching && patientsQuery.isPlaceholderData ? (
        <div role="status" aria-label="Loading patients" className="grid gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : patients.length === 0 ? (
        <Card>
          <CardContent className="flex items-start gap-3">
            <Users aria-hidden="true" className="mt-0.5 size-5 text-primary" />
            <div>
              <h2 className="font-semibold tracking-tight">No patients found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Try a different name or email address."
                  : "No patient profiles are available yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Card>
                <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <h2 className="font-semibold tracking-tight">
                      {patient.firstName} {patient.lastName}
                    </h2>
                    <p className="mt-1 break-all text-sm text-muted-foreground">
                      {patient.email}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Date of birth:{" "}
                    </span>
                    {formatDateOnly(patient.dateOfBirth)}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </AccountPageShell>
  );
}
