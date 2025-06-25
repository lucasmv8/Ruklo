interface ClienteBeneficio {
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
interface HistorialCliente {
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
    semanas: Array<{
        semana: string;
        visitas: any[];
        recargas: any[];
        totalRecargas: number;
        totalVisitas: number;
        promedioSemanal: number;
    }>;
}
export declare class DataAnalyzer {
    private prisma;
    private outputDir;
    constructor();
    /**
     * PREGUNTA 1: Detecta clientes que visitan 5 veces seguidas una misma tienda sin haber recargado su tarjeta entre medio
     */
    detectarClientesBeneficio(): Promise<ClienteBeneficio[]>;
    /**
     * PREGUNTA 2: Historial de transacciones por cliente agrupado por tipo con promedio semanal
     */
    obtenerHistorialCliente(userId: string): Promise<HistorialCliente | null>;
    /**
     * Obtener todos los usuarios disponibles
     */
    obtenerUsuarios(): Promise<{
        id: string;
    }[]>;
    /**
     * Generar reporte completo en archivos de texto
     */
    generarReporteCompleto(): Promise<void>;
    disconnect(): Promise<void>;
}
export {};
//# sourceMappingURL=DataAnalyzer.d.ts.map