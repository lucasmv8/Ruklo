"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnalyzer = void 0;
const prisma_1 = require("../../generated/prisma");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class DataAnalyzer {
    constructor() {
        this.prisma = new prisma_1.PrismaClient();
        this.outputDir = path.join(__dirname, '../output');
        // Crear directorio de salida si no existe
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    /**
     * PREGUNTA 1: Detecta clientes que visitan 5 veces seguidas una misma tienda sin haber recargado su tarjeta entre medio
     */
    async detectarClientesBeneficio() {
        console.log('🔍 Analizando clientes elegibles para beneficio automático...\n');
        // Obtener todos los eventos ordenados por usuario y fecha
        const eventos = await this.prisma.event.findMany({
            include: {
                usuario: true,
                store: true
            },
            orderBy: [
                { usuarioId: 'asc' },
                { timestamp: 'asc' }
            ]
        });
        console.log(`📊 Total de eventos procesados: ${eventos.length}`);
        // Agrupar eventos por usuario
        const eventosPorUsuario = {};
        eventos.forEach(evento => {
            if (!eventosPorUsuario[evento.usuarioId]) {
                eventosPorUsuario[evento.usuarioId] = [];
            }
            eventosPorUsuario[evento.usuarioId].push(evento);
        });
        console.log(`👥 Total de usuarios únicos: ${Object.keys(eventosPorUsuario).length}`);
        const clientesElegibles = [];
        // Analizar cada usuario
        Object.entries(eventosPorUsuario).forEach(([userId, userEventos]) => {
            let visitasConsecutivas = 0;
            let ultimaStore = null;
            let visitasActuales = [];
            userEventos.forEach((evento, index) => {
                if (evento.type === 'visit') {
                    // Si es la misma tienda que la visita anterior (o es la primera visita consecutiva)
                    if (ultimaStore === null || ultimaStore === evento.storeId) {
                        if (visitasConsecutivas === 0) {
                            visitasActuales = []; // Reiniciar el array de visitas
                        }
                        visitasConsecutivas++;
                        ultimaStore = evento.storeId;
                        visitasActuales.push(evento);
                    }
                    else {
                        // Cambió de tienda, reiniciar contador
                        visitasConsecutivas = 1;
                        ultimaStore = evento.storeId;
                        visitasActuales = [evento];
                    }
                }
                else if (evento.type === 'recharge') {
                    // Si hay una recarga, reiniciar el contador
                    visitasConsecutivas = 0;
                    ultimaStore = null;
                    visitasActuales = [];
                }
                // Si llegó a 5 visitas consecutivas sin recargas
                if (visitasConsecutivas >= 5) {
                    const tienda = visitasActuales[0].store;
                    // Verificar si ya agregamos este cliente para esta combinación
                    const yaAgregado = clientesElegibles.some(c => c.userId === userId && c.storeId === ultimaStore &&
                        Math.abs(new Date(c.ultimaVisita).getTime() - new Date(evento.timestamp).getTime()) < 86400000 // Menos de 1 día de diferencia
                    );
                    if (!yaAgregado) {
                        clientesElegibles.push({
                            userId: userId,
                            storeId: ultimaStore,
                            storeName: tienda.id, // Solo tenemos el ID de la tienda
                            visitasConsecutivas: visitasConsecutivas,
                            primeraVisita: visitasActuales[0].timestamp,
                            ultimaVisita: evento.timestamp,
                            detalleVisitas: visitasActuales.map(v => ({
                                fecha: v.timestamp,
                                tienda: v.store.id
                            }))
                        });
                    }
                }
            });
        });
        console.log(`✅ Clientes elegibles encontrados: ${clientesElegibles.length}\n`);
        return clientesElegibles;
    }
    /**
     * PREGUNTA 2: Historial de transacciones por cliente agrupado por tipo con promedio semanal
     */
    async obtenerHistorialCliente(userId) {
        console.log(`🔍 Analizando historial del cliente: ${userId}...`);
        // Obtener eventos del cliente ordenados por fecha
        const eventos = await this.prisma.event.findMany({
            where: { usuarioId: userId },
            include: {
                usuario: true,
                store: true
            },
            orderBy: { timestamp: 'asc' }
        });
        if (eventos.length === 0) {
            console.log(`❌ No se encontraron eventos para el cliente: ${userId}`);
            return null;
        }
        // Agrupar por semanas
        const semanas = {};
        eventos.forEach(evento => {
            const fecha = new Date(evento.timestamp);
            // Obtener el lunes de la semana
            const primerDiaSemana = new Date(fecha);
            primerDiaSemana.setDate(fecha.getDate() - fecha.getDay() + 1);
            const claveSemana = primerDiaSemana.toISOString().split('T')[0];
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
            }
            else if (evento.type === 'recharge') {
                semanas[claveSemana].recargas.push(evento);
                semanas[claveSemana].totalRecargas += evento.amount || 0;
            }
        });
        // Convertir a array y calcular promedios
        const semanasArray = Object.values(semanas).map((semana) => ({
            ...semana,
            totalVisitas: semana.visitas.length,
            promedioSemanal: semana.totalRecargas
        }));
        // Calcular promedio general (incluyendo semanas sin recargas)
        const totalSemanas = semanasArray.length;
        const sumaTotal = semanasArray.reduce((sum, semana) => sum + semana.totalRecargas, 0);
        const promedioGeneral = totalSemanas > 0 ? sumaTotal / totalSemanas : 0;
        const cliente = eventos[0].usuario;
        const historial = {
            cliente: {
                id: cliente.id
            },
            estadisticas: {
                totalEventos: eventos.length,
                totalVisitas: eventos.filter(e => e.type === 'visit').length,
                totalRecargas: eventos.filter(e => e.type === 'recharge').length,
                montoTotalRecargado: eventos
                    .filter(e => e.type === 'recharge')
                    .reduce((sum, e) => sum + (e.amount || 0), 0),
                promedioSemanalRecargas: promedioGeneral
            },
            semanas: semanasArray.sort((a, b) => new Date(a.semana).getTime() - new Date(b.semana).getTime())
        };
        console.log(`✅ Historial procesado para: ${cliente.id}`);
        return historial;
    }
    /**
     * Obtener todos los usuarios disponibles
     */
    async obtenerUsuarios() {
        return await this.prisma.user.findMany({
            select: {
                id: true
            },
            orderBy: { id: 'asc' }
        });
    }
    /**
     * Generar reporte completo en archivos de texto
     */
    async generarReporteCompleto() {
        console.log('📋 Generando reporte completo...\n');
        // Pregunta 1: Clientes elegibles para beneficio
        const clientesBeneficio = await this.detectarClientesBeneficio();
        let reporte1 = '='.repeat(80) + '\n';
        reporte1 += 'REPORTE 1: CLIENTES ELEGIBLES PARA BENEFICIO AUTOMÁTICO\n';
        reporte1 += '='.repeat(80) + '\n\n';
        reporte1 += 'CRITERIO: Clientes que visitan 5 veces seguidas una misma tienda sin haber recargado su tarjeta entre medio\n\n';
        reporte1 += `TOTAL DE CLIENTES ELEGIBLES: ${clientesBeneficio.length}\n\n`;
        if (clientesBeneficio.length > 0) {
            reporte1 += 'DETALLE DE CLIENTES:\n';
            reporte1 += '-'.repeat(80) + '\n';
            clientesBeneficio.forEach((cliente, index) => {
                reporte1 += `${index + 1}. Cliente ID: ${cliente.userId}\n`;
                reporte1 += `   Tienda ID: ${cliente.storeName}\n`;
                reporte1 += `   Visitas consecutivas: ${cliente.visitasConsecutivas}\n`;
                reporte1 += `   Primera visita: ${cliente.primeraVisita.toLocaleString()}\n`;
                reporte1 += `   Última visita: ${cliente.ultimaVisita.toLocaleString()}\n`;
                reporte1 += `   Detalle de visitas:\n`;
                cliente.detalleVisitas.forEach((visita, i) => {
                    reporte1 += `     ${i + 1}. ${visita.fecha.toLocaleString()} - Tienda: ${visita.tienda}\n`;
                });
                reporte1 += '\n';
            });
        }
        else {
            reporte1 += 'No se encontraron clientes que cumplan con el criterio.\n\n';
        }
        reporte1 += '\nIMPLEMENTACIÓN SUGERIDA:\n';
        reporte1 += '-'.repeat(50) + '\n';
        reporte1 += '1. Crear una tabla "beneficios" para almacenar los beneficios otorgados\n';
        reporte1 += '2. Implementar un job/cron que ejecute esta lógica periódicamente\n';
        reporte1 += '3. Considerar validaciones adicionales:\n';
        reporte1 += '   - Que el cliente no haya recibido el beneficio recientemente\n';
        reporte1 += '   - Que la tienda esté activa y participando del programa\n';
        reporte1 += '   - Límites de beneficios por periodo\n';
        reporte1 += '4. Para manejar grandes volúmenes de datos:\n';
        reporte1 += '   - Usar caché (Redis) para almacenar contadores de visitas consecutivas\n';
        reporte1 += '   - Procesar en lotes (batches) para evitar timeouts\n';
        reporte1 += '   - Implementar índices en la base de datos para queries eficientes\n\n';
        // Guardar reporte 1
        const archivo1 = path.join(this.outputDir, 'reporte_clientes_beneficio.txt');
        fs.writeFileSync(archivo1, reporte1);
        console.log(`✅ Reporte 1 guardado en: ${archivo1}`);
        // Pregunta 2: Historial detallado de algunos clientes
        const usuarios = await this.obtenerUsuarios();
        let reporte2 = '='.repeat(80) + '\n';
        reporte2 += 'REPORTE 2: HISTORIAL DE TRANSACCIONES POR CLIENTE\n';
        reporte2 += '='.repeat(80) + '\n\n';
        reporte2 += 'CRITERIO: Historial agrupado por tipo (visit/recharge) con promedio de monto recargado por semana\n\n';
        // Analizar los primeros 10 usuarios como ejemplo
        const usuariosMuestra = usuarios.slice(0, 10);
        for (const usuario of usuariosMuestra) {
            const historial = await this.obtenerHistorialCliente(usuario.id);
            if (historial) {
                reporte2 += `CLIENTE ID: ${historial.cliente.id}\n`;
                reporte2 += '-'.repeat(50) + '\n';
                reporte2 += `Total de eventos: ${historial.estadisticas.totalEventos}\n`;
                reporte2 += `Total de visitas: ${historial.estadisticas.totalVisitas}\n`;
                reporte2 += `Total de recargas: ${historial.estadisticas.totalRecargas}\n`;
                reporte2 += `Monto total recargado: $${historial.estadisticas.montoTotalRecargado.toFixed(2)}\n`;
                reporte2 += `Promedio semanal de recargas: $${historial.estadisticas.promedioSemanalRecargas.toFixed(2)}\n\n`;
                reporte2 += 'DETALLE POR SEMANAS:\n';
                historial.semanas.forEach((semana, index) => {
                    reporte2 += `  Semana ${index + 1} (${semana.semana}):\n`;
                    reporte2 += `    Visitas: ${semana.totalVisitas}\n`;
                    reporte2 += `    Recargas: ${semana.recargas.length}\n`;
                    reporte2 += `    Monto total: $${semana.totalRecargas.toFixed(2)}\n\n`;
                });
                reporte2 += '\n';
            }
        }
        reporte2 += '\nCONSIDERACIONES PARA DEVOLUCIÓN DE DATOS:\n';
        reporte2 += '-'.repeat(50) + '\n';
        reporte2 += '1. ESTRUCTURA DE RESPUESTA API:\n';
        reporte2 += '   - Incluir semanas sin recargas con promedio 0\n';
        reporte2 += '   - Ordenar cronológicamente\n';
        reporte2 += '   - Incluir metadatos de paginación si es necesario\n\n';
        reporte2 += '2. OPTIMIZACIONES:\n';
        reporte2 += '   - Usar agregaciones de base de datos en lugar de procesamiento en memoria\n';
        reporte2 += '   - Implementar filtros por fecha para reducir el dataset\n';
        reporte2 += '   - Considerar caché para consultas frecuentes\n\n';
        // Guardar reporte 2
        const archivo2 = path.join(this.outputDir, 'reporte_historial_clientes.txt');
        fs.writeFileSync(archivo2, reporte2);
        console.log(`✅ Reporte 2 guardado en: ${archivo2}`);
        console.log(`\n📁 Todos los reportes se guardaron en: ${this.outputDir}`);
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.DataAnalyzer = DataAnalyzer;
//# sourceMappingURL=DataAnalyzer.js.map