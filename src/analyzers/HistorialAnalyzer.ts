import { HistorialCliente, SemanaData, EventoProcesado } from '../types';

export class HistorialAnalyzer {

  private obtenerLunesDeLaSemana(fecha: Date): string {
    const primerDiaSemana = new Date(fecha);
    primerDiaSemana.setDate(fecha.getDate() - fecha.getDay() + 1);
    return primerDiaSemana.toISOString().split('T')[0];
  }

  private agruparEventosPorSemana(eventos: EventoProcesado[]): { [key: string]: any } {
    const semanas: { [key: string]: any } = {};
    
    eventos.forEach(evento => {
      const claveSemana = this.obtenerLunesDeLaSemana(new Date(evento.timestamp));

      if (!semanas[claveSemana]) {
        semanas[claveSemana] = {
          semana: claveSemana,
          visitas: [],
          recargas: [],
          totalRecargas: 0
        };
      }

      if (evento.type === 'visit') {
        semanas[claveSemana].visitas.push(evento);
      } else if (evento.type === 'recharge') {
        semanas[claveSemana].recargas.push(evento);
        semanas[claveSemana].totalRecargas += evento.amount || 0;
      }
    });

    return semanas;
  }

  private procesarSemanasArray(semanas: { [key: string]: any }): SemanaData[] {
    return Object.values(semanas).map((semana: any) => ({
      ...semana,
      totalVisitas: semana.visitas.length,
      promedioSemanal: semana.totalRecargas
    })).sort((a, b) => new Date(a.semana).getTime() - new Date(b.semana).getTime());
  }

  private calcularEstadisticas(eventos: EventoProcesado[], semanasArray: SemanaData[]) {
    const totalSemanas = semanasArray.length;
    const sumaTotal = semanasArray.reduce((sum, semana) => sum + semana.totalRecargas, 0);
    const promedioGeneral = totalSemanas > 0 ? sumaTotal / totalSemanas : 0;

    return {
      totalEventos: eventos.length,
      totalVisitas: eventos.filter(e => e.type === 'visit').length,
      totalRecargas: eventos.filter(e => e.type === 'recharge').length,
      montoTotalRecargado: eventos
        .filter(e => e.type === 'recharge')
        .reduce((sum, e) => sum + (e.amount || 0), 0),
      promedioSemanalRecargas: promedioGeneral
    };
  }

  public analizarHistorialCliente(userId: string, eventos: EventoProcesado[]): HistorialCliente | null {
    console.log(`🔍 Analizando historial del cliente: ${userId}...`);

    if (eventos.length === 0) {
      console.log(`❌ No se encontraron eventos para el cliente: ${userId}`);
      return null;
    }

    const semanas = this.agruparEventosPorSemana(eventos);
    
    const semanasArray = this.procesarSemanasArray(semanas);
    
    const estadisticas = this.calcularEstadisticas(eventos, semanasArray);

    const cliente = eventos[0].usuario;

    const historial: HistorialCliente = {
      cliente: {
        id: cliente.id
      },
      estadisticas,
      semanas: semanasArray
    };

    console.log(`✅ Historial procesado para: ${cliente.id}`);
    return historial;
  }
}
