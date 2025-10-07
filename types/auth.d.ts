import type { Role } from "@prisma/client";

declare module "better-auth/react" {
    interface Session {
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null;
            role: Role;
        };
    }
}

export {};
