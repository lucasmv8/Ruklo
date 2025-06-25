import { PrismaClient } from '../../generated/prisma';
import { EventoProcesado } from '../types';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async obtenerTodosLosEventos(): Promise<EventoProcesado[]> {
    return await this.prisma.event.findMany({
      include: {
        usuario: true,
        store: true
      },
      orderBy: [
        { usuarioId: 'asc' },
        { timestamp: 'asc' }
      ]
    });
  }

  async obtenerEventosUsuario(userId: string): Promise<EventoProcesado[]> {
    return await this.prisma.event.findMany({
      where: { usuarioId: userId },
      include: {
        usuario: true,
        store: true
      },
      orderBy: { timestamp: 'asc' }
    });
  }

  async obtenerUsuarios() {
    return await this.prisma.user.findMany({
      select: {
        id: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async obtenerEstadisticas() {
    const [totalEventos, totalUsuarios, totalStores, totalVisitas, totalRecargas] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.event.count({ where: { type: 'visit' } }),
      this.prisma.event.count({ where: { type: 'recharge' } })
    ]);

    return {
      totalEventos,
      totalUsuarios,
      totalStores,
      totalVisitas,
      totalRecargas
    };
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
