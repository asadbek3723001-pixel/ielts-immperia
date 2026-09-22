import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { ENV } from '../config/env';

const profileSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
    phoneNumber: z.string().min(7).max(20).optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(100),
});

export async function handleUpdateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
        const parsed = profileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, message: 'Malumotlar formati noto\'g\'ri' });
            return;
        }

        const { fullName, username, phoneNumber } = parsed.data;
        const userId = req.user!.userId;

        // Check if username/phone taken by others
        if (username || phoneNumber) {
            const existing = await prisma.user.findFirst({
                where: {
                    OR: [
                        username ? { username } : {},
                        phoneNumber ? { phoneNumber } : {},
                    ].filter(o => Object.keys(o).length > 0),
                    NOT: { id: userId },
                },
            });

            if (existing) {
                if (username === existing.username) {
                    res.status(400).json({ success: false, message: 'Bu username band' });
                    return;
                }
                if (phoneNumber === existing.phoneNumber) {
                    res.status(400).json({ success: false, message: 'Bu telefon raqami band' });
                    return;
                }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { fullName, username, phoneNumber },
            select: { id: true, fullName: true, username: true, phoneNumber: true, role: true },
        });

        res.json({ success: true, data: updatedUser });
    } catch (err: unknown) {
        res.status(500).json({ success: false, message: 'Profilni yangilashda xatolik yuz berdi' });
    }
}

export async function handleChangePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
        const parsed = passwordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, message: 'Parol kamida 6ta belgidan iborat bo\'lishi kerak' });
            return;
        }

        const { currentPassword, newPassword } = parsed.data;
        const userId = req.user!.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
            return;
        }

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            res.status(400).json({ success: false, message: 'Eski parol noto\'g\'ri' });
            return;
        }

        const hashed = await bcrypt.hash(newPassword, ENV.BCRYPT_ROUNDS);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });

        res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
    } catch (err: unknown) {
        res.status(500).json({ success: false, message: 'Parolni o\'zgartirishda xatolik yuz berdi' });
    }
}
