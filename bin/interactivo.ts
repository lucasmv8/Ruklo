import { RukloExecutor } from '../src/core/RukloExecutor';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function mostrarUsuariosDisponibles(executor: RukloExecutor) {
  const usuarios = await executor.obtenerUsuariosDisponibles();
  
  console.log('\n📋 USUARIOS DISPONIBLES:');
  console.log('='.repeat(40));
  
  usuarios.forEach((usuario, index) => {
    console.log(`${index + 1}. ${usuario.id}`);
  });
  
  return usuarios;
}

async function ejecutarAnalisisHistorial(executor: RukloExecutor) {
  console.log('\n🔍 ANÁLISIS INTERACTIVO DE HISTORIAL DE CLIENTES');
  console.log('='.repeat(60));

  const usuarios = await mostrarUsuariosDisponibles(executor);
  
  const respuesta = await pregunta(`\n🎯 Selecciona un usuario (1-${usuarios.length}) o 'q' para volver al menú: `);
  
  if (respuesta.toLowerCase() === 'q') {
    return;
  }

  const indiceUsuario = parseInt(respuesta) - 1;
  
  if (isNaN(indiceUsuario) || indiceUsuario < 0 || indiceUsuario >= usuarios.length) {
    console.log('❌ Selección inválida');
    return;
  }

  const usuarioSeleccionado = usuarios[indiceUsuario];
  console.log(`\n🔄 Analizando historial de ${usuarioSeleccionado.id}...`);

  await executor.ejecutarAnalisisInteractivo(usuarioSeleccionado.id);
}

async function ejecutarAnalisisBeneficios(executor: RukloExecutor) {
  console.log('\n💰 ANÁLISIS DE BENEFICIOS Y DESCUENTOS');
  console.log('='.repeat(60));
  
  console.log('🔄 Ejecutando análisis completo de beneficios...\n');
  
  await executor.ejecutarAnalisisBeneficios();
  
  console.log('\n✅ Análisis de beneficios completado');
}

async function mostrarMenuPrincipal(): Promise<string> {
  console.log('\n🚀 SISTEMA DE ANÁLISIS RUKLO');
  console.log('='.repeat(50));
  console.log('¿Qué tipo de análisis deseas realizar?');
  console.log('');
  console.log('1. 📊 Análisis de Historial de Clientes');
  console.log('2. 💰 Análisis de Beneficios y Descuentos');
  console.log('3. 🚪 Salir');
  console.log('');
  
  return await pregunta('👉 Selecciona una opción (1-3): ');
}

async function main() {
  const executor = new RukloExecutor();

  try {
    let continuar = true;
    
    while (continuar) {
      const opcion = await mostrarMenuPrincipal();
      
      switch (opcion) {
        case '1':
          await ejecutarAnalisisHistorial(executor);
          break;
          
        case '2':
          await ejecutarAnalisisBeneficios(executor);
          break;
          
        case '3':
          console.log('\n👋 ¡Gracias por usar el sistema de análisis Ruklo!');
          continuar = false;
          break;
          
        default:
          console.log('\n❌ Opción no válida. Por favor, selecciona 1, 2 o 3.');
          break;
      }
      
      if (continuar) {
        const respuesta = await pregunta('\n🔄 ¿Deseas realizar otro análisis? (s/n): ');
        if (respuesta.toLowerCase() !== 's' && respuesta.toLowerCase() !== 'si') {
          console.log('\n👋 ¡Gracias por usar el sistema de análisis Ruklo!');
          continuar = false;
        }
      }
    }

  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  } finally {
    await executor.disconnect();
    rl.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
