import { useSession } from "@/lib/auth/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { ExtendedSession } from "@/types/session";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, AlertDialog } from "@/components/ui/confirm-dialog";

interface Transaction {
    id: string;
    concepto: string;
    monto: number;
    tipo: "INGRESO" | "EGRESO";
    fecha: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

const TransactionsPage = () => {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const typedSession = session as ExtendedSession | null;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; }>({ open: false, id: "" });
    const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string; }>({ open: false, message: "" });

    // Función para formatear fecha correctamente
    const formatDate = (fecha: string) => {
        try {
            // La fecha viene en formato ISO, se extrae solo la parte de la fecha
            const dateStr = fecha.split("T")[0];
            const [year, month, day] = dateStr.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

            return date.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "Fecha inválida";
        }
    };

    useEffect(() => {
        if (!isPending && !typedSession) {
            router.push("/login");
        }
    }, [typedSession, isPending, router]);

    useEffect(() => {
        if (typedSession) {
            fetchTransactions();
        }
    }, [typedSession]);

    const fetchTransactions = async () => {
        try {
            const response = await fetch("/api/transactions");
            if (response.ok) {
                const data = await response.json();
                setTransactions(data);
            }
        } catch (error) {
            // Error al cargar transacciones
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteDialog({ open: true, id });
    };

    const confirmDelete = async () => {
        const id = deleteDialog.id;
        
        try {
            const response = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setTransactions(transactions.filter((t) => t.id !== id));
            } else {
                setErrorDialog({ open: true, message: "Error al eliminar la transacción" });
            }
        } catch (error) {
            setErrorDialog({ open: true, message: "Error al eliminar la transacción" });
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

    if (!typedSession) {
        return null;
    }

    const isAdmin = typedSession.user.role === "ADMIN";

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
                                Gestión de Ingresos y Egresos
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
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Transacciones ({transactions.length})
                        </h2>
                        {isAdmin && (
                            <Button
                                onClick={() => setShowModal(true)}
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                + Nuevo
                            </Button>
                        )}
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Concepto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Monto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    {isAdmin && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={isAdmin ? 6 : 5}
                                            className="px-6 py-8 text-center text-gray-500"
                                        >
                                            No hay transacciones registradas
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.concepto}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${transaction.monto.toLocaleString("es-CO")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${transaction.tipo === "INGRESO"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {transaction.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(transaction.fecha)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.user.name}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                    <Button
                                                        onClick={() => handleDelete(transaction.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal para nueva transacción */}
            {showModal && (
                <TransactionModal
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchTransactions();
                    }}
                />
            )}

            {/* Diálogos de confirmación */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: "" })}
                title="Eliminar transacción"
                description="¿Estás seguro de eliminar esta transacción? Esta acción no se puede deshacer."
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
const TransactionModal = ({
    onClose,
    onSave,
}: {
    onClose: () => void;
    onSave: () => void;
}) => {
    const [formData, setFormData] = useState({
        concepto: "",
        monto: "",
        tipo: "INGRESO" as "INGRESO" | "EGRESO",
        fecha: new Date().toISOString().split("T")[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleMontoChange = (value: string) => {
        // Eliminar todo excepto números
        const numericValue = value.replace(/[^\d]/g, "");
        setFormData({ ...formData, monto: numericValue });
    };

    const formatMonto = (value: string) => {
        if (!value) return "";
        // Formatear con separadores de miles
        return parseInt(value).toLocaleString("es-CO");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSave();
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Error al crear la transacción");
            }
        } catch (error) {
            setError("Error al crear la transacción");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Nueva Transacción
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Concepto
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.concepto}
                            onChange={(e) =>
                                setFormData({ ...formData, concepto: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Descripción de la transacción"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-600 font-medium">
                                $
                            </span>
                            <input
                                type="text"
                                required
                                value={formatMonto(formData.monto)}
                                onChange={(e) => handleMontoChange(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tipo: e.target.value as "INGRESO" | "EGRESO",
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="INGRESO">Ingreso</option>
                            <option value="EGRESO">Egreso</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.fecha}
                            onChange={(e) =>
                                setFormData({ ...formData, fecha: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

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

export default TransactionsPage;
