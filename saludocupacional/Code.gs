const SPREADSHEET_ID = '1N0i-sG3UBH2UMVo_DF4Ivcwxyr2MvgIfAa4h18oQ5oc';
const HOJA_PERSONAL = 'Registro';
const HOJA_CONTROLES = 'CONTROLES';
const ADMINS = {
  'amancilla': 'gael',
  'emancilla': 'mateo'
};

/**
 * Función principal que se ejecuta al abrir la aplicación web
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('sistema_salud')
    .setTitle('Control de Salud - Grúas Mara')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Autentica usuarios (trabajadores por DNI o administradores por usuario/contraseña)
 * @param {string} tipo - 'admin' o 'trabajador'
 * @param {string} usuario - Usuario para admin
 * @param {string} clave - Contraseña para admin
 * @param {string} dni - DNI para trabajador
 * @returns {Object} Resultado de autenticación con datos del usuario
 */
function autenticar(tipo, usuario, clave, dni) {
  if (tipo === 'admin') {
    if (ADMINS[usuario] && ADMINS[usuario] === clave) {
      return { ok: true, rol: 'admin', nombre: usuario };
    }
    return { ok: false, msg: 'Usuario o contraseña incorrectos' };
  }

  if (tipo === 'trabajador') {
    const personal = getDatosPersonal();
    const trabajador = personal.find(p => String(p.dni).trim() === String(dni).trim());

    if (trabajador) {
      return { ok: true, rol: 'trabajador', datos: trabajador };
    }
    return { ok: false, msg: 'DNI no encontrado' };
  }
}

/**
 * Obtiene todos los datos del personal registrado
 * @returns {Array} Array de objetos con información del personal
 */
function getDatosPersonal() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const hoja = ss.getSheetByName(HOJA_PERSONAL);
  const filas = hoja.getDataRange().getValues();
  const resultados = [];

  for (let i = 1; i < filas.length; i++) {
    const f = filas[i];
    if (!f[0] && !f[2]) continue;

    resultados.push({
      nombre:     f[0],
      apellido:   f[1],
      dni:        String(f[2]),
      cargo:      f[3],
      nacimiento: f[4] ? Utilities.formatDate(new Date(f[4]), 'America/Lima', 'dd/MM/yyyy') : '',
      edad:       f[5],
      correo:     f[6],
      celular:    f[7],
      estado:     f[8]
    });
  }

  return resultados;
}

/**
 * Obtiene todos los controles de salud de un trabajador específico
 * @param {string} dni - DNI del trabajador
 * @returns {Array} Array de controles ordenados por fecha (más reciente primero)
 */
function getControlesPorDni(dni) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const hoja = ss.getSheetByName(HOJA_CONTROLES);
  const filas = hoja.getDataRange().getValues();
  const resultados = [];

  for (let i = 1; i < filas.length; i++) {
    const f = filas[i];
    if (String(f[0]) !== String(dni)) continue;

    resultados.push({
      dni:          String(f[0]),
      fecha:        f[1] ? Utilities.formatDate(new Date(f[1]), 'America/Lima', 'dd/MM/yyyy') : '',
      peso:         f[2],  // Columna C = PESO_KG
      talla:        f[3],  // Columna D = TALLA_M
      imc:          f[4],
      diag_imc:     f[5],
      sistolica:    f[6],
      diastolica:   f[7],
      pulso:        f[8],
      diag_pa:      f[9],
      glucosa:      f[10],
      diag_glucosa: f[11]
    });
  }

  return resultados.reverse();
}

/**
 * Obtiene todos los controles de salud registrados
 * @returns {Array} Array de todos los controles con número de fila
 */
function getTodosControles() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const hoja = ss.getSheetByName(HOJA_CONTROLES);
  const filas = hoja.getDataRange().getValues();
  const resultados = [];

  for (let i = 1; i < filas.length; i++) {
    const f = filas[i];
    if (!f[0]) continue;

    resultados.push({
      dni:          String(f[0]),
      fecha:        f[1] ? Utilities.formatDate(new Date(f[1]), 'America/Lima', 'dd/MM/yyyy') : '',
      peso:         f[2],  // Columna C = PESO_KG
      talla:        f[3],  // Columna D = TALLA_M
      imc:          f[4],
      diag_imc:     f[5],
      sistolica:    f[6],
      diastolica:   f[7],
      pulso:        f[8],
      diag_pa:      f[9],
      glucosa:      f[10],
      diag_glucosa: f[11],
      fila:         i + 1
    });
  }

  return resultados;
}

