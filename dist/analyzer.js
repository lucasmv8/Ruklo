"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnalyzer = void 0;
const DataAnalyzer_1 = require("./DataAnalyzer");
Object.defineProperty(exports, "DataAnalyzer", { enumerable: true, get: function () { return DataAnalyzer_1.DataAnalyzer; } });
async function main() {
    const analyzer = new DataAnalyzer_1.DataAnalyzer();
    try {
        console.log('🚀 Iniciando análisis de datos de Ruklo\n');
        console.log('='.repeat(60));
        // Generar el reporte completo
        await analyzer.generarReporteCompleto();
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Análisis completado exitosamente!');
        console.log('\n📋 Se generaron los siguientes reportes:');
        console.log('   1. reporte_clientes_beneficio.txt - Respuesta a Pregunta 1');
        console.log('   2. reporte_historial_clientes.txt - Respuesta a Pregunta 2');
        console.log('\n💡 Los reportes incluyen recomendaciones técnicas para la implementación.');
    }
    catch (error) {
        console.error('❌ Error durante el análisis:', error);
        process.exit(1);
    }
    finally {
        await analyzer.disconnect();
    }
}
// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
    main().catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=analyzer.js.map