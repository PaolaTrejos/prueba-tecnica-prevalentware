import type { NextApiRequest, NextApiResponse } from "next";
import { updateTransaction, deleteTransaction } from "@/lib/api/transactions";

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Actualizar una transacción por ID
 *     tags: [Transacciones]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *       403:
 *         description: Sin permisos para editar esta transacción
 *       404:
 *         description: Transacción no encontrada
 * 
 *   delete:
 *     summary: Eliminar una transacción por ID
 *     tags: [Transacciones]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 *     responses:
 *       200:
 *         description: Transacción eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos para eliminar esta transacción
 *       404:
 *         description: Transacción no encontrada
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    switch (method) {
        case "PUT":
            return updateTransaction(req, res);
        case "DELETE":
            return deleteTransaction(req, res);
        default:
            res.setHeader("Allow", ["PUT", "DELETE"]);
            return res.status(405).json({ error: `Método ${method} no permitido` });
    }
};

export default handler;
