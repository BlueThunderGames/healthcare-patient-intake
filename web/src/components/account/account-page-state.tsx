import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AccountPageShellProps = {
  children: ReactNode;
};

export function AccountPageShell({ children }: AccountPageShellProps) {
  return (
    <main className="flex-1 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </main>
  );
}

type AccountPageSkeletonProps = {
  label: string;
};

export function AccountPageSkeleton({ label }: AccountPageSkeletonProps) {
  return (
    <AccountPageShell>
      <p role="status" className="sr-only">
        {label}
      </p>
      <Card aria-hidden="true" className="gap-0 p-6 sm:p-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-52" />
        <Skeleton className="mt-8 h-36 w-full" />
      </Card>
    </AccountPageShell>
  );
}

type AccountErrorStateProps = {
  title: string;
  message: string;
  backHref?: string;
  backLabel?: string;
};

export function AccountErrorState({
  title,
  message,
  backHref,
  backLabel = "Back to account",
}: AccountErrorStateProps) {
  return (
    <AccountPageShell>
      {backHref && (
        <Button variant="outline" asChild className="mb-6">
          <Link href={backHref}>
            <ArrowLeft aria-hidden="true" />
            {backLabel}
          </Link>
        </Button>
      )}
      <Alert variant="destructive">
        <CircleAlert aria-hidden="true" />
        <h1 className="font-semibold tracking-tight">{title}</h1>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </AccountPageShell>
  );
}
