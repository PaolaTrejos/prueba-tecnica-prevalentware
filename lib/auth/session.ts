import type { NextApiRequest } from "next";
import { auth } from "@/lib/auth";

export const getSessionFromRequest = async (req: NextApiRequest) => {
    try {
        const session = await auth.api.getSession({
            headers: new Headers(req.headers as HeadersInit),
        });
        return session;
    } catch {
        return null;
    }
};
