const fs = require('fs');
const path = require('path');

// Leer el archivo JSON
const jsonPath = path.join(__dirname, '../data/events.json');
const eventsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Generar el contenido TypeScript
const tsContent = `// Datos de eventos importados desde JSON
export const eventData = ${JSON.stringify(eventsData, null, 2)};

import { PrismaClient } from '@prisma/client';

export async function seedEvents(prisma: PrismaClient) {
  try {
    console.log(\`   📊 Creando \${eventData.length} eventos...\`);

    // Procesar eventos en lotes de 1000
    const batchSize = 1000;
    let createdEvents = 0;

    for (let i = 0; i < eventData.length; i += batchSize) {
      const batch = eventData.slice(i, i + batchSize);
      
      const eventsToCreate = batch.map(event => ({
        type: event.type as 'visit' | 'recharge',
        timestamp: new Date(event.timestamp),
        amount: event.amount || null,
        usuarioId: event.client_id,
        storeId: event.store_id
      }));

      await prisma.event.createMany({
        data: eventsToCreate
      });

      createdEvents += batch.length;
      console.log(\`   📈 \${createdEvents}/\${eventData.length} eventos creados...\`);
    }

    console.log(\`   ✅ \${createdEvents} eventos creados exitosamente\`);
  } catch (error) {
    console.error('   ❌ Error creando eventos:', error);
    throw error;
  }
}`;

// Escribir el archivo TypeScript
const outputPath = path.join(__dirname, '../prisma/seedData/events.ts');
fs.writeFileSync(outputPath, tsContent);

console.log('✅ Archivo events.ts generado exitosamente');
console.log(`📊 ${eventsData.length} eventos procesados`);
