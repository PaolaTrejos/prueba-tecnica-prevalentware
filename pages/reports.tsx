import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "@/lib/auth/client";
import type { ExtendedSession } from "@/types/session";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface ReportSummary {
    ingresos: number;
    egresos: number;
    saldo: number;
    totalTransacciones: number;
}

interface MonthlyData {
    month: string;
    monthName: string;
    ingresos: number;
    egresos: number;
}

interface TypeData {
    name: string;
    value: number;
    [key: string]: string | number; // Permite que Recharts acceda a propiedades dinámicas
}

interface Transaction {
    id: string;
    concepto: string;
    monto: number;
    tipo: "INGRESO" | "EGRESO";
    fecha: string;
    userId: string;
}

interface ReportData {
    summary: ReportSummary;
    monthlyData: MonthlyData[];
    typeData: TypeData[];
    transactions: Transaction[];
}

const COLORS = {
    ingresos: "#10b981", // green
    egresos: "#ef4444", // red
};

export default function Reports() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const typedSession = session as ExtendedSession | null;

    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (typedSession) {
            fetchReport();
        }
    }, [typedSession]);

    const fetchReport = async () => {
        try {
            const response = await fetch("/api/reports/summary");
            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            }
        } catch (error) {
            console.error("Error al cargar reporte:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!reportData) return;

        // Usar punto y coma como delimitador (estándar para Excel en español)
        const delimiter = ";";
        const headers = ["Fecha", "Concepto", "Tipo", "Monto"];
        const rows = reportData.transactions.map((t) => {
            const fecha = new Date(t.fecha);
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            const fechaFormateada = `${year}-${month}-${day}`;

            // Escapar comillas dobles en el concepto y envolverlo en comillas
            const conceptoEscapado = t.concepto.replace(/"/g, '""');

            return [
                fechaFormateada,
                `"${conceptoEscapado}"`, // Entre comillas por si tiene caracteres especiales
                t.tipo,
                t.monto.toString(),
            ];
        });

        // Construir el contenido CSV con punto y coma
        const csvContent = [
            headers.join(delimiter),
            ...rows.map((row) => row.join(delimiter)),
        ].join("\r\n"); // Usar \r\n para compatibilidad con Excel

        // Agregar BOM UTF-8 para que Excel reconozca correctamente los caracteres especiales
        const BOM = "\uFEFF";
        const csvWithBOM = BOM + csvContent;

        // Crear blob y descargar
        const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte-transacciones-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatMoney = (amount: number) => {
        return `$${amount.toLocaleString("es-CO")}`;
    };

    if (isPending || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
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
                            <Button
                                onClick={() => router.push("/dashboard")}
                                variant="ghost"
                                size="sm"
                            >
                                ← Volver
                            </Button>
                            <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={downloadCSV}
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={!reportData || reportData.transactions.length === 0}
                            >
                                📥 Descargar CSV
                            </Button>
                            <span className="text-sm text-gray-600">{typedSession.user.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {reportData && (
                    <div className="space-y-6">
                        {/* Resumen de Saldos */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-sm font-medium text-gray-600">
                                    Total Ingresos
                                </div>
                                <div className="mt-2 text-3xl font-bold text-green-600">
                                    {formatMoney(reportData.summary.ingresos)}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-sm font-medium text-gray-600">
                                    Total Egresos
                                </div>
                                <div className="mt-2 text-3xl font-bold text-red-600">
                                    {formatMoney(reportData.summary.egresos)}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-sm font-medium text-gray-600">
                                    Saldo Actual
                                </div>
                                <div
                                    className={`mt-2 text-3xl font-bold ${
                                        reportData.summary.saldo >= 0
                                            ? "text-blue-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {formatMoney(reportData.summary.saldo)}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-sm font-medium text-gray-600">
                                    Total Transacciones
                                </div>
                                <div className="mt-2 text-3xl font-bold text-gray-900">
                                    {reportData.summary.totalTransacciones}
                                </div>
                            </div>
                        </div>

                        {/* Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gráfico de barras por mes */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Ingresos vs Egresos por Mes
                                </h2>
                                {reportData.monthlyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={reportData.monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="monthName"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => formatMoney(value)}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="ingresos"
                                                fill={COLORS.ingresos}
                                                name="Ingresos"
                                            />
                                            <Bar
                                                dataKey="egresos"
                                                fill={COLORS.egresos}
                                                name="Egresos"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        No hay datos para mostrar
                                    </div>
                                )}
                            </div>

                            {/* Gráfico de pastel */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Distribución de Transacciones
                                </h2>
                                {reportData.typeData.some((d) => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.typeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry: any) =>
                                                    `${entry.name}: ${formatMoney(entry.value)}`
                                                }
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {reportData.typeData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            entry.name === "Ingresos"
                                                                ? COLORS.ingresos
                                                                : COLORS.egresos
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => formatMoney(value)}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        No hay datos para mostrar
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabla de transacciones recientes */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Últimas Transacciones
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fecha
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Concepto
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Monto
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.transactions
                                            .slice()
                                            .reverse()
                                            .slice(0, 10)
                                            .map((transaction) => {
                                                const fecha = new Date(transaction.fecha);
                                                const year = fecha.getFullYear();
                                                const month = String(fecha.getMonth() + 1).padStart(2, '0');
                                                const day = String(fecha.getDate()).padStart(2, '0');
                                                const fechaFormateada = `${day}/${month}/${year}`;

                                                return (
                                                    <tr key={transaction.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {fechaFormateada}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {transaction.concepto}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    transaction.tipo === "INGRESO"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-red-100 text-red-800"
                                                                }`}
                                                            >
                                                                {transaction.tipo}
                                                            </span>
                                                        </td>
                                                        <td
                                                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                                transaction.tipo === "INGRESO"
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {transaction.tipo === "INGRESO" ? "+" : "-"}
                                                            {formatMoney(transaction.monto)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                                {reportData.transactions.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay transacciones registradas
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
