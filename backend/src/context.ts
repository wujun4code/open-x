import { PrismaClient } from '@prisma/client';
import { extractToken, verifyToken } from './utils/auth';

export interface Context {
    prisma: PrismaClient;
    userId?: string;
}

const prisma = new PrismaClient();

export async function createContext({ req }: any): Promise<Context> {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    let userId: string | undefined;

    if (token) {
        const payload = verifyToken(token);
        if (payload) {
            userId = payload.userId;
        }
    }

    return {
        prisma,
        userId,
    };
}

export { prisma };
