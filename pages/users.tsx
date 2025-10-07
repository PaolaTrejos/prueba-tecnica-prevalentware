import { useSession } from "@/lib/auth/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { ExtendedSession } from "@/types/session";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, AlertDialog } from "@/components/ui/confirm-dialog";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: "USER" | "ADMIN";
    image?: string | null;
    createdAt: string;
    _count: {
        transactions: number;
    };
}

const UsersPage = () => {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const typedSession = session as ExtendedSession | null;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string; }>({ open: false, id: "", name: "" });
    const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string; }>({ open: false, message: "" });

    useEffect(() => {
        if (!isPending && !typedSession) {
            router.push("/login");
        } else if (!isPending && typedSession?.user.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [typedSession, isPending, router]);

    useEffect(() => {
        if (typedSession?.user.role === "ADMIN") {
            fetchUsers();
        }
    }, [typedSession]);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            // Error al cargar usuarios
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, userName: string) => {
        setDeleteDialog({ open: true, id, name: userName });
    };

    const confirmDelete = async () => {
        const { id } = deleteDialog;
        
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setUsers(users.filter((u) => u.id !== id));
            } else {
                const error = await response.json();
                setErrorDialog({ open: true, message: error.error || "Error al eliminar usuario" });
            }
        } catch (error) {
            setErrorDialog({ open: true, message: "Error al eliminar usuario" });
        }
    };

    if (isPending || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!typedSession || typedSession.user.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={() => router.push("/dashboard")}
                                variant="ghost"
                                size="sm"
                            >
                                ← Volver
                            </Button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Gestión de Usuarios
                            </h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">{typedSession.user.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Usuarios Registrados ({users.length})
                        </h2>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Correo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Teléfono
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transacciones
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {user.image && (
                                                        <img
                                                            src={user.image}
                                                            alt={user.name}
                                                            className="h-10 w-10 rounded-full mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        {user.id === typedSession.user.id && (
                                                            <span className="text-xs text-blue-600">(Tú)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.phone || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === "ADMIN"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user._count.transactions}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                <Button
                                                    onClick={() => setEditingUser(user)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    Editar
                                                </Button>
                                                {user.id !== typedSession.user.id && (
                                                    <Button
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        Eliminar
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal para editar usuario */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={() => {
                        setEditingUser(null);
                        fetchUsers();
                    }}
                />
            )}

            {/* Diálogos de confirmación */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: "", name: "" })}
                title="Eliminar usuario"
                description={`¿Estás seguro de eliminar al usuario "${deleteDialog.name}"? Esta acción no se puede deshacer.`}
                onConfirm={confirmDelete}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="destructive"
            />

            <AlertDialog
                open={errorDialog.open}
                onOpenChange={(open) => setErrorDialog({ open, message: "" })}
                title="Error"
                description={errorDialog.message}
            />
        </div>
    );
};

// Modal Component
const EditUserModal = ({
    user,
    onClose,
    onSave,
}: {
    user: User;
    onClose: () => void;
    onSave: () => void;
}) => {
    const [formData, setFormData] = useState({
        name: user.name,
        phone: user.phone || "",
        role: user.role,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSave();
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Error al actualizar usuario");
            }
        } catch (error) {
            setError("Error al actualizar usuario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Editar Usuario
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="Ej: +57 300 123 4567"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rol
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value as "USER" | "ADMIN",
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="USER">Usuario</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600">
                            <strong>Correo:</strong> {user.email}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsersPage;
