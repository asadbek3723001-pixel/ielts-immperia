import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const sessions = await prisma.testSession.findMany({
        include: { sections: true }
    });
    console.log(JSON.stringify(sessions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
