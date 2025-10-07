import type { NextApiRequest, NextApiResponse } from "next";
import { updateUser, deleteUser } from "@/lib/api/users";

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar información de un usuario (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 pattern: '^[\d\s\-\+\(\)]{7,20}$'
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos (requiere rol ADMIN)
 * 
 *   delete:
 *     summary: Eliminar un usuario (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       400:
 *         description: No puedes eliminar tu propio usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos (requiere rol ADMIN)
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    switch (method) {
        case "PUT":
            return updateUser(req, res);
        case "DELETE":
            return deleteUser(req, res);
        default:
            res.setHeader("Allow", ["PUT", "DELETE"]);
            return res.status(405).json({ error: `Método ${method} no permitido` });
    }
};

export default handler;
