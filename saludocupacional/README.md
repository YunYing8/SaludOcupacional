# Sistema de Control de Salud Ocupacional - Grúas Mara S.A.C.

Sistema web desarrollado con Google Apps Script para el seguimiento y control de salud ocupacional de trabajadores.

## 📋 Descripción

Sistema integral que permite:
- **Trabajadores**: Consultar su historial de controles de salud y recibir recomendaciones personalizadas
- **Administradores**: Gestionar controles de salud de todos los trabajadores con funcionalidad CRUD completa

## 🚀 Características

### Para Trabajadores
- ✅ Login mediante DNI
- 📊 Visualización de información personal (DNI, cargo, edad)
- 📈 Historial completo de controles de salud
- 💡 Recomendaciones personalizadas de salud basadas en:
  - **IMC** (Índice de Masa Corporal)
  - **Presión Arterial**
  - **Niveles de Glucosa**
- 🎯 Cálculo automático de peso ideal y objetivos de salud

### Para Administradores
- 🔐 Login con usuario y contraseña
- 📊 Dashboard con estadísticas globales
- 👥 Gestión completa de controles de salud:
  - Crear nuevos controles
  - Editar controles existentes
  - Eliminar controles
- 🔍 Búsqueda y filtrado por DNI
- 📅 Estadísticas del mes actual

## 🏥 Métricas de Salud

### IMC (Índice de Masa Corporal)
- **Por debajo del peso**: IMC < 18.5
- **Saludable**: 18.5 ≤ IMC < 25
- **Sobrepeso**: 25 ≤ IMC < 30
- **Obesidad I**: 30 ≤ IMC < 35
- **Obesidad II**: 35 ≤ IMC < 40
- **Obesidad III**: IMC ≥ 40

### Presión Arterial
- **Normal**: Sistólica < 120 y Diastólica < 80
- **Elevada**: Sistólica < 130 y Diastólica < 80
- **Hipertensión I**: Sistólica < 140 o Diastólica < 90
- **Hipertensión II**: Sistólica ≥ 140 o Diastólica ≥ 90

### Glucosa (mg/dL)
- **Hipoglucemia**: < 70
- **Normal**: 70-99
- **Pre-diabético**: 100-125
- **Diabético**: ≥ 126

## 📁 Estructura del Proyecto

```
saludocupacional/
├── Code.gs                  # Backend (Google Apps Script)
├── sistema_salud.html       # Frontend (HTML + CSS + JavaScript)
└── README.md               # Documentación
```

## 🔧 Configuración

### 1. Configurar Google Sheets

Crear un Google Spreadsheet con dos hojas:

#### Hoja "Registro" (Personal)
| Nombre | Apellido | DNI | Cargo | Fecha Nacimiento | Edad | Correo | Celular | Estado |
|--------|----------|-----|-------|------------------|------|--------|---------|--------|

#### Hoja "CONTROLES" (Controles de Salud)
| DNI | Fecha | Peso | Talla | IMC | Diag. IMC | Sistólica | Diastólica | Diag. PA | Glucosa | Diag. Glucosa |
|-----|-------|------|-------|-----|-----------|-----------|------------|----------|---------|---------------|

### 2. Configurar Apps Script

1. Abrir el Google Sheet
2. Ir a **Extensiones > Apps Script**
3. Copiar el contenido de `Code.gs`
4. Actualizar la constante `SPREADSHEET_ID` con el ID de tu hoja
5. Configurar usuarios administradores en el objeto `ADMINS`:
   ```javascript
   const ADMINS = {
     'usuario1': 'contraseña1',
     'usuario2': 'contraseña2'
   };
   ```

### 3. Crear la Interfaz Web

1. En el editor de Apps Script: **Archivo > Nuevo > Archivo HTML**
2. Nombrar el archivo como `sistema_salud`
3. Copiar el contenido de `sistema_salud.html`

### 4. Desplegar como Web App

1. En Apps Script: **Implementar > Nueva implementación**
2. Tipo: **Aplicación web**
3. Configuración:
   - Descripción: "Sistema de Control de Salud"
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona** (o según necesidad)
4. Hacer clic en **Implementar**
5. Copiar la URL de la aplicación web

## 💻 Tecnologías

- **Backend**: Google Apps Script (JavaScript)
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Base de Datos**: Google Sheets
- **Hosting**: Google Apps Script Web App

## 🎨 Diseño

- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Colores Corporativos**: Basados en la identidad de Grúas Mara
- **UX/UI Moderna**: Interfaz intuitiva con animaciones suaves
- **Sistema de Caché**: Optimización de rendimiento (5 minutos)

## 🔐 Seguridad

- ✅ Validación de credenciales en backend
- ✅ Validación de DNI (8 dígitos)
- ✅ Confirmación antes de eliminar registros
- ✅ Manejo de errores robusto
- ✅ Caché local con expiración automática

## 📊 Funcionalidades Avanzadas

### Sistema de Recomendaciones
El sistema genera recomendaciones personalizadas basadas en el último control:

- **Cálculo de peso ideal** según talla
- **Objetivos de peso** (cuántos kg subir/bajar)
- **Consejos de salud** específicos por métrica
- **Clasificación visual** con colores (verde/amarillo/rojo)

### Optimización
- **Caché local** para reducir llamadas al servidor
- **Debouncing** en búsquedas
- **Lazy loading** de datos
- **Skeleton loaders** para mejor UX

## 👤 Credenciales de Prueba

### Administradores (configurables en `Code.gs`)
```
Usuario: amancilla | Contraseña: gael
Usuario: emancilla | Contraseña: mateo
```

### Trabajadores
Login mediante DNI (debe existir en la hoja "Registro")

## 📝 Uso

### Como Trabajador
1. Ingresar DNI en la pantalla de login
2. Ver información personal y controles de salud
3. Revisar recomendaciones personalizadas

### Como Administrador
1. Login con usuario y contraseña
2. Ver estadísticas globales en el dashboard
3. Agregar/editar/eliminar controles de salud
4. Buscar por DNI específico

## 🔄 Actualizaciones Futuras Sugeridas

- [ ] Exportar reportes a PDF/Excel
- [ ] Gráficos de evolución temporal
- [ ] Notificaciones automáticas
- [ ] Sistema de alertas para valores críticos
- [ ] Integración con calendario para citas
- [ ] Historial de cambios (audit log)
- [ ] Filtros avanzados por fecha/cargo
- [ ] Reportes estadísticos agregados

## 📄 Licencia

Proyecto desarrollado para Grúas Mara S.A.C.

## 👨‍💻 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al administrador del sistema.

---

**Última actualización**: Febrero 2026
**Versión**: 1.0.0
