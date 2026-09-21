"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    profile: z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        dateOfBirth: z.string().refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, {
            message: "Enter a valid date of birth",
        }),
    }),
});

type RegisterInput = z.infer<typeof registerSchema>;

type ApiErrorResponse = {
    error?: {
        message?: string;
    }
}

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                setServerMessage(result.error?.message ?? "Unable to create your account");
                return;
            };

            setSuccessMessage("Account created successfully");
            reset();

        } catch {
            setServerMessage("Unable to create your account");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    {...register("email")}
                    id="email"
                    type="email"
                    autoComplete="email"
                />
                {errors.email && <p>{errors.email.message}</p>}
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input
                    {...register("password")}
                    id="password"
                    type="password"
                    autoComplete="new-password"
                />
                {errors.password && <p>{errors.password.message}</p>}
            </div>
            <div>
                <label htmlFor="firstName">First name</label>
                <input
                    {...register("profile.firstName")}
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                />
                {errors.profile?.firstName && (
                    <p>{errors.profile.firstName.message}</p>
                )}
            </div>
            <div>
                <label htmlFor="lastName">Last name</label>
                <input
                    {...register("profile.lastName")}
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                />
                {errors.profile?.lastName && (
                    <p>{errors.profile.lastName.message}</p>
                )}
            </div>
            <div>
                <label htmlFor="dateOfBirth">Date of birth</label>
                <input
                    {...register("profile.dateOfBirth")}
                    id="dateOfBirth"
                    type="date"
                />
                {errors.profile?.dateOfBirth && (
                    <p>{errors.profile.dateOfBirth.message}</p>
                )}
            </div>
            {serverMessage && <p role="alert">{serverMessage}</p>}
            {successMessage && <p>{successMessage}</p>}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Register"}
            </button>
        </form>
    );
}