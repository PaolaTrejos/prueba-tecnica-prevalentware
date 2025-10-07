import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/session";

const prisma = new PrismaClient();

type TransactionType = "INGRESO" | "EGRESO";

export const createTransaction = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSessionFromRequest(req); if (!session) {
        return res.status(401).json({ error: "No autorizado" });
    }

    // Solo el rol ADMIN puede crear transacciones
    if (session.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No tienes permisos para crear transacciones" });
    }

    const { concepto, monto, tipo, fecha } = req.body;

    if (!concepto || !monto || !tipo) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    if (tipo !== "INGRESO" && tipo !== "EGRESO") {
        return res.status(400).json({ error: "El tipo debe ser INGRESO o EGRESO" });
    }

    try {
        const fechaLocal = fecha ? new Date(fecha + 'T00:00:00') : new Date();
        
        const transaction = await prisma.transaction.create({
            data: {
                concepto,
                monto: parseFloat(monto),
                tipo: tipo as TransactionType,
                fecha: fechaLocal,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return res.status(201).json(transaction);
    } catch (error) {
        return res.status(500).json({ error: "Error al crear la transacción" });
    }
};

export const getTransactions = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSessionFromRequest(req); if (!session) {
        return res.status(401).json({ error: "No autorizado" });
    }

    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                fecha: "desc",
            },
        });

        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ error: "Error al obtener las transacciones" });
    }
};

export const updateTransaction = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSessionFromRequest(req); if (!session) {
        return res.status(401).json({ error: "No autorizado" });
    }

    if (session.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No tienes permisos para actualizar transacciones" });
    }

    const { id } = req.query;
    const { concepto, monto, tipo, fecha } = req.body;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                ...(concepto && { concepto }),
                ...(monto && { monto: parseFloat(monto) }),
                ...(tipo && { tipo: tipo as TransactionType }),
                ...(fecha && { fecha: new Date(fecha + 'T00:00:00') }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return res.status(200).json(transaction);
    } catch (error) {
        return res.status(500).json({ error: "Error al actualizar la transacción" });
    }
};

export const deleteTransaction = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSessionFromRequest(req); if (!session) {
        return res.status(401).json({ error: "No autorizado" });
    }

    if (session.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No tienes permisos para eliminar transacciones" });
    }

    const { id } = req.query;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        await prisma.transaction.delete({
            where: { id },
        });

        return res.status(200).json({ message: "Transacción eliminada exitosamente" });
    } catch (error) {
        return res.status(500).json({ error: "Error al eliminar la transacción" });
    }
};
