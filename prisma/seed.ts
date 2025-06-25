import { PrismaClient } from '../generated/prisma';
import { seedUsers } from './seedData/users';
import { seedStores } from './seedData/stores';
import { seedEvents } from './seedData/events';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Iniciando proceso de seeding...\n');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.event.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Datos existentes eliminados\n');

    // Ejecutar seeds en orden
    console.log('👥 Seeding usuarios...');
    await seedUsers(prisma);
    
    console.log('🏪 Seeding stores...');
    await seedStores(prisma);
    
    console.log('🎯 Seeding eventos...');
    await seedEvents(prisma);

    // Mostrar estadísticas finales
    console.log('\n📊 Estadísticas finales:');
    const [totalUsers, totalStores, totalEvents, totalVisits, totalRecharges] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.event.count(),
      prisma.event.count({ where: { type: 'visit' } }),
      prisma.event.count({ where: { type: 'recharge' } })
    ]);

    console.log(`   👥 Usuarios: ${totalUsers}`);
    console.log(`   🏪 Stores: ${totalStores}`);
    console.log(`   🎯 Eventos totales: ${totalEvents}`);
    console.log(`   👁️  Visitas: ${totalVisits}`);
    console.log(`   💰 Recargas: ${totalRecharges}`);

    console.log('\n🎉 ¡Seeding completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('💥 Error fatal:', e);
    process.exit(1);
  });
