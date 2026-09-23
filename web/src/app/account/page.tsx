"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<{
        id: number;
        email: string;
        role: string;
    } | null>(null);

    useEffect(() => {
        async function loadUser() {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                { credentials: "include" },
            );

            if (!response.ok) {
                router.replace("/login");
                return;
            }

            const result = await response.json();
            setUser(result.user);
        }

        void loadUser();
    }, [router]);

    const handleLogout = async () => {
        setIsLoading(true);
    
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
                {
                    method: "POST",
                    credentials: "include",
                },
            );

            if(response.ok) {
                router.replace("/login");
            } 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main>
            <h1>Your account details</h1>
            <p><strong>Email: </strong>{user?.email}</p>
            <p><strong>Role: </strong>{user?.role}</p>
            <button onClick={handleLogout} disabled={isLoading}>
                {isLoading ? "Signing out..." : "Logout"}
            </button>
        </main>
    );
}