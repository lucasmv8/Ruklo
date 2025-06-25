import * as fs from 'fs';
import * as path from 'path';
import { ClienteBeneficio, HistorialCliente, ReporteConfig } from '../types';

export class ReportGenerator {
  private config: ReporteConfig;

  constructor(config: ReporteConfig) {
    this.config = config;
    this.crearDirectorioSalida();
  }

  private crearDirectorioSalida(): void {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  private generarEncabezado(titulo: string): string {
    const separador = '='.repeat(80);
    return `${separador}\n${titulo}\n${separador}\n\n`;
  }

  public generarReporteBeneficios(clientesBeneficio: ClienteBeneficio[], beneficiosCreados: any[]): string {
    const nombreArchivo = path.join(this.config.outputDir, 'reporte_clientes_beneficio.txt');
    
    let reporte = this.generarEncabezado('REPORTE 1: CLIENTES ELEGIBLES PARA BENEFICIO AUTOMÁTICO');
    
    reporte += `CRITERIO: Clientes que visitan ${this.config.visitasConsecutivasMinimas} veces seguidas una misma tienda sin haber recargado su tarjeta entre medio\n\n`;
    reporte += `TOTAL DE CLIENTES ELEGIBLES: ${clientesBeneficio.length}\n\n`;

    if (clientesBeneficio.length > 0) {
      reporte += 'DETALLE DE CLIENTES:\n';
      reporte += '-'.repeat(80) + '\n';
      
      clientesBeneficio.forEach((cliente, index) => {
        reporte += this.formatearDetalleCliente(cliente, index + 1);
      });
    } else {
      reporte += 'No se encontraron clientes que cumplan con el criterio.\n\n';
    }

    reporte += '\n' + '='.repeat(80) + '\n';
    reporte += 'BENEFICIOS ALMACENADOS EN BASE DE DATOS\n';
    reporte += '='.repeat(80) + '\n\n';
    reporte += `TOTAL DE BENEFICIOS CREADOS: ${beneficiosCreados.length}\n\n`;

    if (beneficiosCreados.length > 0) {
      reporte += 'DETALLE DE BENEFICIOS:\n';
      reporte += '-'.repeat(80) + '\n';
      
      beneficiosCreados.forEach((beneficio, index) => {
        reporte += this.formatearDetalleBeneficio(beneficio, index + 1);
      });
    } else {
      reporte += 'No hay beneficios almacenados en la base de datos.\n\n';
    }

    fs.writeFileSync(nombreArchivo, reporte);
    console.log(`✅ Reporte 1 guardado en: ${nombreArchivo}`);
    
    return nombreArchivo;
  }

  private formatearDetalleCliente(cliente: ClienteBeneficio, numero: number): string {
    let detalle = `${numero}. CLIENTE: ${cliente.userId}\n`;
    detalle += `   Tienda: ${cliente.storeId} (${cliente.storeName})\n`;
    detalle += `   Visitas consecutivas: ${cliente.visitasConsecutivas}\n`;
    detalle += `   Primera visita: ${cliente.primeraVisita.toLocaleString('es-ES')}\n`;
    detalle += `   Última visita: ${cliente.ultimaVisita.toLocaleString('es-ES')}\n`;
    detalle += `   Detalle de visitas:\n`;
    
    cliente.detalleVisitas.forEach((visita: any, i: number) => {
      detalle += `     ${i + 1}. ${visita.fecha.toLocaleString('es-ES')} - Tienda ${visita.tienda}\n`;
    });
    
    detalle += '\n';
    return detalle;
  }

  private formatearDetalleBeneficio(beneficio: any, numero: number): string {
    let detalle = `${numero}. BENEFICIO ID: ${beneficio.id}\n`;
    detalle += `   Usuario: ${beneficio.usuarioId}\n`;
    detalle += `   Tienda: ${beneficio.storeId}\n`;
    detalle += `   Visitas consecutivas: ${beneficio.visitasConsecutivas}\n`;
    detalle += `   Estado: ${beneficio.estado}\n`;
    detalle += `   Fecha creación: ${beneficio.fechaCreacion.toLocaleString('es-ES')}\n`;
    
    if (beneficio.fechaOtorgado) {
      detalle += `   Fecha otorgado: ${beneficio.fechaOtorgado.toLocaleString('es-ES')}\n`;
    }
    
    if (beneficio.eventos && beneficio.eventos.length > 0) {
      detalle += `   Eventos relacionados:\n`;
      beneficio.eventos.forEach((be: any, i: number) => {
        const evento = be.evento;
        detalle += `     ${be.orden}. ${evento.timestamp.toLocaleString('es-ES')} - ${evento.type} - Tienda: ${evento.storeId}\n`;
      });
    }
    
    detalle += '\n';
    return detalle;
  }

  public generarReporteHistorial(historialesClientes: HistorialCliente[]): string {
    const nombreArchivo = path.join(this.config.outputDir, 'reporte_historial_clientes.txt');
    
    let reporte = this.generarEncabezado('REPORTE 2: HISTORIAL DE TRANSACCIONES POR CLIENTE');
    
    reporte += 'CRITERIO: Historial agrupado por tipo (visit/recharge) con promedio de monto recargado por semana\n\n';

    historialesClientes.forEach(historial => {
      reporte += this.formatearHistorialCliente(historial);
    });

    fs.writeFileSync(nombreArchivo, reporte);
    console.log(`✅ Reporte 2 guardado en: ${nombreArchivo}`);
    
    return nombreArchivo;
  }

  private formatearHistorialCliente(historial: HistorialCliente): string {
    let detalle = `CLIENTE ID: ${historial.cliente.id}\n`;
    detalle += '-'.repeat(50) + '\n';
    detalle += `Total de eventos: ${historial.estadisticas.totalEventos}\n`;
    detalle += `Total de visitas: ${historial.estadisticas.totalVisitas}\n`;
    detalle += `Total de recargas: ${historial.estadisticas.totalRecargas}\n`;
    detalle += `Monto total recargado: $${historial.estadisticas.montoTotalRecargado.toFixed(2)}\n`;
    detalle += `Promedio semanal de recargas: $${historial.estadisticas.promedioSemanalRecargas.toFixed(2)}\n\n`;
    
    detalle += 'DETALLE POR SEMANAS:\n';
    
    historial.semanas.forEach((semana: any, index: number) => {
      detalle += `  Semana ${index + 1} (${semana.semana}):\n`;
      detalle += `    Visitas: ${semana.totalVisitas}\n`;
      detalle += `    Recargas: ${semana.recargas.length}\n`;
      detalle += `    Monto total: $${semana.totalRecargas.toFixed(2)}\n\n`;
    });
    
    detalle += '\n';
    return detalle;
  }

  public generarReporteResumen(estadisticas: any): string {
    const nombreArchivo = path.join(this.config.outputDir, 'reporte_resumen.txt');
    
    let reporte = this.generarEncabezado('REPORTE RESUMEN: ESTADÍSTICAS GENERALES');
    
    reporte += `Total de usuarios: ${estadisticas.totalUsuarios}\n`;
    reporte += `Total de tiendas: ${estadisticas.totalStores}\n`;
    reporte += `Total de eventos: ${estadisticas.totalEventos}\n`;
    reporte += `Total de visitas: ${estadisticas.totalVisitas}\n`;
    reporte += `Total de recargas: ${estadisticas.totalRecargas}\n\n`;
    
    fs.writeFileSync(nombreArchivo, reporte);
    console.log(`✅ Reporte resumen guardado en: ${nombreArchivo}`);
    
    return nombreArchivo;
  }

  public imprimirResumenFinal(): void {
    console.log(`\n📁 Todos los reportes se guardaron en: ${this.config.outputDir}`);
    console.log('\n📋 Archivos generados:');
    console.log('   1. reporte_clientes_beneficio.txt - Respuesta a Pregunta 1');
    console.log('   2. reporte_historial_clientes.txt - Respuesta a Pregunta 2');
    console.log('   3. reporte_resumen.txt - Estadísticas generales');
  }
}
