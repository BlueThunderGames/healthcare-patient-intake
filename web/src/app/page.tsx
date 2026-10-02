import Link from "next/link";
import {
  ArrowRight,
  FileHeart,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    icon: LockKeyhole,
    title: "Private by design",
    description:
      "Your account is protected with secure sign-in and private session access.",
  },
  {
    icon: FileHeart,
    title: "Your information, organized",
    description:
      "Find your patient profile and health information in one clear place.",
  },
  {
    icon: ShieldCheck,
    title: "Access with care",
    description:
      "Patient information is available only to authorized portal users.",
  },
];

export default function Home() {
  return (
    <main className="flex-1 bg-background">
      <header className="border-b bg-card/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse aria-hidden="true" className="size-5" />
            </span>
            <span className="font-semibold tracking-tight">Care Portal</span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Create account</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary)/12,transparent_55%)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-xs">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Your health information, in one place
            </p>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Care starts with feeling informed.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Sign in to view your patient profile and keep your personal
              information close at hand.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/login">
                  Sign in to your account
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Create a patient account</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Patient access only. Staff accounts are provided by the clinic.
            </p>
          </div>

          <Card className="gap-0 overflow-hidden border-primary/10 bg-card shadow-lg shadow-primary/5">
            <CardHeader className="border-b bg-primary/[0.035] px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HeartPulse aria-hidden="true" className="size-6" />
                </span>
                <div>
                  <CardTitle className="text-base">A simpler patient portal</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The essentials, thoughtfully organized.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-0 px-6 sm:px-7">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 border-b py-5 last:border-0 last:pb-6"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Care Portal</p>
          <p>
            For demonstration purposes. Do not enter real medical or personal
            information.
          </p>
        </div>
      </footer>
    </main>
  );
}
