import { DatabaseService } from '../services/DatabaseService';
import { BeneficioAnalyzer } from '../analyzers/BeneficioAnalyzer';
import { HistorialAnalyzer } from '../analyzers/HistorialAnalyzer';
import { EventoProcesado, ClienteBeneficio, HistorialCliente } from '../types';

export class DataProvider {
  private dbService: DatabaseService;
  private beneficioAnalyzer: BeneficioAnalyzer;
  private historialAnalyzer: HistorialAnalyzer;

  constructor() {
    this.dbService = new DatabaseService();
    this.beneficioAnalyzer = new BeneficioAnalyzer();
    this.historialAnalyzer = new HistorialAnalyzer();
  }

  public async obtenerTodosLosEventos(): Promise<EventoProcesado[]> {
    return await this.dbService.obtenerTodosLosEventos();
  }

  public async obtenerEventosUsuario(userId: string): Promise<EventoProcesado[]> {
    return await this.dbService.obtenerEventosUsuario(userId);
  }

  public async obtenerUsuarios() {
    return await this.dbService.obtenerUsuarios();
  }

  public async obtenerEstadisticas() {
    return await this.dbService.obtenerEstadisticas();
  }

  public async obtenerClientesBeneficio(): Promise<ClienteBeneficio[]> {
    const eventos = await this.obtenerTodosLosEventos();
    return this.beneficioAnalyzer.detectarClientesElegibles(eventos);
  }

  public async obtenerHistorialCliente(userId: string): Promise<HistorialCliente | null> {
    const eventos = await this.obtenerEventosUsuario(userId);
    return this.historialAnalyzer.analizarHistorialCliente(userId, eventos);
  }

  public async obtenerHistorialesClientes(userIds: string[]): Promise<HistorialCliente[]> {
    const historialesClientes: HistorialCliente[] = [];

    for (const userId of userIds) {
      const historial = await this.obtenerHistorialCliente(userId);
      if (historial) {
        historialesClientes.push(historial);
      }
    }

    return historialesClientes;
  }

  public async disconnect(): Promise<void> {
    await this.dbService.disconnect();
  }
}
