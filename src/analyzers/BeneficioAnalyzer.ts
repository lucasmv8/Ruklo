import { ClienteBeneficio, EventoProcesado } from '../types';
import { BeneficioService } from '../services/BeneficioService';

export class BeneficioAnalyzer {
  private readonly VISITAS_MINIMAS = 5;
  private beneficioService: BeneficioService;

  constructor() {
    this.beneficioService = new BeneficioService();
  }

  private agruparEventosPorUsuario(eventos: EventoProcesado[]): { [key: string]: EventoProcesado[] } {
    const eventosPorUsuario: { [key: string]: EventoProcesado[] } = {};
    
    eventos.forEach(evento => {
      if (!eventosPorUsuario[evento.usuarioId]) {
        eventosPorUsuario[evento.usuarioId] = [];
      }
      eventosPorUsuario[evento.usuarioId].push(evento);
    });

    return eventosPorUsuario;
  }

  private async analizarVisitasConsecutivas(eventos: EventoProcesado[]): Promise<ClienteBeneficio[]> {
    const clientesElegibles: ClienteBeneficio[] = [];
    let visitasConsecutivas = 0;
    let ultimaStore: string | null = null;
    let visitasActuales: EventoProcesado[] = [];

    const userId = eventos[0]?.usuarioId;
    if (!userId) return [];

    for (const evento of eventos) {
      if (evento.type === 'visit') {
        // Si es la misma tienda que la visita anterior (o es la primera visita consecutiva)
        if (ultimaStore === null || ultimaStore === evento.storeId) {
          if (visitasConsecutivas === 0) {
            visitasActuales = []; // Reiniciar el array de visitas
          }
          visitasConsecutivas++;
          ultimaStore = evento.storeId;
          visitasActuales.push(evento);
        } else {
          // Cambió de tienda, reiniciar contador
          visitasConsecutivas = 1;
          ultimaStore = evento.storeId;
          visitasActuales = [evento];
        }
      } else if (evento.type === 'recharge') {
        // Si hay una recarga, reiniciar el contador
        visitasConsecutivas = 0;
        ultimaStore = null;
        visitasActuales = [];
      }

      // Si llegó a las visitas mínimas consecutivas sin recargas
      if (visitasConsecutivas >= this.VISITAS_MINIMAS) {
        const tienda = visitasActuales[0].store;
        
        // Verificar si ya agregamos este cliente para esta combinación
        const yaAgregado = clientesElegibles.some(c => 
          c.userId === userId && 
          c.storeId === ultimaStore &&
          Math.abs(new Date(c.ultimaVisita).getTime() - new Date(evento.timestamp).getTime()) < 86400000
        );

        if (!yaAgregado) {
          // CREAR BENEFICIO EN LA BASE DE DATOS
          try {
            await this.beneficioService.crearBeneficio(
              userId,
              ultimaStore!,
              visitasActuales.slice(0, this.VISITAS_MINIMAS) // Solo las primeras 5 visitas
            );
          } catch (error) {
            console.error(`❌ Error creando beneficio para ${userId}:`, error);
          }

          const clienteBeneficio: ClienteBeneficio = {
            userId: userId,
            storeId: ultimaStore!,
            storeName: tienda.id,
            visitasConsecutivas: visitasConsecutivas,
            primeraVisita: visitasActuales[0].timestamp,
            ultimaVisita: evento.timestamp,
            detalleVisitas: visitasActuales.map(v => ({
              fecha: v.timestamp,
              tienda: v.store.id
            }))
          };

          clientesElegibles.push(clienteBeneficio);
        }
      }
    }

    return clientesElegibles;
  }

  public async detectarClientesElegibles(eventos: EventoProcesado[]): Promise<ClienteBeneficio[]> {
    console.log('🔍 Analizando clientes elegibles para beneficio automático...\n');
    console.log(`📊 Total de eventos procesados: ${eventos.length}`);

    const eventosPorUsuario = this.agruparEventosPorUsuario(eventos);
    console.log(`👥 Total de usuarios únicos: ${Object.keys(eventosPorUsuario).length}`);

    const todosLosClientesElegibles: ClienteBeneficio[] = [];

    for (const userEventos of Object.values(eventosPorUsuario)) {
      const clientesElegibles = await this.analizarVisitasConsecutivas(userEventos);
      todosLosClientesElegibles.push(...clientesElegibles);
    }

    console.log(`✅ Clientes elegibles encontrados: ${todosLosClientesElegibles.length}\n`);
    return todosLosClientesElegibles;
  }

  public async obtenerBeneficios(): Promise<any[]> {
    return await this.beneficioService.obtenerBeneficios();
  }

  public async disconnect(): Promise<void> {
    await this.beneficioService.disconnect();
  }
}
