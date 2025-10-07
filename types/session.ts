import type { Role } from "@prisma/client";

// Extender los tipos de Better Auth
export interface ExtendedUser {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    role: Role;
}

export interface ExtendedSession {
    user: ExtendedUser;
    session: {
        id: string;
        expiresAt: Date;
        token: string;
        createdAt: Date;
        updatedAt: Date;
        ipAddress?: string | null;
        userAgent?: string | null;
        userId: string;
    };
}
