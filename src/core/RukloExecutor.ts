import * as path from 'path';
import { DataProvider } from './DataProvider';
import { AnalyzersManager } from './AnalyzersManager';
import { ReportGenerator } from '../services/ReportGenerator';
import { ReporteConfig } from '../types';

export class RukloExecutor {
  private dataProvider: DataProvider;
  private analyzersManager: AnalyzersManager;
  private reportGenerator: ReportGenerator;
  private config: ReporteConfig;

  constructor(config?: Partial<ReporteConfig>) {
    this.config = {
      outputDir: path.join(__dirname, '../../../output'),
      maxUsuariosMuestra: 10,
      visitasConsecutivasMinimas: 5,
      ...config
    };

    this.dataProvider = new DataProvider();
    this.analyzersManager = new AnalyzersManager(this.config);
    this.reportGenerator = new ReportGenerator(this.config);
  }

  public async ejecutarAnalisisCompleto(): Promise<void> {
    console.log('📋 Generando reporte completo...\n');

    try {
      const estadisticas = await this.dataProvider.obtenerEstadisticas();
      
      this.reportGenerator.generarReporteResumen(estadisticas);

      await this.analyzersManager.analizarBeneficios();

      await this.analyzersManager.analizarHistoriales();

      this.reportGenerator.imprimirResumenFinal();

    } catch (error) {
      console.error('❌ Error durante el análisis completo:', error);
      throw error;
    }
  }

  public async ejecutarAnalisisBeneficios(): Promise<void> {
    try {
      await this.analyzersManager.analizarBeneficios();
    } catch (error) {
      console.error('❌ Error durante análisis de beneficios:', error);
      throw error;
    }
  }

  public async ejecutarAnalisisHistoriales(): Promise<void> {
    try {
      await this.analyzersManager.analizarHistoriales();
    } catch (error) {
      console.error('❌ Error durante análisis de historiales:', error);
      throw error;
    }
  }

  public async ejecutarAnalisisInteractivo(userId: string): Promise<void> {
    try {
      const historial = await this.analyzersManager.analizarHistorialClienteEspecifico(userId);
      
      if (historial) {
        this.mostrarHistorialDetallado(historial);
      } else {
        console.log(`❌ No se encontró historial para el cliente: ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error durante análisis interactivo:', error);
      throw error;
    }
  }

  public async obtenerUsuariosDisponibles() {
    return await this.analyzersManager.obtenerUsuariosDisponibles();
  }

  private mostrarHistorialDetallado(historial: any): void {
    console.log('\n' + '='.repeat(80));
    console.log(`📊 HISTORIAL DETALLADO DEL CLIENTE: ${historial.cliente.id}`);
    console.log('='.repeat(80));
    
    console.log(`\n📈 RESUMEN GENERAL:`);
    console.log(`   Total de eventos: ${historial.estadisticas.totalEventos}`);
    console.log(`   Total de visitas: ${historial.estadisticas.totalVisitas}`);
    console.log(`   Total de recargas: ${historial.estadisticas.totalRecargas}`);
    console.log(`   Monto total recargado: $${historial.estadisticas.montoTotalRecargado.toFixed(2)}`);
    console.log(`   Promedio semanal de recargas: $${historial.estadisticas.promedioSemanalRecargas.toFixed(2)}`);

    console.log(`\n📅 DETALLE POR SEMANAS (incluyendo semanas sin recargas):`);
    console.log('-'.repeat(80));

    historial.semanas.forEach((semana: any, index: number) => {
      console.log(`\n📆 SEMANA ${index + 1}: ${semana.semana}`);
      console.log('   ' + '-'.repeat(50));
      
      if (semana.visitas && semana.visitas.length > 0) {
        console.log(`   👁️  VISITAS (${semana.visitas.length}):`);
        semana.visitas.forEach((visita: any, i: number) => {
          const fecha = new Date(visita.timestamp).toLocaleString('es-ES', {
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          console.log(`      ${i + 1}. ${fecha} - Tienda: ${visita.storeId}`);
        });
      } else {
        console.log(`   👁️  VISITAS: No hubo visitas esta semana`);
      }

      if (semana.recargas && semana.recargas.length > 0) {
        console.log(`   💰 RECARGAS (${semana.recargas.length}):`);
        semana.recargas.forEach((recarga: any, i: number) => {
          const fecha = new Date(recarga.timestamp).toLocaleString('es-ES', {
            weekday: 'short',
            month: 'short',
            day: 'numeric', 
            hour: '2-digit',
            minute: '2-digit'
          });
          console.log(`      ${i + 1}. ${fecha} - $${recarga.amount.toFixed(2)} - Tienda: ${recarga.storeId}`);
        });
        console.log(`   💵 TOTAL SEMANA: $${semana.totalRecargas.toFixed(2)}`);
      } else {
        console.log(`   💰 RECARGAS: No hubo recargas esta semana`);
        console.log(`   💵 TOTAL SEMANA: $0.00`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Análisis completado');
  }

  public async disconnect(): Promise<void> {
    await this.dataProvider.disconnect();
    await this.analyzersManager.disconnect();
  }
}
