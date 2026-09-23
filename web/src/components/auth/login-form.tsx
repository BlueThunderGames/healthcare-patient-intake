"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {

    const router = useRouter();
    const [serverMessage, setServerMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginInput) => {
        setServerMessage(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setServerMessage(result.error?.message ?? "Unable to sign in");
                return;
            }

            router.push("/account");

        } catch {
            setServerMessage("Unable to sign in");
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
                    autoComplete="current-password"
                />
                {errors.password && <p>{errors.password.message}</p>}
            </div>
            {serverMessage && <p role="alert">{serverMessage}</p>}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
        </form>
    );
}