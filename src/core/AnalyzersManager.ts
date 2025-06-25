import { DataProvider } from './DataProvider';
import { ReportGenerator } from '../services/ReportGenerator';
import { BeneficioAnalyzer } from '../analyzers/BeneficioAnalyzer';
import { ReporteConfig, HistorialCliente, ClienteBeneficio } from '../types';

export class AnalyzersManager {
  private dataProvider: DataProvider;
  private reportGenerator: ReportGenerator;
  private beneficioAnalyzer: BeneficioAnalyzer;
  private config: ReporteConfig;

  constructor(config: ReporteConfig) {
    this.config = config;
    this.dataProvider = new DataProvider();
    this.reportGenerator = new ReportGenerator(this.config);
    this.beneficioAnalyzer = new BeneficioAnalyzer();
  }

  public async analizarBeneficios(): Promise<ClienteBeneficio[]> {
    console.log('🎯 Ejecutando análisis de beneficios...\n');

    try {
      const eventos = await this.dataProvider.obtenerTodosLosEventos();
      
      const clientesBeneficio = await this.beneficioAnalyzer.detectarClientesElegibles(eventos);
      
      const beneficiosCreados = await this.beneficioAnalyzer.obtenerBeneficios();
      
      this.reportGenerator.generarReporteBeneficios(clientesBeneficio, beneficiosCreados);
      
      return clientesBeneficio;

    } catch (error) {
      console.error('❌ Error en análisis de beneficios:', error);
      throw error;
    }
  }

  public async analizarHistoriales(): Promise<HistorialCliente[]> {
    console.log('📊 Ejecutando análisis de historiales...\n');

    try {
      const usuarios = await this.dataProvider.obtenerUsuarios();
      const usuariosMuestra = usuarios.slice(0, this.config.maxUsuariosMuestra);
      
      const userIds = usuariosMuestra.map(u => u.id);
      const historialesClientes = await this.dataProvider.obtenerHistorialesClientes(userIds);

      this.reportGenerator.generarReporteHistorial(historialesClientes);
      
      return historialesClientes;

    } catch (error) {
      console.error('❌ Error en análisis de historiales:', error);
      throw error;
    }
  }

  public async analizarHistorialClienteEspecifico(userId: string): Promise<HistorialCliente | null> {
    console.log(`🔍 Analizando historial del cliente: ${userId}...`);

    try {
      return await this.dataProvider.obtenerHistorialCliente(userId);
    } catch (error) {
      console.error(`❌ Error analizando cliente ${userId}:`, error);
      throw error;
    }
  }

  public async obtenerUsuariosDisponibles() {
    return await this.dataProvider.obtenerUsuarios();
  }

  public async disconnect(): Promise<void> {
    await this.dataProvider.disconnect();
    await this.beneficioAnalyzer.disconnect();
  }
}