/**
 * Agrega un nuevo control de salud
 * @param {Object} datos - Datos del control (dni, fecha, peso, talla, sistolica, diastolica, pulso, glucosa)
 * @returns {Object} Resultado de la operación
 */
function agregarControl(datos) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hoja = ss.getSheetByName(HOJA_CONTROLES);

    const peso  = datos.peso  ? parseFloat(datos.peso)  : null;
    const talla = datos.talla ? parseFloat(datos.talla) : null;
    const sis   = datos.sistolica  ? parseFloat(datos.sistolica)  : null;
    const dia   = datos.diastolica ? parseFloat(datos.diastolica) : null;
    const pul   = datos.pulso      ? parseFloat(datos.pulso)      : null;
    const glu   = datos.glucosa    ? parseFloat(datos.glucosa)    : null;

    const imc   = (peso && talla)  ? Math.round((peso / (talla * talla)) * 100) / 100 : '';
    const diag_imc = calcularDiagIMC(imc);
    const diag_pa  = calcularDiagPA(sis, dia);
    const diag_glu = calcularDiagGlucosa(glu);

    hoja.appendRow([
      datos.dni,
      new Date(datos.fecha),
      peso  || '',  // Columna C = PESO_KG
      talla || '',  // Columna D = TALLA_M
      imc,
      diag_imc,
      sis || '',
      dia || '',
      pul || '',
      diag_pa,
      glu || '',
      diag_glu
    ]);

    return { ok: true };
  } catch(e) {
    return { ok: false, msg: e.toString() };
  }
}

/**
 * Edita un control de salud existente
 * @param {number} fila - Número de fila en la hoja
 * @param {Object} datos - Nuevos datos del control
 * @returns {Object} Resultado de la operación
 */
function editarControl(fila, datos) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hoja = ss.getSheetByName(HOJA_CONTROLES);

    const peso  = datos.peso  ? parseFloat(datos.peso)  : null;
    const talla = datos.talla ? parseFloat(datos.talla) : null;
    const sis   = datos.sistolica  ? parseFloat(datos.sistolica)  : null;
    const dia   = datos.diastolica ? parseFloat(datos.diastolica) : null;
    const pul   = datos.pulso      ? parseFloat(datos.pulso)      : null;
    const glu   = datos.glucosa    ? parseFloat(datos.glucosa)    : null;

    const imc   = (peso && talla)  ? Math.round((peso / (talla * talla)) * 100) / 100 : '';
    const diag_imc = calcularDiagIMC(imc);
    const diag_pa  = calcularDiagPA(sis, dia);
    const diag_glu = calcularDiagGlucosa(glu);

    hoja.getRange(fila, 1, 1, 12).setValues([[
      datos.dni,
      new Date(datos.fecha),
      peso  || '',  // Columna C = PESO_KG
      talla || '',  // Columna D = TALLA_M
      imc,
      diag_imc,
      sis || '',
      dia || '',
      pul || '',
      diag_pa,
      glu || '',
      diag_glu
    ]]);

    return { ok: true };
  } catch(e) {
    return { ok: false, msg: e.toString() };
  }
}

/**
 * Elimina un control de salud
 * @param {number} fila - Número de fila a eliminar
 * @returns {Object} Resultado de la operación
 */
function eliminarControl(fila) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hoja = ss.getSheetByName(HOJA_CONTROLES);
    hoja.deleteRow(fila);
    return { ok: true };
  } catch(e) {
    return { ok: false, msg: e.toString() };
  }
}

/**
 * Calcula el diagnóstico según el IMC
 * @param {number} imc - Índice de Masa Corporal
 * @returns {string} Diagnóstico del IMC
 */
