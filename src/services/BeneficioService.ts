import { PrismaClient } from '../../generated/prisma';
import { EventoProcesado } from '../types';

export class BeneficioService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async crearBeneficio(
    usuarioId: string,
    storeId: string,
    eventosConsecutivos: EventoProcesado[]
  ): Promise<any> {
    try {
      const beneficioExistente = await this.prisma.beneficio.findFirst({
        where: {
          usuarioId,
          storeId,
          estado: 'PENDIENTE'
        }
      });

      if (beneficioExistente) {
        console.log(`⚠️  Ya existe un beneficio pendiente para ${usuarioId} en ${storeId}`);
        return beneficioExistente;
      }

      const beneficio = await this.prisma.beneficio.create({
        data: {
          usuarioId,
          storeId,
          visitasConsecutivas: eventosConsecutivos.length,
          estado: 'PENDIENTE'
        }
      });

      await Promise.all(
        eventosConsecutivos.map((evento, index) =>
          this.prisma.beneficioEvento.create({
            data: {
              beneficioId: beneficio.id,
              eventoId: evento.id,
              orden: index + 1
            }
          })
        )
      );

      console.log(`✅ Beneficio creado para ${usuarioId} en ${storeId} con ${eventosConsecutivos.length} visitas`);
      return beneficio;

    } catch (error) {
      console.error('❌ Error creando beneficio:', error);
      throw error;
    }
  }

  async obtenerBeneficios(): Promise<any[]> {
    try {
      return await this.prisma.beneficio.findMany({
        include: {
          usuario: true,
          store: true,
          eventos: {
            include: {
              evento: true
            },
            orderBy: { orden: 'asc' }
          }
        },
        orderBy: { fechaCreacion: 'desc' }
      });

    } catch (error) {
      console.error('❌ Error obteniendo beneficios:', error);
      throw error;
    }
  }

 async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
