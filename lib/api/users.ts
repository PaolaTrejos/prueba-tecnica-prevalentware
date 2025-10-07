import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/session";

const prisma = new PrismaClient();

export const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSessionFromRequest(req);

    if (!session) {
        return res.status(401).json({ error: "No autorizado" });
    }

    // Solo el rol ADMIN puede ver usuarios
    if (session.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No tienes permisos para ver usuarios" });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                image: true,
                createdAt: true,
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

export const updateUser = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSessionFromRequest(req);

    if (!session) {
        return res.status(401).json({ error: "No autorizado" });
    }

    // Solo el rol ADMIN puede actualizar usuarios
    if (session.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No tienes permisos para actualizar usuarios" });
    }

    const { id } = req.query;
    const { name, phone, role } = req.body;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
    }

    if (role && role !== "USER" && role !== "ADMIN") {
        return res.status(400).json({ error: "El rol debe ser USER o ADMIN" });
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(phone !== undefined && { phone: phone || null }),
                ...(role && { role: role as Role }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                image: true,
                createdAt: true,
            },
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: "Error al actualizar usuario" });
    }
};

export const deleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSessionFromRequest(req);

    if (!session) {
        return res.status(401).json({ error: "No autorizado" });
    }

    // Solo el rol ADMIN puede eliminar usuarios
    if (session.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No tienes permisos para eliminar usuarios" });
    }

    const { id } = req.query;

    if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
    }

    // No permite eliminar el propio usuario
    if (id === session.user.id) {
        return res.status(400).json({ error: "No puedes eliminar tu propio usuario" });
    }

    try {
        await prisma.user.delete({
            where: { id },
        });

        return res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        return res.status(500).json({ error: "Error al eliminar usuario" });
    }
};
