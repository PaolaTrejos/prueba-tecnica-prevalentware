import { useSession, signOut } from "@/lib/auth/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import type { ExtendedSession } from "@/types/session";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const typedSession = session as ExtendedSession | null;

    useEffect(() => {
        if (!isPending && !typedSession) {
            router.push("/login");
        }
    }, [typedSession, isPending, router]);

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
            },
        });
    };

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!typedSession) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    typedSession.user.role === "ADMIN"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                            >
                                {typedSession.user.role === "ADMIN" ? "Admin" : "Usuario"}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                {typedSession.user.image && (
                                    <img
                                        src={typedSession.user.image}
                                        alt={typedSession.user.name}
                                        className="h-10 w-10 rounded-full"
                                    />
                                )}
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{typedSession.user.name}</p>
                                    <p className="text-gray-500">{typedSession.user.email}</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleSignOut}
                                variant="destructive"
                                size="sm"
                            >
                                Cerrar Sesión
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Bienvenido, {typedSession.user.name}!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Has iniciado sesión exitosamente en el sistema de gestión de ingresos y egresos.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <button
                            onClick={() => router.push("/transactions")}
                            className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left"
                        >
                            <h3 className="font-semibold text-blue-900 mb-2">💰 Transacciones</h3>
                            <p className="text-sm text-blue-700">Gestión de ingresos y egresos</p>
                        </button>

                        {typedSession.user.role === "ADMIN" && (
                            <>
                                <button
                                    onClick={() => router.push("/users")}
                                    className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left"
                                >
                                    <h3 className="font-semibold text-purple-900 mb-2">👥 Usuarios</h3>
                                    <p className="text-sm text-purple-700">Gestión de usuarios</p>
                                </button>

                                <button
                                    onClick={() => router.push("/reports")}
                                    className="bg-green-50 p-4 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left"
                                >
                                    <h3 className="font-semibold text-green-900 mb-2">📊 Reportes</h3>
                                    <p className="text-sm text-green-700">Gráficos y estadísticas</p>
                                </button>
                            </>
                        )}
                    </div>

                    {/* API Documentation Link */}
                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-indigo-900 mb-1">📚 Documentación de la API</h3>
                                <p className="text-sm text-indigo-700">
                                    Explora los endpoints disponibles con Swagger/OpenAPI
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push("/api-docs")}
                                variant="default"
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                Ver Docs
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
