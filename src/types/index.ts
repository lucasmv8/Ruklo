export interface ClienteBeneficio {
  userId: string;
  storeId: string;
  storeName: string;
  visitasConsecutivas: number;
  primeraVisita: Date;
  ultimaVisita: Date;
  detalleVisitas: Array<{
    fecha: Date;
    tienda: string;
  }>;
}

export interface HistorialCliente {
  cliente: {
    id: string;
  };
  estadisticas: {
    totalEventos: number;
    totalVisitas: number;
    totalRecargas: number;
    montoTotalRecargado: number;
    promedioSemanalRecargas: number;
  };
  semanas: Array<SemanaData>;
}

export interface SemanaData {
  semana: string;
  visitas: any[];
  recargas: any[];
  totalRecargas: number;
  totalVisitas: number;
  promedioSemanal: number;
}

export interface EventoProcesado {
  id: number;
  type: 'visit' | 'recharge';
  timestamp: Date;
  amount: number | null;
  usuarioId: string;
  storeId: string;
  usuario: { id: string };
  store: { id: string };
}

export interface ReporteConfig {
  outputDir: string;
  maxUsuariosMuestra: number;
  visitasConsecutivasMinimas: number;
}

export interface BeneficioCreado {
  id: number;
  usuarioId: string;
  storeId: string;
  visitasConsecutivas: number;
  fechaCreacion: Date;
  fechaOtorgado: Date | null;
  estado: EstadoBeneficio;
  eventos: Array<{
    eventoId: number;
    orden: number;
    timestamp: Date;
  }>;
}

export interface BeneficioDetallado {
  beneficio: BeneficioCreado;
  usuario: { id: string };
  store: { id: string };
  eventosDetalle: Array<{
    id: number;
    timestamp: Date;
    orden: number;
  }>;
}

export enum EstadoBeneficio {
  PENDIENTE = 'PENDIENTE',
  OTORGADO = 'OTORGADO',
  USADO = 'USADO',
  EXPIRADO = 'EXPIRADO'
}

export interface ResultadoAnalisisBeneficios {
  beneficiosCreados: BeneficioCreado[];
  beneficiosExistentes: BeneficioCreado[];
  totalBeneficios: number;
  clientesElegibles: ClienteBeneficio[];
}
