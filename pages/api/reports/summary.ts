import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/session";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Obtener resumen de transacciones y reportes financieros
 *     tags: [Reportes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Resumen financiero
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportSummary'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    const session = await getSessionFromRequest(req);
    if (!session) {
        return res.status(401).json({ error: "No autorizado" });
    }

    try {
        // Obtener todas las transacciones
        const transactions = await prisma.transaction.findMany({
            orderBy: {
                fecha: "asc",
            },
        });

        // Calcular totales
        const ingresos = transactions
            .filter((t) => t.tipo === "INGRESO")
            .reduce((sum, t) => sum + t.monto, 0);

        const egresos = transactions
            .filter((t) => t.tipo === "EGRESO")
            .reduce((sum, t) => sum + t.monto, 0);

        const saldo = ingresos - egresos;

        // Agrupar por mes para el gráfico
        const monthlyData = transactions.reduce((acc: any[], transaction) => {
            const date = new Date(transaction.fecha);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

            let monthEntry = acc.find((entry) => entry.month === monthKey);
            
            if (!monthEntry) {
                monthEntry = {
                    month: monthKey,
                    monthName,
                    ingresos: 0,
                    egresos: 0,
                };
                acc.push(monthEntry);
            }

            if (transaction.tipo === "INGRESO") {
                monthEntry.ingresos += transaction.monto;
            } else {
                monthEntry.egresos += transaction.monto;
            }

            return acc;
        }, []);

        // Ordenar por mes
        monthlyData.sort((a, b) => a.month.localeCompare(b.month));

        // Datos por tipo
        const typeData = [
            { name: "Ingresos", value: ingresos },
            { name: "Egresos", value: egresos },
        ];

        res.status(200).json({
            summary: {
                ingresos,
                egresos,
                saldo,
                totalTransacciones: transactions.length,
            },
            monthlyData,
            typeData,
            transactions,
        });
    } catch (error) {
        console.error("Error al obtener reporte:", error);
        res.status(500).json({ error: "Error al obtener reporte" });
    }
}
