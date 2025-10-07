import type { NextApiRequest, NextApiResponse } from "next";
import { getUsers } from "@/lib/api/users";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de todos los usuarios (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos (requiere rol ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    switch (method) {
        case "GET":
            return getUsers(req, res);
        default:
            res.setHeader("Allow", ["GET"]);
            return res.status(405).json({ error: `Método ${method} no permitido` });
    }
};

export default handler;
