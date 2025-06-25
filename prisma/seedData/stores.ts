import { PrismaClient } from '../../generated/prisma';
import eventData from '../../data/events.json';

export async function seedStores(prisma: PrismaClient) {
  try {
    const uniqueStores = [...new Set(eventData.map(event => event.store_id))];
    
    console.log(`   📊 Creando ${uniqueStores.length} stores...`);

    const storesData = uniqueStores.map(storeId => ({
      id: storeId
    }));

    await prisma.store.createMany({
      data: storesData,
      skipDuplicates: true
    });

    console.log(`   ✅ ${uniqueStores.length} stores creados exitosamente`);
  } catch (error) {
    console.error('   ❌ Error creando stores:', error);
    throw error;
  }
}
