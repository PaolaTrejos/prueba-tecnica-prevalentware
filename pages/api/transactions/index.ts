import type { NextApiRequest, NextApiResponse } from "next";
import {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
} from "@/lib/api/transactions";

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Obtener todas las transacciones del usuario autenticado
 *     tags: [Transacciones]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   post:
 *     summary: Crear una nueva transacción
 *     tags: [Transacciones]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - amount
 *               - type
 *               - date
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *               type:
 *                 type: string
 *                 enum: [INGRESO, EGRESO]
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 * 
 *   put:
 *     summary: Actualizar una transacción existente
 *     tags: [Transacciones]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [INGRESO, EGRESO]
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Transacción actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Transacción no encontrada
 * 
 *   delete:
 *     summary: Eliminar una transacción
 *     tags: [Transacciones]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transacción eliminada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Transacción no encontrada
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    switch (method) {
        case "GET":
            return getTransactions(req, res);
        case "POST":
            return createTransaction(req, res);
        case "PUT":
            return updateTransaction(req, res);
        case "DELETE":
            return deleteTransaction(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            return res.status(405).json({ error: `Método ${method} no permitido` });
    }
};

export default handler;
