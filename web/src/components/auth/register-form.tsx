"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  profile: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().refine((date) => {
      const parsedDate = new Date(date);
      return !Number.isNaN(parsedDate.getTime());
    }, {
      message: "Enter a valid date of birth",
    }),
  }),
});

type RegisterInput = z.infer<typeof registerSchema>;
type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function RegisterForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      profile: {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
      },
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = (await response.json()) as ApiErrorResponse;

      if (!response.ok) {
        setServerMessage(
          result.error?.message ?? "Unable to create your account.",
        );
        return;
      }

      setSuccessMessage("Your account was created. You can now sign in.");
      reset();
    } catch {
      setServerMessage(
        "We couldn't reach the registration service. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {successMessage && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-foreground"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          {successMessage}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First name
          </label>
          <Input
            {...register("profile.firstName")}
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-invalid={Boolean(errors.profile?.firstName)}
            aria-describedby={
              errors.profile?.firstName ? "first-name-error" : undefined
            }
          />
          {errors.profile?.firstName && (
            <p id="first-name-error" className="text-sm text-destructive">
              {errors.profile.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </label>
          <Input
            {...register("profile.lastName")}
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-invalid={Boolean(errors.profile?.lastName)}
            aria-describedby={
              errors.profile?.lastName ? "last-name-error" : undefined
            }
          />
          {errors.profile?.lastName && (
            <p id="last-name-error" className="text-sm text-destructive">
              {errors.profile.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <Input
          {...register("email")}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="dateOfBirth" className="text-sm font-medium">
          Date of birth
        </label>
        <Input
          {...register("profile.dateOfBirth")}
          id="dateOfBirth"
          type="date"
          autoComplete="bday"
          aria-invalid={Boolean(errors.profile?.dateOfBirth)}
          aria-describedby={
            errors.profile?.dateOfBirth ? "date-of-birth-error" : undefined
          }
        />
        {errors.profile?.dateOfBirth && (
          <p id="date-of-birth-error" className="text-sm text-destructive">
            {errors.profile.dateOfBirth.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          {...register("password")}
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-hint" : undefined}
        />
        <p
          id="password-hint"
          className={
            errors.password
              ? "text-sm text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {errors.password?.message ?? "Use at least 8 characters."}
        </p>
      </div>

      {serverMessage && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          {serverMessage}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" />
            Creating account…
          </>
        ) : (
          "Create patient account"
        )}
      </Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        By creating an account, you confirm these details are yours.
      </p>
    </form>
  );
}
