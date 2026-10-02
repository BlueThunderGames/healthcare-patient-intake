import type { ReactNode } from "react";
import { HeartPulse, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-7 flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <HeartPulse aria-hidden="true" className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Care Portal</span>
      </div>

      <Card className="w-full max-w-md gap-6">
        <CardHeader className="gap-2 px-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {eyebrow}
          </p>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-sm leading-6">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="justify-center border-t pt-5 text-sm text-muted-foreground">
          {footer}
        </CardFooter>
      </Card>

      <p className="mt-6 flex max-w-md items-center justify-center gap-2 text-center text-xs leading-5 text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-primary" />
        Your account is protected with secure, private access.
      </p>
    </main>
  );
}
