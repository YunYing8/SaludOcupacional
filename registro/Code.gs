/**
 * Abre el formulario de registro como modal en Google Sheets
 */
function mostrarFormulario() {
  const html = HtmlService.createHtmlOutputFromFile('formulario')
    .setWidth(440)
    .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Formulario de Registro');
}

/**
 * Guarda un nuevo trabajador en la hoja "Registro"
 * @param {Object} datos - Datos del formulario (sin edad, se calcula aquí)
 * @returns {Object} { ok: true } o { ok: false, msg: '...' }
 */
function guardarEnSheet(datos) {
  try {
    // ── Validación de campos obligatorios ──────────────────────────────────
    if (!datos.nombre || !datos.apellido || !datos.dni || !datos.cargo || !datos.fecha_nac) {
      return { ok: false, msg: 'Nombre, apellido, DNI, cargo y fecha de nacimiento son obligatorios.' };
    }

    // ── Validación de DNI (exactamente 8 dígitos numéricos) ───────────────
    if (!/^\d{8}$/.test(String(datos.dni).trim())) {
      return { ok: false, msg: 'El DNI debe tener exactamente 8 dígitos numéricos.' };
    }

    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registro');

    // ── Una sola lectura: detectar duplicado + última fila con datos reales ─
    // Leemos solo columnas A (nombre) y C (DNI) para no traer todo el sheet.
    // Usamos getLastRow() solo para dimensionar el rango; si hay filas con
    // formato vacías al final, la búsqueda desde abajo las ignora.
    const totalFilas = hoja.getLastRow();
    let ultimaFilaDatos = 1; // fila del encabezado como mínimo

    if (totalFilas > 1) {
      // Columnas A (índice 0) y C (índice 2) — rango desde fila 2 hasta el final
      const rango = hoja.getRange(2, 1, totalFilas - 1, 3).getValues();

      for (let i = 0; i < rango.length; i++) {
        // Verificar DNI duplicado en columna C
        if (String(rango[i][2]).trim() === String(datos.dni).trim()) {
          return { ok: false, msg: 'Ya existe un trabajador registrado con el DNI ' + datos.dni + '.' };
        }
        // Ir registrando la última fila que realmente tiene datos en columna A
        if (rango[i][0] !== '') {
          ultimaFilaDatos = i + 2; // +1 por índice 0, +1 por encabezado
        }
      }
    }

    // ── Parsear fecha sin problemas de zona horaria ───────────────────────
    const partes = datos.fecha_nac.split('-');
    const fechaNac = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

    // ── Calcular edad en el servidor ──────────────────────────────────────
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const diffMes = hoy.getMonth() - fechaNac.getMonth();
    if (diffMes < 0 || (diffMes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    // ── Escribir en la fila correcta (justo después del último dato real) ──
    // Evita el bug de appendRow que salta a filas lejanas cuando hay
    // formato aplicado en celdas vacías más abajo en el sheet.
    const nuevaFila = ultimaFilaDatos + 1;
    hoja.getRange(nuevaFila, 1, 1, 9).setValues([[
      datos.nombre.trim(),
      datos.apellido.trim(),
      datos.dni.trim(),
      datos.cargo.trim(),
      fechaNac,
      edad,
      datos.correo  ? datos.correo.trim()  : '',
      datos.celular ? datos.celular.trim() : '',
      datos.estado
    ]]);

    return { ok: true };

  } catch (e) {
    return { ok: false, msg: 'Error inesperado: ' + e.toString() };
  }
}
