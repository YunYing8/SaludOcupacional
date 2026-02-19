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

    // ── Verificar DNI duplicado ────────────────────────────────────────────
    const filas = hoja.getDataRange().getValues();
    for (let i = 1; i < filas.length; i++) {
      if (String(filas[i][2]).trim() === String(datos.dni).trim()) {
        return { ok: false, msg: 'Ya existe un trabajador registrado con el DNI ' + datos.dni + '.' };
      }
    }

    // ── Parsear fecha sin problemas de zona horaria ───────────────────────
    // El input date devuelve "yyyy-MM-dd"; construimos la fecha con partes
    // para evitar desfases por UTC vs. hora local.
    const partes = datos.fecha_nac.split('-');
    const fechaNac = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

    // ── Calcular edad en el servidor ──────────────────────────────────────
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const diffMes = hoy.getMonth() - fechaNac.getMonth();
    if (diffMes < 0 || (diffMes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    // ── Insertar fila ─────────────────────────────────────────────────────
    hoja.appendRow([
      datos.nombre.trim(),
      datos.apellido.trim(),
      datos.dni.trim(),
      datos.cargo.trim(),
      fechaNac,                                         // Date real → Sheets lo formatea
      edad,                                             // número, sin texto "años"
      datos.correo  ? datos.correo.trim()  : '',
      datos.celular ? datos.celular.trim() : '',
      datos.estado
    ]);

    return { ok: true };

  } catch (e) {
    return { ok: false, msg: 'Error inesperado: ' + e.toString() };
  }
}
