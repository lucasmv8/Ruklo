import { PrismaClient } from '../../generated/prisma';
import eventData from '../../data/events.json';

export async function seedUsers(prisma: PrismaClient) {
  try {
    const uniqueUsers = [...new Set(eventData.map(event => event.client_id))];
    
    console.log(`   📊 Creando ${uniqueUsers.length} usuarios...`);

    const usersData = uniqueUsers.map(userId => ({
      id: userId
    }));

    await prisma.user.createMany({
      data: usersData,
      skipDuplicates: true
    });

    console.log(`   ✅ ${uniqueUsers.length} usuarios creados exitosamente`);
  } catch (error) {
    console.error('   ❌ Error creando usuarios:', error);
    throw error;
  }
}
