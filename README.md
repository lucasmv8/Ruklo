# 🎯 Ruklo - Sistema de Análisis de Datos

Prueba técnica para Ruklo - Sistema completo de análisis de comportamiento de clientes y eventos comerciales.

## 📋 Tabla de Contenidos
- [Descripción General](#-descripción-general)
- [Documentación Técnica](#-documentación-técnica)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso del Sistema](#-uso-del-sistema)
- [Arquitectura](#-arquitectura)
- [Funcionalidades](#-funcionalidades)
- [Base de Datos](#-base-de-datos)
- [Reportes Generados](#-reportes-generados)
- [Scripts Disponibles](#-scripts-disponibles)
- [Troubleshooting](#-troubleshooting)

## 🎯 Descripción General

Ruklo es un sistema avanzado de análisis de datos diseñado para procesar y analizar eventos de clientes en tiendas comerciales. El sistema identifica patrones de comportamiento, calcula beneficios automáticos y genera reportes detallados sobre el historial de clientes.

### Características Principales:
- 🔍 **Análisis de Patrones**: Identifica comportamientos específicos de clientes
- 💰 **Sistema de Beneficios**: Detecta clientes elegibles para descuentos automáticos
- 📊 **Reportes Detallados**: Genera análisis completos por cliente y estadísticas generales
- 🖥️ **Modo Interactivo**: Interfaz de consola intuitiva para análisis en tiempo real
- 🗄️ **Base de Datos Robusta**: Utiliza PostgreSQL con Prisma ORM

## 📄 Documentación Técnica

### Respuestas a la Prueba Técnica
📋 **Archivo**: `Respuestas Prueba tecnica.pdf`

Este documento contiene las respuestas detalladas a todas las preguntas de la prueba técnica, incluyendo:

- **Parte 1**: Análisis de requerimientos y diseño de solución
- **Parte 2**: Limitaciones de la solución actual y escalabilidad
- **Consideraciones técnicas**: Optimizaciones, índices y mejoras de rendimiento
- **Arquitectura propuesta**: Diseño para manejo de grandes volúmenes de datos

> 💡 **Nota**: El PDF incluye respuestas técnicas específicas sobre limitaciones de rendimiento, manejo de 100,000 eventos diarios, y estrategias de optimización para cada componente del sistema.

## 🛠️ Requisitos Previos

- **Node.js** >= 16.0.0
- **npm** >= 7.0.0
- **Docker** y **Docker Compose** (para la base de datos)
- **Git** (para clonar el repositorio)

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/lucasmv8/Ruklo.git
cd Ruklo
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d

# Generar cliente Prisma
npm run db:generate

# Aplicar esquema a la base de datos
npm run db:push

# Poblar con datos de prueba
npm run seed
```

## ⚙️ Configuración

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DB_USERNAME=lucasmv
DB_PASSWORD=postgres
DB_NAME=ruklo
DB_HOST=localhost
PORT=3000

DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"
```

> **Nota**: Puedes personalizar los valores según tu configuración local. El archivo utiliza variables de entorno para mayor flexibilidad y seguridad.

### Configuración de Docker
El proyecto incluye un `docker-compose.yml` preconfigurado:
- **PostgreSQL 15**
- Puerto: `5432`
- Base de datos: `ruklo`
- Usuario: `postgres`
- Contraseña: `postgres`

## 🚀 Uso del Sistema

### Modo Interactivo (Principal)
```bash
npm start
```

El sistema iniciará con un menú interactivo donde podrás elegir:

#### 1. 📊 Análisis de Historial de Clientes
- Permite seleccionar un cliente específico de la lista disponible
- Muestra análisis detallado semana por semana
- Incluye estadísticas de visitas y recargas
- Calcula promedios y totales

#### 2. 💰 Análisis de Beneficios y Descuentos
- Identifica clientes elegibles para beneficios automáticos
- Aplica el criterio: 5 visitas consecutivas sin recarga
- Genera reporte completo de clientes beneficiarios

#### 3. 🚪 Salir
- Cierra el sistema de forma segura

### Ejemplo de Uso Interactivo:
```
🚀 SISTEMA DE ANÁLISIS RUKLO
==================================================
¿Qué tipo de análisis deseas realizar?

1. 📊 Análisis de Historial de Clientes
2. 💰 Análisis de Beneficios y Descuentos
3. 🚪 Salir

👉 Selecciona una opción (1-3): 1

📋 USUARIOS DISPONIBLES:
========================================
1. client_0
2. client_1
3. client_2
...

🎯 Selecciona un usuario (1-10) o 'q' para volver al menú: 1
```

## 🏗️ Arquitectura

### Estructura del Proyecto
```
Ruklo/
├── bin/                          # Scripts ejecutables
│   └── interactivo.ts           # 🎯 PUNTO DE ENTRADA PRINCIPAL
├── prisma/                      # Configuración ORM
│   ├── schema.prisma           # Esquema de base de datos
│   ├── seed.ts                 # Script de populación
│   └── seedData/               # Datos de prueba
├── src/                         # Código fuente principal
│   ├── core/                   # Lógica central
│   │   ├── RukloExecutor.ts    # Coordinador principal
│   │   ├── AnalyzersManager.ts # Gestor de analizadores
│   │   └── DataProvider.ts     # Proveedor de datos
│   ├── analyzers/              # Analizadores específicos
│   │   ├── BeneficioAnalyzer.ts # Análisis de beneficios
│   │   └── HistorialAnalyzer.ts # Análisis de historiales
│   ├── services/               # Servicios auxiliares
│   │   ├── DatabaseService.ts  # Servicio de BD
│   │   └── ReportGenerator.ts  # Generador de reportes
│   ├── types/                  # Definiciones TypeScript
│   └── utils/                  # Utilidades
├── data/                        # Datos originales JSON
├── output/                      # Reportes generados
├── generated/                   # Cliente Prisma generado
└── docker-compose.yml          # Configuración Docker
```

### Flujo de Datos
```
📤 Datos JSON → 🗄️ PostgreSQL → 🔄 Prisma Client → 🧮 Analizadores → 📊 Reportes
```

## 🎛️ Funcionalidades

### 1. Análisis de Beneficios (`BeneficioAnalyzer`)
**Objetivo**: Identificar clientes elegibles para descuentos automáticos

**Criterio**: Cliente que visita 5 veces consecutivas la misma tienda sin recargar entre medio

**Proceso**:
1. Agrupa eventos por usuario
2. Analiza secuencias de visitas consecutivas
3. Detecta interrupciones por recargas
4. Identifica patrones que califican para beneficio

**Salida**: Lista de clientes elegibles con detalles de visitas

### 2. Análisis de Historial (`HistorialAnalyzer`)
**Objetivo**: Proporcionar vista detallada del comportamiento de un cliente

**Funcionalidades**:
- Agrupación de eventos por semanas
- Estadísticas de visitas y recargas
- Cálculo de promedios semanales
- Análisis temporal detallado

**Salida**: Reporte semanal completo con métricas

### 3. Gestión de Datos (`DataProvider`)
**Funcionalidades**:
- Conexión con base de datos PostgreSQL
- Consultas optimizadas con Prisma
- Obtención de estadísticas generales
- Gestión de usuarios disponibles

## 🗄️ Base de Datos

### Modelo de Datos

#### Entidades Principales:
```prisma
model User {
  id      String  @id
  events  Event[]
}

model Store {
  id      String  @id  
  events  Event[]
}

model Event {
  id         Int       @id @default(autoincrement())
  type       EventType
  timestamp  DateTime
  amount     Float?    
  usuarioId  String
  storeId    String
}

enum EventType {
  visit
  recharge
}
```

### Tipos de Eventos:
- **`visit`**: Visita a una tienda (sin monto)
- **`recharge`**: Recarga de tarjeta (con monto)

### Relaciones:
- Un Usuario puede tener múltiples Eventos
- Una Tienda puede tener múltiples Eventos
- Cada Evento pertenece a un Usuario y una Tienda

## 📊 Reportes Generados

### 1. Reporte de Beneficios (`reporte_clientes_beneficio.txt`)
```
================================================================================
REPORTE 1: CLIENTES ELEGIBLES PARA BENEFICIO AUTOMÁTICO
================================================================================

CRITERIO: Clientes que visitan 5 veces seguidas una misma tienda sin haber recargado

TOTAL DE CLIENTES ELEGIBLES: X

DETALLE DE CLIENTES:
--------------------------------------------------------------------------------
1. Cliente ID: client_X
   Tienda ID: storeX
   Visitas consecutivas: 5
   Primera visita: [fecha]
   Última visita: [fecha]
   Detalle de visitas: [lista detallada]
```

### 2. Reporte de Historial (`reporte_historial_clientes.txt`)
```
================================================================================
REPORTE 2: HISTORIAL DETALLADO DE CLIENTES
================================================================================

📊 ESTADÍSTICAS GENERALES:
- Total eventos: X
- Total visitas: X
- Total recargas: X
- Monto total: $X.XX

📅 ANÁLISIS SEMANAL:
[Detalle semana por semana con visitas y recargas]
```

## 🛠️ Scripts Disponibles

### Comandos Principales:
```bash
npm start              # Iniciar modo interactivo
npm run seed           # Poblar base de datos
```

### Comandos de Base de Datos:
```bash
npm run db:generate    # Generar cliente Prisma
npm run db:push        # Aplicar esquema a la DB
npm run db:studio      # Abrir Prisma Studio
npm run db:reset       # Resetear base de datos
```

### Comandos de Desarrollo:
```bash
npm run convert-json   # Convertir JSON a TypeScript
npm test              # Ejecutar pruebas
```

## 🐛 Troubleshooting

### Problemas Comunes:

#### 1. Error de Conexión a Base de Datos
```bash
# Verificar que Docker esté ejecutándose
docker-compose ps

# Reiniciar contenedor de PostgreSQL
docker-compose restart postgres
```

#### 2. Error "Cannot find module '@prisma/client'"
```bash
# Regenerar cliente Prisma
npm run db:generate
```

#### 3. Error "relation does not exist"
```bash
# Aplicar esquema a la base de datos
npm run db:push
```

#### 4. Base de Datos Vacía
```bash
# Ejecutar seed para poblar datos
npm run seed
```

### Logs y Debugging:
- Los errores se muestran en consola con emojis descriptivos
- Verificar conexión de red para Docker
- Revisar variables de entorno en `.env`

## 🔧 Personalización

### Configuración Avanzada:
El sistema permite personalizar parámetros en `ReporteConfig`:
- `maxUsuariosMuestra`: Número máximo de usuarios en reportes
- `visitasConsecutivasMinimas`: Criterio para beneficios
- `outputDir`: Directorio de salida de reportes

### Extensión del Sistema:
- Agregar nuevos analizadores en `src/analyzers/`
- Crear nuevos tipos de reportes en `src/services/`
- Extender el modelo de datos en `prisma/schema.prisma`

---

**¡Disfruta usando el Sistema de Análisis Ruklo! 🚀**
