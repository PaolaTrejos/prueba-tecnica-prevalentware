import { useSession } from "@/lib/auth/client";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home = () => {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending) {
            if (session) {
                router.push("/dashboard");
            } else {
                router.push("/login");
            }
        }
    }, [session, isPending, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirigiendo...</p>
            </div>
        </div>
    );
};

export default Home;