function calcularDiagIMC(imc) {
  if (!imc) return '';
  imc = parseFloat(imc);
  if (imc < 18.5) return 'POR DEBAJO DEL PESO';
  if (imc < 25)   return 'SALUDABLE';
  if (imc < 30)   return 'SOBREPESO';
  if (imc < 35)   return 'OBESIDAD I';
  if (imc < 40)   return 'OBESIDAD II';
  return 'OBESIDAD III';
}

/**
 * Calcula el diagnóstico de presión arterial
 * @param {number} sis - Presión sistólica
 * @param {number} dia - Presión diastólica
 * @returns {string} Diagnóstico de presión arterial
 */
function calcularDiagPA(sis, dia) {
  if (!sis || !dia) return '';
  sis = parseFloat(sis);
  dia = parseFloat(dia);
  if (sis < 120 && dia < 80)  return 'NORMAL';
  if (sis < 130 && dia < 80)  return 'ELEVADA';
  if (sis < 140 || dia < 90)  return 'HIPERTENSIÓN I';
  return 'HIPERTENSIÓN II';
}

/**
 * Calcula el diagnóstico de glucosa
 * @param {number} glu - Nivel de glucosa en mg/dL
 * @returns {string} Diagnóstico de glucosa
 */
function calcularDiagGlucosa(glu) {
  if (!glu) return '';
  glu = parseFloat(glu);
  if (glu < 70)  return 'HIPOGLUCEMIA';
  if (glu < 100) return 'NORMAL';
  if (glu < 126) return 'PRE-DIABÉTICO';
  return 'DIABÉTICO';
}

/**
 * Recalcula IMC y diagnósticos para TODOS los controles existentes en Excel
 * IMPORTANTE: Ejecutar esta función UNA SOLA VEZ para actualizar datos ingresados manualmente
 * @returns {Object} Resultado con cantidad de registros actualizados
 */
function recalcularTodosLosControles() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hoja = ss.getSheetByName(HOJA_CONTROLES);
    const filas = hoja.getDataRange().getValues();

    let actualizados = 0;

    // Recorrer desde fila 2 (saltar encabezados)
    for (let i = 1; i < filas.length; i++) {
      const f = filas[i];

      // Si la fila está vacía (sin DNI), saltarla
      if (!f[0]) continue;

      const peso  = f[2] ? parseFloat(f[2]) : null;  // Columna C = PESO_KG
      const talla = f[3] ? parseFloat(f[3]) : null;  // Columna D = TALLA_M
      const sis   = f[6] ? parseFloat(f[6]) : null;
      const dia   = f[7] ? parseFloat(f[7]) : null;
      const pul   = f[8] ? parseFloat(f[8]) : null;
      const glu   = f[10] ? parseFloat(f[10]) : null;

      // Recalcular IMC y diagnósticos
      const imc      = (peso && talla) ? Math.round((peso / (talla * talla)) * 100) / 100 : '';
      const diag_imc = calcularDiagIMC(imc);
      const diag_pa  = calcularDiagPA(sis, dia);
      const diag_glu = calcularDiagGlucosa(glu);

      // Actualizar SOLO las columnas calculadas (E, F, J, L)
      const filaExcel = i + 1;
      hoja.getRange(filaExcel, 5).setValue(imc);        // Columna E: IMC
      hoja.getRange(filaExcel, 6).setValue(diag_imc);   // Columna F: DIAG_IMC
      hoja.getRange(filaExcel, 10).setValue(diag_pa);   // Columna J: DIAG_PA
      hoja.getRange(filaExcel, 12).setValue(diag_glu);  // Columna L: DIAG_GLUCOSA

      actualizados++;
    }

    return {
      ok: true,
      msg: 'Se actualizaron ' + actualizados + ' registros correctamente',
      total: actualizados
    };

  } catch(e) {
    return { ok: false, msg: 'Error: ' + e.toString() };
  }
}

/**
 * Función de prueba para autenticación
 */
function testAutenticar() {
  const resultado = autenticar('trabajador', '', '', '48578094');
  Logger.log(JSON.stringify(resultado));
  return resultado;
}
