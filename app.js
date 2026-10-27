// AXIONLOG: todo el código de la app en un solo archivo (generado juntando los módulos).
(function () {
'use strict';
const __m = {};

// ===== nucleo/ajustes.js =====
__m["nucleo/ajustes.js"] = (function () {
const __e = {};
// Definición de los ajustes del modelo: valores por defecto y cómo se muestran en pantalla.

// Valor "z" que corresponde a cada nivel de servicio (para el stock de seguridad).
const NIVELES_SERVICIO = { 90: 1.28, 95: 1.645, 97: 1.88, 99: 2.33 };

const AJUSTES_POR_DEFECTO = {
  meta: 97, // meta contractual del OTIF (%)
  z: 95, // nivel de servicio para el stock de seguridad (%)
  vel: 1.2, // velocidad de desplazamiento (m/s)
  tpl: 15, // tiempo por línea de picking (s)
  frioMax: 12, // límite de exposición al frío (min)
  costoH: 10, // costo hora de operario (S/)
  minMej: 10, // mejora mínima para proponer un traslado (m)
  ciclo: 14, // ciclo de reposición (días de demanda a cubrir)
  ltS: 4, // lead time zona Seco (días)
  ltF: 2, // lead time zona Frío (días)
  ltC: 3, // lead time zona Congelado (días)
  vent: 90, // ventana para calcular la demanda (días)
  cv: 0.3, // variabilidad de la demanda
  eri: 98, // meta de exactitud de inventario (%)
  rUb: 50, // reducción de incidencias por ubicaciones erróneas con el módulo 1 (%)
  rEri: 50, // reducción de diferencias en conteos con el módulo 3 (%)
  rRop: 50, // reducción de falta de productos con el módulo 3 (%)
  fotoStock: 0, // día de la foto del Stock_Sistema, formato AAAAMMDD (0 = no restar pedidos)
  corteStock: 0, // restar pedidos hasta este día, AAAAMMDD (0 = todos los cargados)
  frecuenciaConteo: 7 // días entre un conteo físico de stock y el siguiente
};

// Grupos que se muestran en la pantalla Ajustes: [título, [[clave, etiqueta, tipo?], ...]]
const GRUPOS_AJUSTES = [
  [
    'Servicio',
    [
      ['meta', 'Meta contractual OTIF (%)'],
      ['z', 'Nivel de servicio stock de seguridad (%)', 'seleccion']
    ]
  ],
  [
    'Picking',
    [
      ['vel', 'Velocidad de desplazamiento (m/s)'],
      ['tpl', 'Tiempo por línea de picking (s)'],
      ['frioMax', 'Límite de exposición al frío (min)'],
      ['costoH', 'Costo hora de operario (S/)'],
      ['minMej', 'Mejora mínima para proponer un traslado (m)']
    ]
  ],
  [
    'Inventario',
    [
      ['ciclo', 'Ciclo de reposición (días de demanda a cubrir)'],
      ['ltS', 'Lead time zona Seco (días)'],
      ['ltF', 'Lead time zona Refrigerado (días)'],
      ['ltC', 'Lead time zona Congelado (días)'],
      ['vent', 'Ventana para calcular la demanda (días)'],
      ['cv', 'Variabilidad de demanda (CV)'],
      ['eri', 'Meta de exactitud ERI (%)'],
      ['fotoStock', 'Día de la foto del stock (AAAAMMDD)'],
      ['corteStock', 'Restar pedidos hasta el día (AAAAMMDD, 0 = hoy)'],
      ['frecuenciaConteo', 'Frecuencia del conteo físico (días)']
    ]
  ],
  [
    'Reducción de incidencias por módulo (supuesto, %)',
    [
      ['rUb', 'Ubicaciones erróneas con el módulo 1'],
      ['rEri', 'Diferencias en conteos con el módulo 3'],
      ['rRop', 'Falta de productos con el módulo 3']
    ]
  ]
];

Object.defineProperty(__e, 'NIVELES_SERVICIO', { get: () => NIVELES_SERVICIO, enumerable: true });
Object.defineProperty(__e, 'AJUSTES_POR_DEFECTO', { get: () => AJUSTES_POR_DEFECTO, enumerable: true });
Object.defineProperty(__e, 'GRUPOS_AJUSTES', { get: () => GRUPOS_AJUSTES, enumerable: true });
return __e;
})();

// ===== nucleo/estado.js =====
__m["nucleo/estado.js"] = (function () {
const __e = {};
// Estado compartido de la app. Son objetos únicos: se modifican por dentro, nunca se reemplazan.

const { AJUSTES_POR_DEFECTO } = __m["nucleo/ajustes.js"];

// Tablas leídas del Google Sheet (una lista de filas por pestaña).
const datos = {
  inventario: [],
  pedidos: [],
  otif: [],
  causas: [],
  layout: [],
  ubicaciones: [],
  muros: [],
  pasillos: []
};

// Parámetros del modelo (pantalla Ajustes).
const ajustes = { ...AJUSTES_POR_DEFECTO };

// Estado de la conexión con el Sheet.
//   estado: 'sin_enlace' | 'leyendo' | 'ok' (todas las pestañas) | 'parcial' (faltan pestañas) | 'error'
const conexion = {
  enlace: '',
  estado: 'sin_enlace',
  mensaje: '',
  pestanas: [], // resultado de la última lectura, una por pestaña
  ultimaLectura: null
};

// Resultados de los cálculos. Lo rellena recalcular() (js/modelo.js); las pantallas solo lo leen.
const modelo = {
  hay: { inventario: false, pedidos: false, otif: false, causas: false, layout: false }
};

// Lo que el usuario eligió en cada pantalla (pestaña activa, filtros, pedido elegido…).
const ui = {
  ubicaciones: { pestana: 1, filtro: '', ocupacion: 0, filtros: { prioridad: '', cliente: '', zona: '', abc: '' } },
  picking: { pedido: '', metodo: 'zonas', plan: 0, estado: 'pendientes', pagina: 1, buscar: '', filtros: { cliente: '', tienda: '' }, recorridoMaximizado: false },
  inventario: { pestana: 1, filtros: { cuando: '', zona: '', cliente: '', abc: '' }, filtrosDif: { zona: '', cliente: '', abc: '' }, filtroDif: '', semanaConteo: 1, filtroConteo: '', filtroPlan: '' },
  escenarios: { demanda: 0, leadTime: 0, servicio: 0 }
};

Object.defineProperty(__e, 'datos', { get: () => datos, enumerable: true });
Object.defineProperty(__e, 'ajustes', { get: () => ajustes, enumerable: true });
Object.defineProperty(__e, 'conexion', { get: () => conexion, enumerable: true });
Object.defineProperty(__e, 'modelo', { get: () => modelo, enumerable: true });
Object.defineProperty(__e, 'ui', { get: () => ui, enumerable: true });
return __e;
})();

// ===== nucleo/dom.js =====
__m["nucleo/dom.js"] = (function () {
const __e = {};
// Atajos para buscar elementos y conectar eventos.

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

// Al hacer clic en cada elemento que coincide con el selector, ejecuta la función.
function alClick(selector, funcion) {
  $$(selector).forEach(elemento => (elemento.onclick = () => funcion(elemento)));
}

// Cuando cambia el valor del elemento, ejecuta la función con el nuevo valor.
function alCambiar(selector, funcion) {
  const elemento = $(selector);
  if (elemento) elemento.onchange = () => funcion(elemento.value);
}

// Igual que alCambiar, pero para todos los elementos que coinciden (la función recibe el valor y el elemento).
function alCambiarCada(selector, funcion) {
  $$(selector).forEach(elemento => (elemento.onchange = () => funcion(elemento.value, elemento)));
}

Object.defineProperty(__e, '$', { get: () => $, enumerable: true });
Object.defineProperty(__e, '$$', { get: () => $$, enumerable: true });
Object.defineProperty(__e, 'alClick', { get: () => alClick, enumerable: true });
Object.defineProperty(__e, 'alCambiar', { get: () => alCambiar, enumerable: true });
Object.defineProperty(__e, 'alCambiarCada', { get: () => alCambiarCada, enumerable: true });
return __e;
})();

// ===== nucleo/almacenamiento.js =====
__m["nucleo/almacenamiento.js"] = (function () {
const __e = {};
// Lo único que la app guarda en el navegador: el enlace del Sheet y los ajustes.
// Los datos NO se guardan: se vuelven a leer del Sheet cada vez que se abre la app.

const CLAVE = 'axionlog';
const CLAVE_VERSION_ANTERIOR = 'axl'; // la versión anterior guardaba aquí los datos de ejemplo

function leerPreferencias() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || {};
  } catch (e) {
    return {};
  }
}

function guardarPreferencias({ enlace, ajustes }) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ enlace, ajustes }));
  } catch (e) {
    // Sin almacenamiento (modo privado, por ejemplo): la app sigue funcionando sin recordar.
  }
}

function limpiarVersionAnterior() {
  try {
    localStorage.removeItem(CLAVE_VERSION_ANTERIOR);
  } catch (e) {
    // nada que limpiar
  }
}

Object.defineProperty(__e, 'leerPreferencias', { get: () => leerPreferencias, enumerable: true });
Object.defineProperty(__e, 'guardarPreferencias', { get: () => guardarPreferencias, enumerable: true });
Object.defineProperty(__e, 'limpiarVersionAnterior', { get: () => limpiarVersionAnterior, enumerable: true });
return __e;
})();

// ===== nucleo/formato.js =====
__m["nucleo/formato.js"] = (function () {
const __e = {};
// Formatos y conversiones de números, fechas y texto usados en toda la app.

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// 1234.5 → "1,234.5"
const fmt = (numero, decimales = 0) =>
  Number(numero).toLocaleString('es-PE', {
    maximumFractionDigits: decimales,
    minimumFractionDigits: decimales
  });

// 0.923 → "92.3 %"
const pc = (fraccion, decimales = 1) => fmt(fraccion * 100, decimales) + ' %';

const sol = numero => 'S/ ' + fmt(numero);

const sum = (lista, valor = x => x) => lista.reduce((total, x) => total + valor(x), 0);

// 305 segundos → "5 min 05 s"
const mmss = segundos =>
  Math.floor(segundos / 60) + ' min ' + String(Math.round(segundos % 60)).padStart(2, '0') + ' s';

// "Stock_Sistema" → "stocksistema" (para reconocer columnas sin importar tildes ni símbolos)
const normalizar = texto =>
  String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

// Evita que el texto de una celda se interprete como HTML.
const esc = texto =>
  String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Convierte lo que viene de una celda en número. Acepta lo que muestra Google Sheets:
//   "148.50", "148,50", "1,254", "1.254,50", "S/ 1,254.50"
function num(valor) {
  let texto = String(valor ?? '').replace(/[^\d.,-]/g, '');
  if (!texto) return 0;
  const coma = texto.lastIndexOf(',');
  const punto = texto.lastIndexOf('.');
  if (coma >= 0 && punto >= 0) {
    // Cuando hay ambos, el que aparece último es el decimal.
    texto =
      coma > punto ? texto.replace(/\./g, '').replace(',', '.') : texto.replace(/,/g, '');
  } else if (coma >= 0) {
    // "1,254" o "12,345,678" son miles; "148,50" o "0,125" son decimales.
    texto = /^-?[1-9]\d{0,2}(,\d{3})+$/.test(texto)
      ? texto.replace(/,/g, '')
      : texto.replace(',', '.');
  } else if (/^-?\d{1,3}(\.\d{3}){2,}$/.test(texto)) {
    // "1.254.321" son miles con punto.
    texto = texto.replace(/\./g, '');
  }
  const resultado = parseFloat(texto);
  return isNaN(resultado) ? 0 : resultado;
}

// "2026-09-28" o "28/09/2026" (día primero) → milisegundos. NaN si no se entiende.
function aMarcaDeTiempo(texto) {
  const t = String(texto ?? '').trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(t);
  if (m) return Date.UTC(+m[3], +m[2] - 1, +m[1]);
  return NaN;
}

// "2025-01", "01/2025" o "01/01/2025" → "Ene-25". Si no se entiende, devuelve el texto tal cual.
function etiquetaMes(texto) {
  const t = String(texto ?? '').trim();
  let mes, anio;
  let m = /^(\d{4})-(\d{1,2})/.exec(t);
  if (m) {
    anio = m[1];
    mes = +m[2];
  } else if ((m = /^(\d{1,2})[/.-](\d{4})$/.exec(t))) {
    mes = +m[1];
    anio = m[2];
  } else if ((m = /^\d{1,2}[/.-](\d{1,2})[/.-](\d{4})/.exec(t))) {
    mes = +m[1];
    anio = m[2];
  }
  return mes >= 1 && mes <= 12 ? MESES[mes - 1] + '-' + String(anio).slice(2) : t;
}

const ZONAS_CONOCIDAS = {
  seco: 'SECO',
  frio: 'REFRIGERADO',
  camarafria: 'REFRIGERADO',
  refrigerado: 'REFRIGERADO',
  congelado: 'CONGELADO'
};

// "Frío", "frio" o "REFRIGERADO" → "REFRIGERADO"
const normalizarZona = zona =>
  ZONAS_CONOCIDAS[normalizar(zona ?? '')] || String(zona ?? '').toUpperCase();

Object.defineProperty(__e, 'fmt', { get: () => fmt, enumerable: true });
Object.defineProperty(__e, 'pc', { get: () => pc, enumerable: true });
Object.defineProperty(__e, 'sol', { get: () => sol, enumerable: true });
Object.defineProperty(__e, 'sum', { get: () => sum, enumerable: true });
Object.defineProperty(__e, 'mmss', { get: () => mmss, enumerable: true });
Object.defineProperty(__e, 'normalizar', { get: () => normalizar, enumerable: true });
Object.defineProperty(__e, 'esc', { get: () => esc, enumerable: true });
Object.defineProperty(__e, 'num', { get: () => num, enumerable: true });
Object.defineProperty(__e, 'aMarcaDeTiempo', { get: () => aMarcaDeTiempo, enumerable: true });
Object.defineProperty(__e, 'etiquetaMes', { get: () => etiquetaMes, enumerable: true });
Object.defineProperty(__e, 'normalizarZona', { get: () => normalizarZona, enumerable: true });
return __e;
})();

// ===== nucleo/planta.js =====
__m["nucleo/planta.js"] = (function () {
const __e = {};
// Plano de la planta: de aquí salen las distancias y los caminos que usan Ubicaciones, Picking y Escenarios.
//
// El plano viene del asistente «Configurar layout» (que lee la imagen del cliente) y llega a la app
// por tres pestañas del Google Sheet: Layout, Ubicaciones y Muros.
//
// Por dentro, el plano se convierte en una cuadrícula: cada cuadrito está libre (se camina) o
// bloqueado (rack o muro). La distancia entre dos ubicaciones es el camino más corto por los
// cuadritos libres, en línea recta horizontal o vertical como camina una persona entre pasillos.

const { num, normalizar, normalizarZona } = __m["nucleo/formato.js"];

const ZONAS = ['SECO', 'REFRIGERADO', 'CONGELADO'];
const TIPOS_DE_UBICACION = ['picking', 'almacenaje', 'staging', 'pnc', 'otro'];

const SIN_CAMINO = 9999; // metros que se devuelven cuando no hay camino entre dos ubicaciones
const COLOCACION_EN_FRENTE = 12; // hasta cuántos cuadritos se busca el pasillo frente a una ubicación

const mediana = lista => {
  const orden = [...lista].sort((a, b) => a - b);
  return orden.length ? orden[Math.floor(orden.length / 2)] : 0;
};

// --- Convierte las tablas del Sheet en un plano.
// Devuelve null si falta el plano (se necesitan las pestañas Layout y Ubicaciones).
function layoutDesdeTablas({ layout: parametros, ubicaciones, muros, pasillos }) {
  if (!parametros?.length || !ubicaciones?.length) return null;

  const valores = {};
  parametros.forEach(fila => (valores[normalizar(fila.parametro)] = num(fila.valor)));
  const { anchopx, altopx, metrosporpx, muellex, muelley } = valores;
  if (!anchopx || !altopx || !metrosporpx) return null;

  const tipoDe = texto => {
    const t = normalizar(texto);
    return TIPOS_DE_UBICACION.find(x => t.startsWith(x)) || 'otro';
  };

  return {
    ancho: anchopx,
    alto: altopx,
    metrosPorPixel: metrosporpx,
    muelle: { x: muellex ?? 0, y: muelley ?? altopx },
    ubicaciones: ubicaciones.map(u => ({
      id: String(u.ubicacion).trim().toUpperCase(),
      zona: normalizarZona(u.zona),
      tipo: tipoDe(u.tipo),
      x: num(u.x),
      y: num(u.y),
      ancho: num(u.ancho),
      alto: num(u.alto)
    })),
    muros: (muros || []).map(m => ({ x0: num(m.x0), y0: num(m.y0), x1: num(m.x1), y1: num(m.y1) })),
    pasillos: (pasillos || []).map(p => ({ x0: num(p.x0), y0: num(p.y0), x1: num(p.x1), y1: num(p.y1) }))
  };
}

// --- Plano vacío: todavía no hay layout
const plantaVacia = () => ({
  hay: false,
  layout: null,
  nodos: {},
  ubicaciones: [],
  racks: [],
  inaccesibles: [],
  muelle: null,
  distancia: () => 0,
  camino: () => []
});

// --- Construye la cuadrícula y las funciones de distancia a partir de un plano
function construirPlanta(layout) {
  if (!layout || !layout.ubicaciones.length) return plantaVacia();

  const { ancho, alto, metrosPorPixel, muelle } = layout;
  const tamano = mediana(layout.ubicaciones.map(u => Math.min(u.ancho, u.alto))) || 20;
  const celda = Math.max(4, Math.round(tamano / 2)); // lado de cada cuadrito, en píxeles
  const columnas = Math.ceil(ancho / celda);
  const filas = Math.ceil(alto / celda);
  const total = columnas * filas;
  const margenDeRack = Math.ceil(tamano * 0.33) + 1; // el marco del rack sobresale de la celda de color

  // 0 = libre, 1 = rack, 2 = muro
  const mapa = new Uint8Array(total);
  const marcar = (x0, y0, x1, y1, valor, umbral) => {
    const cx0 = Math.max(0, Math.floor(x0 / celda));
    const cx1 = Math.min(columnas - 1, Math.floor((x1 - 0.001) / celda));
    const cy0 = Math.max(0, Math.floor(y0 / celda));
    const cy1 = Math.min(filas - 1, Math.floor((y1 - 0.001) / celda));
    for (let cy = cy0; cy <= cy1; cy++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        const w = Math.min(x1, (cx + 1) * celda) - Math.max(x0, cx * celda);
        const h = Math.min(y1, (cy + 1) * celda) - Math.max(y0, cy * celda);
        if ((w * h) / (celda * celda) >= umbral) mapa[cy * columnas + cx] = valor;
      }
    }
  };
  // Lo que no es muro ni rack se puede caminar: pasillos, puentes, cámaras y puertas (huecos en los muros).
  // Así un pasillo que no se detectó por color nunca deja el recorrido sin camino.

  layout.ubicaciones.forEach(u =>
    marcar(
      u.x - u.ancho / 2 - margenDeRack,
      u.y - u.alto / 2 - margenDeRack,
      u.x + u.ancho / 2 + margenDeRack,
      u.y + u.alto / 2 + margenDeRack,
      1,
      0.5
    )
  );
  layout.muros.forEach(m => marcar(m.x0, m.y0, m.x1, m.y1, 2, 0)); // cualquier muro que toque una celda la bloquea

  const celdaDe = (x, y) => {
    const cx = Math.min(columnas - 1, Math.max(0, Math.floor(x / celda)));
    const cy = Math.min(filas - 1, Math.max(0, Math.floor(y / celda)));
    return cy * columnas + cx;
  };
  const centroDe = indice => ({
    x: ((indice % columnas) + 0.5) * celda,
    y: (Math.floor(indice / columnas) + 0.5) * celda
  });

  // Cuadrito libre más cercano a un punto (búsqueda en anillos crecientes)
  const libreCercano = (x, y) => {
    const inicio = celdaDe(x, y);
    const cx = inicio % columnas;
    const cy = Math.floor(inicio / columnas);
    for (let r = 0; r <= 40; r++) {
      for (let j = -r; j <= r; j++) {
        for (let i = -r; i <= r; i++) {
          if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
          const px = cx + i;
          const py = cy + j;
          if (px < 0 || py < 0 || px >= columnas || py >= filas) continue;
          if (!mapa[py * columnas + px]) return py * columnas + px;
        }
      }
    }
    return -1;
  };

  // --- Dónde se para el picker para atender cada ubicación: el pasillo frente a ella
  const nodos = {};
  const acceso = {}; // id → cuadrito de acceso
  const inaccesibles = [];
  layout.ubicaciones.forEach(u => {
    nodos[u.id] = { id: u.id, zona: u.zona, tipo: u.tipo, x: u.x, y: u.y, ancho: u.ancho, alto: u.alto };

    const enColumna = u.alto >= u.ancho - 2; // las ubicaciones de una columna se atienden de lado
    const lados = enColumna
      ? [[-1, 0], [1, 0]]
      : [[0, -1], [0, 1]];
    const inicio = celdaDe(u.x, u.y);
    let mejor = -1;
    let pasosMejor = Infinity;
    lados.forEach(([dx, dy]) => {
      let cx = inicio % columnas;
      let cy = Math.floor(inicio / columnas);
      for (let paso = 1; paso <= COLOCACION_EN_FRENTE; paso++) {
        cx += dx;
        cy += dy;
        if (cx < 0 || cy < 0 || cx >= columnas || cy >= filas) return;
        const valor = mapa[cy * columnas + cx];
        if (valor === 2) return; // un muro: ese lado no sirve
        if (valor === 0) {
          if (paso < pasosMejor) {
            pasosMejor = paso;
            mejor = cy * columnas + cx;
          }
          return;
        }
      }
    });
    if (mejor < 0) mejor = libreCercano(u.x, u.y);
    acceso[u.id] = mejor;
  });

  // --- Muelle
  const indiceMuelle = libreCercano(muelle.x, muelle.y);
  const centroMuelle = indiceMuelle >= 0 ? centroDe(indiceMuelle) : { x: muelle.x, y: muelle.y };
  nodos.DOCK = { id: 'DOCK', zona: 'DOCK', tipo: 'muelle', x: muelle.x, y: muelle.y };
  acceso.DOCK = indiceMuelle;

  // --- Distancias: se calcula, por origen, cuántos cuadritos hay hasta todos los demás (y se guarda)
  const campos = new Map();
  const cola = new Int32Array(total);
  const campoDesde = id => {
    if (campos.has(id)) return campos.get(id);
    const campo = new Int16Array(total).fill(-1);
    const origen = acceso[id];
    if (origen >= 0) {
      let ini = 0;
      let fin = 0;
      campo[origen] = 0;
      cola[fin++] = origen;
      while (ini < fin) {
        const p = cola[ini++];
        const d = campo[p] + 1;
        const x = p % columnas;
        if (x > 0 && !mapa[p - 1] && campo[p - 1] < 0) (campo[p - 1] = d), (cola[fin++] = p - 1);
        if (x < columnas - 1 && !mapa[p + 1] && campo[p + 1] < 0) (campo[p + 1] = d), (cola[fin++] = p + 1);
        if (p >= columnas && !mapa[p - columnas] && campo[p - columnas] < 0) (campo[p - columnas] = d), (cola[fin++] = p - columnas);
        if (p < total - columnas && !mapa[p + columnas] && campo[p + columnas] < 0) (campo[p + columnas] = d), (cola[fin++] = p + columnas);
      }
    }
    campos.set(id, campo);
    return campo;
  };

  const metrosPorCuadrito = celda * metrosPorPixel;

  // Metros entre dos ubicaciones (o el muelle). 0 si alguna no existe.
  const distancia = (a, b) => {
    if (a === b || !nodos[a] || !nodos[b]) return 0;
    // Las distancias desde el muelle se calculan siempre desde el muelle: una sola búsqueda sirve para todas
    const origen = b === 'DOCK' ? b : a === 'DOCK' ? a : b;
    const destino = origen === a ? b : a;
    const pasos = campoDesde(origen)[acceso[destino]];
    return pasos == null || pasos < 0 ? SIN_CAMINO : pasos * metrosPorCuadrito;
  };

  // Puntos {x, y} (en píxeles del plano) por los que se pasa para ir de a hasta b.
  const camino = (a, b) => {
    if (!nodos[a] || !nodos[b]) return [];
    const inicio = { x: nodos[a].x, y: nodos[a].y };
    const fin = { x: nodos[b].x, y: nodos[b].y };
    if (a === b) return [inicio];
    const campo = campoDesde(b);
    let actual = acceso[a];
    if (actual < 0 || campo[actual] < 0) return [inicio, fin];

    const puntos = [inicio];
    let ultimoPaso = null;
    const empujar = punto => {
      const n = puntos.length;
      // se descartan los puntos intermedios de un tramo recto
      if (n >= 2) {
        const p = puntos[n - 1];
        const q = puntos[n - 2];
        if ((p.x === q.x && p.x === punto.x) || (p.y === q.y && p.y === punto.y)) puntos.pop();
      }
      puntos.push(punto);
    };
    empujar(centroDe(actual));
    while (campo[actual] > 0) {
      const opciones = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        .map(([dx, dy]) => {
          const cx = (actual % columnas) + dx;
          const cy = Math.floor(actual / columnas) + dy;
          if (cx < 0 || cy < 0 || cx >= columnas || cy >= filas) return null;
          const vecino = cy * columnas + cx;
          return campo[vecino] === campo[actual] - 1 ? { vecino, dx, dy } : null;
        })
        .filter(Boolean);
      if (!opciones.length) break;
      // se prefiere seguir derecho para que el camino tenga pocas curvas
      const elegido =
        opciones.find(o => ultimoPaso && o.dx === ultimoPaso[0] && o.dy === ultimoPaso[1]) || opciones[0];
      ultimoPaso = [elegido.dx, elegido.dy];
      actual = elegido.vecino;
      empujar(centroDe(actual));
    }
    puntos.push(fin);
    return puntos;
  };

  // Ubicaciones a las que no se puede llegar desde el muelle
  const campoMuelle = campoDesde('DOCK');
  layout.ubicaciones.forEach(u => {
    if (acceso[u.id] < 0 || campoMuelle[acceso[u.id]] < 0) inaccesibles.push(u.id);
  });

  // Las ubicaciones de picking son las candidatas del slotting; si el plano no tiene ninguna, se usan todas
  const ubicaciones = layout.ubicaciones.map(u => nodos[u.id]);
  const racks = ubicaciones.filter(u => u.tipo === 'picking');

  return {
    hay: true,
    layout,
    nodos,
    ubicaciones,
    racks: racks.length ? racks : ubicaciones,
    inaccesibles,
    muelle: { ...nodos.DOCK, ...centroMuelle },
    celda,
    distancia,
    camino
  };
}

// Plano en uso. Es un único objeto compartido: cargarPlanta lo reemplaza por dentro.
const planta = plantaVacia();

function cargarPlanta(layout) {
  Object.keys(planta).forEach(clave => delete planta[clave]);
  Object.assign(planta, construirPlanta(layout));
}

Object.defineProperty(__e, 'ZONAS', { get: () => ZONAS, enumerable: true });
Object.defineProperty(__e, 'SIN_CAMINO', { get: () => SIN_CAMINO, enumerable: true });
Object.defineProperty(__e, 'TIPOS_DE_UBICACION', { get: () => TIPOS_DE_UBICACION, enumerable: true });
Object.defineProperty(__e, 'layoutDesdeTablas', { get: () => layoutDesdeTablas, enumerable: true });
Object.defineProperty(__e, 'plantaVacia', { get: () => plantaVacia, enumerable: true });
Object.defineProperty(__e, 'construirPlanta', { get: () => construirPlanta, enumerable: true });
Object.defineProperty(__e, 'planta', { get: () => planta, enumerable: true });
Object.defineProperty(__e, 'cargarPlanta', { get: () => cargarPlanta, enumerable: true });
return __e;
})();

// ===== nucleo/catalogo.js =====
__m["nucleo/catalogo.js"] = (function () {
const __e = {};
// Catálogo: une inventario y pedidos para saber, de cada SKU, cuánto se pide y qué tan seguido.
// Lo usan casi todos los módulos.

const { num, sum, aMarcaDeTiempo, normalizarZona } = __m["nucleo/formato.js"];
const { planta } = __m["nucleo/planta.js"];

function construirCatalogo(datos, ajustes) {
  const { inventario, pedidos } = datos;
  const leadTimePorZona = { SECO: ajustes.ltS, REFRIGERADO: ajustes.ltF, CONGELADO: ajustes.ltC };

  // --- Demanda y frecuencia dentro de la ventana de cálculo (los últimos N días de pedidos)
  const marcas = pedidos.map(p => aMarcaDeTiempo(p.fecha));
  let ultimaFecha = -Infinity;
  marcas.forEach(m => {
    if (m > ultimaFecha) ultimaFecha = m;
  });
  if (ultimaFecha === -Infinity) ultimaFecha = Date.now();
  const desde = ultimaFecha - ajustes.vent * 864e5;

  // Pedidos posteriores a la foto del stock (día AAAAMMDD) y hasta el corte, ambos incluidos.
  // Foto 0 = el stock ya está actualizado y no se resta nada.
  const cargados = {};
  // Un pedido resta stock el día de su despacho (su Fecha). Sin corte, el corte es hoy:
  // los pedidos con fecha futura no restan hasta que llegue ese día.
  const hoyAAAAMMDD = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const corte = ajustes.corteStock || hoyAAAAMMDD;
  pedidos.forEach(p => {
    const dia = Number(String(p.fecha || '').slice(0, 10).replace(/-/g, '')) || 0;
    const enFoto = ajustes.fotoStock && dia >= ajustes.fotoStock;
    const enCorte = dia <= corte;
    if (enFoto && enCorte) cargados[p.sku] = (cargados[p.sku] || 0) + num(p.cantidad);
  });

  const demanda = {}; // unidades pedidas por SKU
  const frecuencia = {}; // líneas de pedido por SKU
  pedidos.forEach((p, i) => {
    if (marcas[i] >= desde) {
      demanda[p.sku] = (demanda[p.sku] || 0) + num(p.cantidad);
      frecuencia[p.sku] = (frecuencia[p.sku] || 0) + 1;
    }
  });

  // --- Pedidos: se agrupan las líneas de cada pedido y se ordenan del más reciente al más antiguo
  const agrupados = new Map();
  pedidos.forEach((p, i) => {
    if (!agrupados.has(p.pedidoid)) {
      agrupados.set(p.pedidoid, {
        id: p.pedidoid,
        cliente: p.cliente,
        tienda: p.tienda,
        fecha: p.fecha,
        marca: marcas[i],
        // Fecha entrega (NaN si la pestaña no la trae o la celda está vacía)
        marcaEntrega: aMarcaDeTiempo(p.fechaentrega),
        lineas: []
      });
    }
    agrupados.get(p.pedidoid).lineas.push(p);
  });
  const listaPedidos = [...agrupados.values()].sort((a, b) => (b.marca || 0) - (a.marca || 0));

  // --- SKUs
  const skus = inventario.map(s => {
    const sku = {
      sku: s.sku,
      descripcion: s.descripcion,
      cliente: s.cliente,
      um: s.um,
      costo: num(s.costounitario),
      stockSistema: num(s.stocksistema),
      // null = ese SKU no tiene conteo físico (no entra al cálculo del ERI)
      stockFisico: s.stockfisico === undefined || s.stockfisico === '' ? null : num(s.stockfisico),
      // Un SKU puede listar varios racks ("SA-2, SA-1"): se usa el primero que exista en el plano
      rack: (() => { const lista = String(s.rack ?? '').toUpperCase().split(/[,;]/).map(x => x.trim()).filter(Boolean); return lista.find(r => planta.nodos[r]) || lista[0] || ''; })(),
      zona: normalizarZona(s.zona),
      volumen: num(s.volumenm3) || 0.005,
      demandaDiaria: (demanda[s.sku] || 0) / ajustes.vent,
      frecuencia: frecuencia[s.sku] || 0,
      pedidosCargados: cargados[s.sku] || 0,
      // Stock real de hoy: stock del Excel menos los pedidos ya cargados (puede quedar negativo)
      // Tamaño de lote de la pestaña Inventario: las compras se redondean a múltiplos de este número
      lote: num(s.tamanolote) || 1,
      stockActual: Math.max(0, num(s.stocksistema) - (cargados[s.sku] || 0))
    };
    sku.leadTime = leadTimePorZona[sku.zona] || 3;
    return sku;
  });

  // --- Clasificación ABC: A suma el 80 % de los pedidos, B hasta el 95 %, C el resto
  const totalFrecuencia = sum(skus, s => s.frecuencia) || 1;
  let acumulado = 0;
  [...skus]
    .sort((a, b) => b.frecuencia - a.frecuencia)
    .forEach(s => {
      const anterior = acumulado / totalFrecuencia;
      acumulado += s.frecuencia;
      s.abc = anterior < 0.8 ? 'A' : anterior < 0.95 ? 'B' : 'C';
    });

  return {
    skus,
    porSku: Object.fromEntries(skus.map(s => [s.sku, s])),
    pedidos: listaPedidos,
    nPedidos: listaPedidos.length,
    nLineas: pedidos.length
  };
}

Object.defineProperty(__e, 'construirCatalogo', { get: () => construirCatalogo, enumerable: true });
return __e;
})();

// ===== modulos/inventario/calculo.js =====
__m["modulos/inventario/calculo.js"] = (function () {
const __e = {};
// Inventario y compras: exactitud del inventario (ERI), punto de reorden y stock de seguridad.

const { sum } = __m["nucleo/formato.js"];
const { NIVELES_SERVICIO } = __m["nucleo/ajustes.js"];

function calcularInventario(catalogo, ajustes) {
  const { skus } = catalogo;

  // Reposición de cada SKU. Es una función porque el simulador de Escenarios la vuelve a
  // calcular con otra demanda, otro retraso de lead time u otro nivel de servicio.
  const reposicion = (zServicio, variacionDemanda = 0, retrasoLeadTime = 0) =>
    skus.map(s => {
      const demanda = s.demandaDiaria * (1 + variacionDemanda);
      const leadTime = s.leadTime + retrasoLeadTime;
      const stockSeguridad = zServicio * ajustes.cv * demanda * Math.sqrt(leadTime);
      const puntoReorden = demanda * leadTime + stockSeguridad;
      const necesario = Math.max(
        0,
        demanda * (leadTime + ajustes.ciclo) + stockSeguridad - s.stockActual
      );
      return {
        ...s,
        stockSeguridad,
        puntoReorden,
        cobertura: demanda ? Math.max(0, s.stockActual) / demanda : 999, // días de stock
        cantidadPedir: necesario ? Math.ceil(necesario / s.lote) * s.lote : 0,
        inversion: (necesario ? Math.ceil(necesario / s.lote) * s.lote : 0) * s.costo,
        estado:
          s.stockActual <= puntoReorden
            ? 'PEDIR'
            : s.stockActual <= puntoReorden * 1.3
              ? 'PRONTO'
              : s.stockActual <= puntoReorden * 2
                ? 'PROXIMO'
                : 'OK'
      };
    });

  const filas = reposicion(NIVELES_SERVICIO[ajustes.z] || 1.645);

  // --- Exactitud del registro de inventario (ERI): SKUs donde el sistema coincide con el conteo físico
  const tieneDiferencia = s => s.stockFisico !== null && s.stockSistema !== s.stockFisico;
  const contados = skus.filter(s => s.stockFisico !== null).length;
  const diferencias = skus.filter(tieneDiferencia);
  const valorDiferencia = s => Math.abs(s.stockSistema - s.stockFisico) * s.costo;
  const valorInventario = sum(skus, s => s.stockSistema * s.costo);
  const faltantes = diferencias.filter(s => s.stockFisico < s.stockSistema).length;

  // Conteo cíclico: primero los SKUs con diferencia y luego los de alta rotación (A) sin diferencia
  const conteoSemanal = [
    ...[...diferencias]
      .sort((a, b) => valorDiferencia(b) - valorDiferencia(a))
      .map(s => ({ ...s, motivo: 'Stock no cuadra' })),
    ...skus
      .filter(s => s.abc === 'A' && !tieneDiferencia(s))
      .map(s => ({ ...s, motivo: 'Alta rotación' }))
  ];

  return {
    reposicion,
    filas,
    pedir: filas.filter(s => s.estado === 'PEDIR'),
    pronto: filas.filter(s => s.estado === 'PRONTO').length,
    contados,
    diferencias,
    eri: contados ? 1 - diferencias.length / contados : 0,
    eriValorizado: 1 - sum(diferencias, valorDiferencia) / (valorInventario || 1),
    valorDiferenciaAbsoluta: sum(diferencias, valorDiferencia),
    faltantes,
    sobrantes: diferencias.length - faltantes,
    diferenciaNeta: sum(diferencias, s => (s.stockFisico - s.stockSistema) * s.costo),
    valorInventario,
    conteoSemanal
  };
}

Object.defineProperty(__e, 'calcularInventario', { get: () => calcularInventario, enumerable: true });
return __e;
})();

// ===== modulos/diagnostico/calculo.js =====
__m["modulos/diagnostico/calculo.js"] = (function () {
const __e = {};
// Diagnóstico OTIF: evolución mensual, relación entre incidencias y OTIF, y causas (Pareto).

const { num, sum, etiquetaMes, normalizar } = __m["nucleo/formato.js"];

function calcularOtif(datos, ajustes) {
  // --- Un registro por mes
  const meses = datos.otif.map(fila => {
    const total = num(fila.pedidostotal);
    const cumplidos = num(fila.pedidosotif);
    return {
      mes: etiquetaMes(fila.mes),
      otif: total ? (cumplidos / total) * 100 : 0,
      total, // pedidos del mes
      cumplidos, // pedidos a tiempo y completos
      cajasEntregadas: num(fila.cajasentregadas),
      cajasPedidas: num(fila.cajaspedidas),
      incidencias: fila.incidencias === undefined || fila.incidencias === '' ? null : num(fila.incidencias),
      parcial: total < 100 // un mes con muy pocos pedidos no entra en promedios ni en la regresión
    };
  });
  const completos = meses.filter(m => !m.parcial);

  const promedio = completos.length ? sum(completos, m => m.otif) / completos.length : 0;
  const bajoMeta = completos.filter(m => m.otif < ajustes.meta).length;

  // --- Regresión lineal: OTIF = intercepto + pendiente × incidencias del mes
  const puntos = completos.filter(m => m.incidencias != null);
  let pendiente = -0.17;
  let intercepto = 100;
  let r2 = 0;
  let incidenciasPromedio = 0;
  if (puntos.length > 2) {
    const n = puntos.length;
    const mediaIncidencias = sum(puntos, m => m.incidencias) / n;
    const mediaOtif = sum(puntos, m => m.otif) / n;
    const sxy = sum(puntos, m => (m.incidencias - mediaIncidencias) * (m.otif - mediaOtif));
    const sxx = sum(puntos, m => (m.incidencias - mediaIncidencias) ** 2);
    const syy = sum(puntos, m => (m.otif - mediaOtif) ** 2);
    pendiente = sxy / sxx;
    intercepto = mediaOtif - pendiente * mediaIncidencias;
    r2 = (sxy * sxy) / (sxx * syy || 1);
    incidenciasPromedio = mediaIncidencias;
  }

  // --- Causas de las incidencias
  const lista = datos.causas;
  const totalCausas = sum(lista, c => num(c.frecuencia)) || 1;
  const porEtapa = {};
  lista.forEach(c => (porEtapa[c.etapa] = (porEtapa[c.etapa] || 0) + num(c.frecuencia)));
  let acumulado = 0;
  const acumulados = lista.map(c => (acumulado += num(c.frecuencia)) / totalCausas);

  return {
    meses,
    completos,
    promedio,
    bajoMeta,
    puntos,
    regresion: { pendiente, intercepto, r2, incidenciasPromedio },
    inFull: sum(completos, m => m.cajasEntregadas) / (sum(completos, m => m.cajasPedidas) || 1),
    pedidosFuera: sum(completos, m => m.total - m.cumplidos),
    pedidosTotales: sum(completos, m => m.total),
    causas: { lista, total: totalCausas, porEtapa, acumulados }
  };
}

// Qué parte de las incidencias corresponde a una causa (busca por parte del nombre).
// participacionDeCausa(causas, 'ubicacion') → 0.311 si «Ubicaciones erróneas» pesa 31.1 %
function participacionDeCausa(causas, fragmento) {
  const causa = causas.lista.find(c => normalizar(c.causa).includes(fragmento));
  return causa ? num(causa.frecuencia) / causas.total : 0;
}

// Causas que atacan los módulos de la app (se pintan en verde en el Pareto).
const esCausaQueAtacaUnModulo = nombre =>
  /ubicacion|diferencia|faltadeprod/.test(normalizar(nombre));

Object.defineProperty(__e, 'calcularOtif', { get: () => calcularOtif, enumerable: true });
Object.defineProperty(__e, 'participacionDeCausa', { get: () => participacionDeCausa, enumerable: true });
Object.defineProperty(__e, 'esCausaQueAtacaUnModulo', { get: () => esCausaQueAtacaUnModulo, enumerable: true });
return __e;
})();

// ===== modulos/ubicaciones/calculo.js =====
__m["modulos/ubicaciones/calculo.js"] = (function () {
const __e = {};
// Ubicaciones (slotting): propone en qué rack debe ir cada producto.
//   - Cada producto se mantiene en su cámara (seco, refrigerado o congelado).
//   - Dentro de la cámara, los de menor COI (volumen ÷ frecuencia de pedido) van más cerca del muelle.

const { sum } = __m["nucleo/formato.js"];
const { ZONAS, SIN_CAMINO } = __m["nucleo/planta.js"];

const PESO_PRIORIDAD = { Crítica: 0, Alta: 1, Media: 2 };

function calcularUbicaciones(catalogo, ajustes, planta) {
  const { skus } = catalogo;
  const racks = planta.racks;
  const alMuelle = rack => planta.distancia('DOCK', rack);
  const enPlano = id => !!planta.nodos[id];
  // Un rack cuenta solo si existe en el plano y hay camino desde el muelle
  const alcanzable = id => enPlano(id) && alMuelle(id) < SIN_CAMINO;
  const volumenDe = s => s.volumen * s.stockSistema;
  // Rotación: menor volumen por unidad de frecuencia = más rotado (va más cerca del muelle)
  const coi = x => x.volumen / (x.frecuencia || 0.1);

  // Capacidad de cada rack: el volumen de SU zona repartido entre los racks con camino de esa zona, con 55 % de llenado
  const volumenPorZona = {};
  skus.forEach(s => (volumenPorZona[s.zona] = (volumenPorZona[s.zona] || 0) + volumenDe(s)));
  const racksDeZona = zona => racks.filter(r => r.zona === zona && alcanzable(r.id));
  const capacidad = {};
  racks.forEach(r => {
    const n = racksDeZona(r.zona).length || 1;
    capacidad[r.id] = (volumenPorZona[r.zona] || 0) / n / 0.55;
  });

  // Qué tan lleno queda cada rack con una asignación { sku: rack }
  const ocupacion = asignacion => {
    const ocupado = {};
    racks.forEach(r => (ocupado[r.id] = 0));
    skus.forEach(s => {
      if (ocupado[asignacion[s.sku]] != null) ocupado[asignacion[s.sku]] += volumenDe(s);
    });
    for (const rack in ocupado) ocupado[rack] /= capacidad[rack];
    return ocupado;
  };

  // --- Rack ideal de cada SKU (solo racks alcanzables de su zona, los más cercanos al muelle primero)
  const usado = {};
  racks.forEach(r => (usado[r.id] = 0));
  const ideal = {};
  ZONAS.forEach(zona => {
    const lista = racksDeZona(zona).sort((a, b) => alMuelle(a.id) - alMuelle(b.id));
    if (!lista.length) return;
    skus
      .filter(s => s.zona === zona)
      .sort((a, b) => a.volumen / (a.frecuencia || 0.1) - b.volumen / (b.frecuencia || 0.1))
      .forEach(s => {
        const volumen = volumenDe(s);
        const rack =
          lista.find(r => usado[r.id] + volumen <= capacidad[r.id]) ||
          lista.reduce((menos, r) => (usado[r.id] < usado[menos.id] ? r : menos));
        usado[rack.id] += volumen;
        ideal[s.sku] = rack.id;
      });
  });

  // Motivo corto según la clase ABC (A = más rotación)
  const ROTACION = { A: 'Alta rotación', B: 'Media rotación', C: 'Baja rotación' };

  // --- Traslados. El volumen que ocupa cada rack parte de la situación real de hoy y solo se mueve
  // un SKU si el rack destino tiene lugar en ese momento: así el plan nunca aumenta la saturación.
  const ocupadoHoy = {};
  racks.forEach(r => (ocupadoHoy[r.id] = 0));
  skus.forEach(s => {
    if (ocupadoHoy[s.rack] != null) ocupadoHoy[s.rack] += volumenDe(s);
  });
  const actual = {};
  skus.forEach(s => (actual[s.sku] = s.rack));
  const propuesta = {};
  const traslados = [];
  const bloqueados = []; // traslados que no caben en el rack destino
  const sinRack = []; // SKU cuyo Rack no existe en el plano
  const rackVacio = []; // SKU sin Rack en el Inventario
  const sinZonaConRacks = []; // SKU cuya zona no tiene racks alcanzables
  const zonaDesconocida = []; // SKU con una zona que la app no reconoce
  const sinCamino = []; // SKU en un rack sin camino desde el muelle
  let ahorro = 0;

  skus.forEach(s => {
    propuesta[s.sku] = s.rack;
    if (!s.rack) rackVacio.push(s.sku);
    else if (!enPlano(s.rack)) sinRack.push(s.sku);
    if (!ZONAS.includes(s.zona)) return zonaDesconocida.push(s.sku);

    const rackIdeal = ideal[s.sku];
    if (!rackIdeal) return sinZonaConRacks.push(s.sku);
    if (!enPlano(s.rack)) return;
    if (!alcanzable(s.rack)) return sinCamino.push(s.sku);
    if (rackIdeal === s.rack) return;

    const fueraDeCamara = planta.nodos[s.rack].zona !== s.zona;
    const mejora = alMuelle(s.rack) - alMuelle(rackIdeal);
    if (!(fueraDeCamara || mejora >= ajustes.minMej)) return;

    const volumen = volumenDe(s);
    // Si el rack ideal ya está lleno hoy, se usa el más cercano al muelle de la misma cámara que sí tenga lugar
    const destino = [rackIdeal, ...racksDeZona(s.zona).sort((a, b) => alMuelle(a.id) - alMuelle(b.id)).map(r => r.id)].find(
      id =>
        id !== s.rack &&
        ocupadoHoy[id] + volumen <= capacidad[id] &&
        (fueraDeCamara || alMuelle(s.rack) - alMuelle(id) >= ajustes.minMej)
    );
    if (!destino) {
      bloqueados.push({ s, volumen });
      return;
    }
    const mejoraDestino = alMuelle(s.rack) - alMuelle(destino);
    ocupadoHoy[destino] += volumen;
    ocupadoHoy[s.rack] -= volumen;
    propuesta[s.sku] = destino;

    const ahorroSemanal = (s.frecuencia / ajustes.vent) * 7 * 2 * Math.max(mejoraDestino, 0);
    ahorro += ahorroSemanal;
    traslados.push({
      ...s,
      rackPropuesto: destino,
      mejora: mejoraDestino,
      riesgoTermico: fueraDeCamara,
      ahorroSemanal,
      prioridad: fueraDeCamara ? 'Crítica' : s.abc === 'A' ? 'Alta' : 'Media',
      motivo: fueraDeCamara ? 'Fuera de cámara' : ROTACION[s.abc]
    });
  });

  // Intercambios: si el rack mejor ubicado de la cámara está lleno, el SKU bloqueado entra y sale el de
  // menor rotación que está ahí (es decir, mayor volumen por frecuencia), que pasa al lugar que deja libre.
  // Solo se hace si ningún rack queda por encima de su capacidad.
  const cambiados = new Set(traslados.map(t => t.sku));
  bloqueados.forEach(({ s, volumen }) => {
    if (cambiados.has(s.sku) || !enPlano(s.rack) || planta.nodos[s.rack].zona !== s.zona) return;
    const candidatos = racksDeZona(s.zona)
      .filter(r => r.id !== s.rack && alMuelle(s.rack) - alMuelle(r.id) >= ajustes.minMej)
      .sort((a, b) => alMuelle(a.id) - alMuelle(b.id));
    for (const D of candidatos) {
      const t = skus
        .filter(x => propuesta[x.sku] === D.id && x.zona === s.zona && x.sku !== s.sku && !cambiados.has(x.sku))
        .filter(x => coi(x) >= coi(s))
        .sort((a, b) => coi(b) - coi(a))[0];
      if (!t) continue;
      const volT = volumenDe(t);
      const sinExceso =
        (volumen <= volT || ocupadoHoy[D.id] + volumen - volT <= capacidad[D.id]) &&
        (volT <= volumen || ocupadoHoy[s.rack] + volT - volumen <= capacidad[s.rack]);
      if (!sinExceso) continue;

      ocupadoHoy[D.id] += volumen - volT;
      ocupadoHoy[s.rack] += volT - volumen;
      propuesta[s.sku] = D.id;
      propuesta[t.sku] = s.rack;
      cambiados.add(s.sku);
      cambiados.add(t.sku);

      const mejoraS = alMuelle(s.rack) - alMuelle(D.id);
      const mejoraT = alMuelle(D.id) - alMuelle(s.rack); // negativa: el SKU que cede pierde metros
      const ahorroS = (s.frecuencia / ajustes.vent) * 7 * 2 * mejoraS;
      const ahorroT = (t.frecuencia / ajustes.vent) * 7 * 2 * mejoraT;
      ahorro += ahorroS + ahorroT;
      traslados.push({
        ...s,
        rackPropuesto: D.id,
        mejora: mejoraS,
        riesgoTermico: false,
        ahorroSemanal: ahorroS,
        prioridad: s.abc === 'A' ? 'Alta' : 'Media',
        motivo: ROTACION[s.abc]
      });
      traslados.push({
        ...t,
        rackPropuesto: s.rack,
        mejora: mejoraT,
        riesgoTermico: false,
        ahorroSemanal: ahorroT,
        prioridad: 'Media',
        motivo: 'Cede su lugar'
      });
      return;
    }
  });

  traslados.sort(
    (a, b) =>
      PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad] ||
      b.ahorroSemanal - a.ahorroSemanal
  );

  const ocupacionActual = ocupacion(actual);
  const ocupacionPropuesta = ocupacion(propuesta);
  const saturados = ocupado => Object.values(ocupado).filter(x => x > 1).length;

  const zonasSinRacks = ZONAS.filter(z => !racksDeZona(z).length);
  return {
    traslados,
    ahorro, // metros de recorrido por semana si se aplican todos los traslados
    riesgoTermico: traslados.filter(t => t.riesgoTermico).length,
    sinUbicacion: sinRack.length + rackVacio.length,
    actual, // { sku: rack } hoy
    propuesta, // { sku: rack } con el plan aplicado
    ocupacionActual,
    ocupacionPropuesta,
    saturadosActual: saturados(ocupacionActual),
    saturadosPropuesta: saturados(ocupacionPropuesta),
    // Avisos para explicar por qué un SKU o un traslado no aparece
    avisos: {
      rackVacio: rackVacio.length,
      sinRack: sinRack.length,
      zonasSinRacks,
      sinZonaConRacks: sinZonaConRacks.length,
      zonaDesconocida: zonaDesconocida.length,
      sinCamino: sinCamino.length,
      bloqueados: bloqueados.filter(b => !cambiados.has(b.s.sku)).length
    }
  };
}

Object.defineProperty(__e, 'calcularUbicaciones', { get: () => calcularUbicaciones, enumerable: true });
return __e;
})();

// ===== modulos/picking/calculo.js =====
__m["modulos/picking/calculo.js"] = (function () {
const __e = {};
// Picking: calcula el recorrido del picker para armar un pedido.
// Siempre respeta la cadena de frío: muelle → seco → refrigerado → congelado → muelle.

const { ZONAS } = __m["nucleo/planta.js"];

const METODOS = {
  lista: 'Lista impresa (orden por código de SKU)',
  vecino: 'Vecino más cercano (sobre el grafo)',
  zonas: 'Óptimo por zonas (cadena de frío)'
};

// Todas las formas de ordenar una lista.
function permutaciones(lista) {
  if (lista.length < 2) return [lista];
  return lista.flatMap((x, i) =>
    permutaciones([...lista.slice(0, i), ...lista.slice(i + 1)]).map(p => [x, ...p])
  );
}

// Orden de visita por zonas, en el orden de la cadena de frío (seco → refrigerado → congelado).
// Dentro de cada zona se prueban todos los órdenes posibles (hasta 7 ubicaciones) y se elige el más corto.
function paradasPorZonas(racks, planta) {
  const { nodos, distancia } = planta;
  const largo = secuencia => {
    let metros = 0;
    for (let i = 1; i < secuencia.length; i++) metros += distancia(secuencia[i - 1], secuencia[i]);
    return metros;
  };
  const paradas = [];
  let actual = 'DOCK';
  ZONAS.forEach(zona => {
    const grupo = racks.filter(r => nodos[r].zona === zona);
    if (!grupo.length) return;
    const ordenes =
      grupo.length <= 7
        ? permutaciones(grupo)
        : [grupo.sort((a, b) => distancia(actual, a) - distancia(actual, b))];
    let mejor = null;
    let mejorLargo = 1e9;
    ordenes.forEach(orden => {
      const metros = largo([actual, ...orden]);
      if (metros < mejorLargo) {
        mejorLargo = metros;
        mejor = orden;
      }
    });
    paradas.push(...mejor);
    actual = mejor[mejor.length - 1];
  });
  return paradas;
}

// Calcula la ruta de un pedido.
//   metodo:       'lista' | 'vecino' | 'zonas'
//   ubicaciones:  { sku: rack } que se usa (las actuales o las del plan aplicado)
//   contexto:     { porSku, planta, ajustes }
function calcularRuta(pedido, metodo, ubicaciones, { porSku, planta, ajustes }) {
  const { nodos, distancia } = planta;
  const largo = secuencia => {
    let metros = 0;
    for (let i = 1; i < secuencia.length; i++) metros += distancia(secuencia[i - 1], secuencia[i]);
    return metros;
  };

  const lineas = pedido.lineas.filter(
    l => porSku[l.sku] && ubicaciones[l.sku] && nodos[ubicaciones[l.sku]]
  );
  const racks = [...new Set(lineas.map(l => ubicaciones[l.sku]))];

  let paradas;
  if (metodo === 'lista') {
    // Se visita en el orden de la lista impresa (por código de SKU)
    paradas = [];
    [...lineas]
      .sort((a, b) => a.sku.localeCompare(b.sku))
      .forEach(l => {
        if (!paradas.includes(ubicaciones[l.sku])) paradas.push(ubicaciones[l.sku]);
      });
  } else if (metodo === 'vecino') {
    // Siempre se va al rack pendiente más cercano
    paradas = [];
    let actual = 'DOCK';
    const pendientes = [...racks];
    while (pendientes.length) {
      pendientes.sort((a, b) => distancia(actual, a) - distancia(actual, b));
      actual = pendientes.shift();
      paradas.push(actual);
    }
  } else {
    paradas = paradasPorZonas(racks, planta);
  }

  const recorrido = ['DOCK', ...paradas, 'DOCK'];
  const metros = largo(recorrido);
  const tiempo = metros / ajustes.vel + lineas.length * ajustes.tpl;

  // Exposición al frío: tiempo desde que entra a la primera cámara fría hasta que sale de la última
  const posicionesFrias = paradas
    .map((rack, i) => (nodos[rack].zona !== 'SECO' ? i : -1))
    .filter(i => i >= 0);
  let exposicionFrio = 0;
  if (posicionesFrias.length) {
    const desde = posicionesFrias[0] + 1;
    const hasta = posicionesFrias[posicionesFrias.length - 1] + 1;
    exposicionFrio =
      largo(recorrido.slice(desde, hasta + 1)) / ajustes.vel +
      lineas.filter(l => nodos[ubicaciones[l.sku]].zona !== 'SECO').length * ajustes.tpl;
  }

  // Hoja de picking: [paso, rack, zona, sku, producto, cantidad]
  const hoja = [];
  paradas.forEach((rack, i) =>
    lineas
      .filter(l => ubicaciones[l.sku] === rack)
      .forEach(l =>
        hoja.push([i + 1, rack, nodos[rack].zona, l.sku, porSku[l.sku].descripcion, l.cantidad, porSku[l.sku].um])
      )
  );

  return { paradas, recorrido, distancia: metros, tiempo, exposicionFrio, hoja, nLineas: lineas.length };
}

Object.defineProperty(__e, 'METODOS', { get: () => METODOS, enumerable: true });
Object.defineProperty(__e, 'paradasPorZonas', { get: () => paradasPorZonas, enumerable: true });
Object.defineProperty(__e, 'calcularRuta', { get: () => calcularRuta, enumerable: true });
return __e;
})();

// ===== modulos/escenarios/calculo.js =====
__m["modulos/escenarios/calculo.js"] = (function () {
const __e = {};
// Escenarios: compara la situación actual (As-Is) con la propuesta (To-Be) y simula «¿qué pasa si…?».
// Usa los cálculos de los otros módulos: rutas (Picking), reposición (Inventario) y causas (Diagnóstico).

const { sum } = __m["nucleo/formato.js"];
const { NIVELES_SERVICIO } = __m["nucleo/ajustes.js"];
const { calcularRuta } = __m["modulos/picking/calculo.js"];
const { participacionDeCausa } = __m["modulos/diagnostico/calculo.js"];

const PEDIDOS_SIMULADOS = 100; // se simulan los 100 pedidos más recientes

// As-Is contra To-Be con los pedidos reales, y proyección del OTIF.
function calcularEscenarios({ catalogo, otif, ubicaciones }, ajustes, planta) {
  const pedidos = catalogo.pedidos.slice(0, PEDIDOS_SIMULADOS);
  const contexto = { porSku: catalogo.porSku, planta, ajustes };
  const rutas = (metodo, asignacion) =>
    pedidos.map(p => calcularRuta(p, metodo, asignacion, contexto));
  const promedio = (lista, valor) => sum(lista, valor) / (lista.length || 1);

  // Promedios con el método óptimo por zonas, con las ubicaciones actuales y con el plan aplicado
  const evaluar = asignacion => {
    const lista = rutas('zonas', asignacion);
    return {
      distancia: promedio(lista, r => r.distancia),
      tiempo: promedio(lista, r => r.tiempo),
      exposicionFrio: promedio(lista, r => r.exposicionFrio),
      excedenFrio: lista.filter(r => r.exposicionFrio / 60 > ajustes.frioMax).length / (lista.length || 1)
    };
  };
  const actual = evaluar(ubicaciones.actual);
  const propuesta = evaluar(ubicaciones.propuesta);

  // Referencias para la gráfica «¿qué aporta cada módulo?»
  const distanciaListaActual = promedio(rutas('lista', ubicaciones.actual), r => r.distancia);
  const distanciaListaPropuesta = promedio(rutas('lista', ubicaciones.propuesta), r => r.distancia);
  const distanciaVecinoActual = promedio(rutas('vecino', ubicaciones.actual), r => r.distancia);

  // Proyección del OTIF: cuántas incidencias se evitan según cuánto reduce cada módulo (Ajustes)
  const { causas, regresion } = otif;
  const incidencias = regresion.incidenciasPromedio;
  const incidenciasEvitadas =
    (incidencias *
      (participacionDeCausa(causas, 'ubicacion') * ajustes.rUb +
        participacionDeCausa(causas, 'diferencia') * ajustes.rEri +
        participacionDeCausa(causas, 'faltadeprod') * ajustes.rRop)) /
    100;
  const otifProyectado = otif.promedio + -regresion.pendiente * incidenciasEvitadas;

  return {
    actual,
    propuesta,
    distanciaListaActual,
    distanciaListaPropuesta,
    distanciaVecinoActual,
    incidencias,
    incidenciasEvitadas,
    otifProyectado,
    horasAhorradasPorMes:
      ((actual.tiempo - propuesta.tiempo) * catalogo.nPedidos) / (ajustes.vent / 30) / 3600
  };
}

// Simulador: vuelve a calcular la reposición con otra demanda, otro retraso del lead time
// y otro nivel de servicio, y estima cómo cambia el OTIF.
function simularReposicion({ inventario, otif }, ajustes, escenario, proyeccion) {
  const { demanda, leadTime, servicio } = escenario; // demanda en %, leadTime en días
  const filas = inventario.reposicion(NIVELES_SERVICIO[servicio] || 1.645, demanda / 100, leadTime);
  const enRiesgo = filas.filter(s => s.estado === 'PEDIR').length;

  // Si hay más SKUs en riesgo, aumentan las incidencias por «falta de productos»
  const incidenciasFaltaDeProductos =
    proyeccion.incidencias * participacionDeCausa(otif.causas, 'faltadeprod');
  const otifEstimado =
    proyeccion.otifProyectado +
    -otif.regresion.pendiente *
      (incidenciasFaltaDeProductos * (1 - ajustes.rRop / 100)) *
      (enRiesgo / (inventario.pedir.length || 1) - 1);

  return {
    filas,
    enRiesgo,
    stockSeguridadTotal: sum(filas, s => s.stockSeguridad),
    inversionInmediata: sum(
      filas.filter(s => s.estado === 'PEDIR'),
      s => s.inversion
    ),
    otifEstimado
  };
}

Object.defineProperty(__e, 'calcularEscenarios', { get: () => calcularEscenarios, enumerable: true });
Object.defineProperty(__e, 'simularReposicion', { get: () => simularReposicion, enumerable: true });
return __e;
})();

// ===== modelo.js =====
__m["modelo.js"] = (function () {
const __e = {};
// Recalcula todo el modelo a partir de los datos leídos del Sheet y de los ajustes.
// Aquí se juntan los cálculos de cada módulo; las pantallas solo leen el resultado (`modelo`).

const { datos, ajustes, modelo } = __m["nucleo/estado.js"];
const { planta, cargarPlanta, layoutDesdeTablas } = __m["nucleo/planta.js"];
const { construirCatalogo } = __m["nucleo/catalogo.js"];
const { calcularInventario } = __m["modulos/inventario/calculo.js"];
const { calcularOtif } = __m["modulos/diagnostico/calculo.js"];
const { calcularUbicaciones } = __m["modulos/ubicaciones/calculo.js"];
const { calcularEscenarios } = __m["modulos/escenarios/calculo.js"];

function recalcular() {
  const hay = {
    inventario: datos.inventario.length > 0,
    pedidos: datos.pedidos.length > 0,
    otif: datos.otif.length > 0,
    causas: datos.causas.length > 0
  };

  // El plano de la planta llega del Sheet (pestañas Layout, Ubicaciones y Muros)
  const layout = layoutDesdeTablas(datos);
  cargarPlanta(layout);
  hay.layout = planta.hay;

  const catalogo = construirCatalogo(datos, ajustes);
  const inventario = calcularInventario(catalogo, ajustes);
  const otif = calcularOtif(datos, ajustes);
  // Ubicaciones necesita el inventario y el plano; Escenarios además los pedidos y el OTIF
  const ubicaciones = hay.inventario && hay.layout ? calcularUbicaciones(catalogo, ajustes, planta) : null;
  const escenarios =
    ubicaciones && hay.pedidos && hay.otif
      ? calcularEscenarios({ catalogo, otif, ubicaciones }, ajustes, planta)
      : null;

  Object.assign(modelo, { hay, catalogo, inventario, otif, ubicaciones, escenarios });
  // Avisa al menú (insignias) de que hay nuevos resultados
  document.dispatchEvent(new Event('modelo-actualizado'));
}

Object.defineProperty(__e, 'recalcular', { get: () => recalcular, enumerable: true });
return __e;
})();

// ===== nucleo/csv.js =====
__m["nucleo/csv.js"] = (function () {
const __e = {};
// Lectura de texto CSV (lo que devuelve Google Sheets) y descarga de archivos CSV.

const { normalizar } = __m["nucleo/formato.js"];

// Convierte texto CSV en una lista de filas (cada fila es una lista de celdas).
// Detecta si el separador es coma o punto y coma, y respeta las comillas.
function parseCsv(texto) {
  texto = texto.replace(/^﻿/, '');
  const primeraLinea = texto.split('\n')[0];
  const separador =
    (primeraLinea.match(/;/g) || []).length > (primeraLinea.match(/,/g) || []).length ? ';' : ',';

  const filas = [];
  let fila = [];
  let celda = '';
  let entreComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          celda += '"';
          i++;
        } else entreComillas = false;
      } else celda += c;
    } else if (c === '"') entreComillas = true;
    else if (c === separador) {
      fila.push(celda);
      celda = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = '';
    } else celda += c;
  }
  if (celda || fila.length) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas.filter(f => f.some(c => c.trim()));
}

// Convierte texto CSV en { cabecera, filas }.
// Los nombres de columna se normalizan: "Stock_Sistema" → "stocksistema".
function leerTabla(texto) {
  const filas = parseCsv(texto);
  if (!filas.length) return { cabecera: [], filas: [] };
  const cabecera = filas[0].map(normalizar);
  return {
    cabecera,
    filas: filas
      .slice(1)
      .map(f => Object.fromEntries(cabecera.map((nombre, i) => [nombre, (f[i] || '').trim()])))
  };
}

// Guarda un archivo (CSV, PDF, Word, Excel...): abre el explorador de archivos para elegir
// la carpeta y confirmar el nombre. Si el navegador no tiene esa función (p. ej. Firefox),
// se usa la descarga normal.
async function guardarArchivo(nombre, blob, descripcion, extension) {
  if (window.showSaveFilePicker) {
    try {
      const manejador = await window.showSaveFilePicker({
        suggestedName: nombre,
        types: [{ description: descripcion, accept: { [blob.type || 'application/octet-stream']: [extension] } }]
      });
      const escritura = await manejador.createWritable();
      await escritura.write(blob);
      await escritura.close();
      return true;
    } catch (error) {
      if (error && error.name === 'AbortError') return false; // el usuario canceló el explorador
      // cualquier otro error: se usa la descarga normal
    }
  }
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 4000);
  return true;
}

// Carga bajo demanda de librerías para generar PDF (solo la primera vez).
let jsPdfCargado = null;
let html2canvasCargado = null;
function cargarScript(url) {
  return new Promise((ok, mal) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = ok;
    script.onerror = () => mal(new Error('No se pudo cargar ' + url));
    document.head.appendChild(script);
  });
}
function cargarJsPdf() {
  if (!jsPdfCargado) {
    jsPdfCargado = cargarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      .then(() => cargarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'))
      .then(() => window.jspdf.jsPDF)
      .catch(error => {
        jsPdfCargado = null; // se reintenta en el siguiente clic
        throw error;
      });
  }
  return jsPdfCargado;
}
function cargarHtml2Canvas() {
  if (!html2canvasCargado) {
    html2canvasCargado = cargarScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      .then(() => window.html2canvas)
      .catch(error => {
        html2canvasCargado = null;
        throw error;
      });
  }
  return html2canvasCargado;
}

// Descarga una tabla (lista de filas) como archivo CSV.
function descargarCsv(nombre, filas) {
  const texto =
    '﻿' +
    filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  return guardarArchivo(nombre + '.csv', new Blob([texto], { type: 'text/csv' }), 'Archivo CSV', '.csv');
}

Object.defineProperty(__e, 'parseCsv', { get: () => parseCsv, enumerable: true });
Object.defineProperty(__e, 'leerTabla', { get: () => leerTabla, enumerable: true });
Object.defineProperty(__e, 'descargarCsv', { get: () => descargarCsv, enumerable: true });
Object.defineProperty(__e, 'guardarArchivo', { get: () => guardarArchivo, enumerable: true });
Object.defineProperty(__e, 'cargarJsPdf', { get: () => cargarJsPdf, enumerable: true });
Object.defineProperty(__e, 'cargarHtml2Canvas', { get: () => cargarHtml2Canvas, enumerable: true });
return __e;
})();

// ===== nucleo/hojas.js =====
__m["nucleo/hojas.js"] = (function () {
const __e = {};
// Lectura del Google Sheet. Es la única vía por la que entran datos a la app.
//
// El Sheet debe estar compartido como «Cualquier persona con el enlace» y tener estas pestañas
// con estos nombres exactos: Inventario, Pedidos, OTIF, Causas, Layout, Ubicaciones y (opcionales) Muros y Ajustes.

const { leerTabla } = __m["nucleo/csv.js"];

// Cada pestaña: cómo se llama, en qué tabla de la app queda y qué columnas son obligatorias
// (nombre normalizado, nombre tal como se escribe en el Sheet).
const PESTANAS = [
  {
    nombre: 'Inventario',
    tabla: 'inventario',
    obligatorias: [
      ['sku', 'SKU'],
      ['stocksistema', 'Stock_Sistema']
    ]
  },
  {
    nombre: 'Pedidos',
    tabla: 'pedidos',
    obligatorias: [
      ['pedidoid', 'Pedido_ID'],
      ['fechapedido', 'Fecha pedido'],
      ['sku', 'SKU'],
      ['cantidad', 'Cantidad']
    ]
  },
  {
    nombre: 'OTIF',
    tabla: 'otif',
    obligatorias: [
      ['mes', 'Mes'],
      ['pedidosotif', 'Pedidos_OTIF'],
      ['pedidostotal', 'Pedidos_Total']
    ]
  },
  {
    nombre: 'Causas',
    tabla: 'causas',
    obligatorias: [
      ['causa', 'Causa'],
      ['etapa', 'Etapa'],
      ['frecuencia', 'Frecuencia']
    ]
  },
  // El plano de la planta lo genera el asistente «Configurar layout» (pantalla Datos)
  {
    nombre: 'Layout',
    tabla: 'layout',
    obligatorias: [
      ['parametro', 'Parametro'],
      ['valor', 'Valor']
    ]
  },
  {
    nombre: 'Ubicaciones',
    tabla: 'ubicaciones',
    obligatorias: [
      ['ubicacion', 'Ubicacion'],
      ['zona', 'Zona'],
      ['tipo', 'Tipo'],
      ['x', 'X'],
      ['y', 'Y'],
      ['ancho', 'Ancho'],
      ['alto', 'Alto']
    ]
  },
  {
    // Una planta sin cámaras no tiene muros: la pestaña puede faltar o estar vacía
    nombre: 'Muros',
    tabla: 'muros',
    opcional: true,
    obligatorias: [
      ['x0', 'X0'],
      ['y0', 'Y0'],
      ['x1', 'X1'],
      ['y1', 'Y1']
    ]
  },
  {
    // Zonas por donde sí se puede caminar. Si la pestaña existe, todo lo que no esté aquí queda bloqueado.
    nombre: 'Pasillos',
    tabla: 'pasillos',
    opcional: true,
    obligatorias: [
      ['x0', 'X0'],
      ['y0', 'Y0'],
      ['x1', 'X1'],
      ['y1', 'Y1']
    ]
  },
  {
    // Ajustes compartidos entre supervisor y operario. Si existe y se leyó bien,
    // sus valores reemplazan a los de este navegador al leer el Sheet.
    nombre: 'Ajustes',
    tabla: 'ajustes',
    opcional: true,
    obligatorias: [
      ['parametro', 'Parametro'],
      ['valor', 'Valor']
    ]
  }
];

// Saca el identificador del Sheet de un enlace como https://docs.google.com/spreadsheets/d/ID/edit
function idDeHoja(enlace) {
  const m = /\/spreadsheets\/d\/([\w-]+)/.exec(enlace || '');
  return m ? m[1] : null;
}

const urlCsv = (id, pestana) =>
  `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(pestana)}`;

// Revisa que el texto recibido sea la pestaña esperada. Devuelve { filas } o { error }.
function interpretarPestana(definicion, texto) {
  const contenido = (texto || '').trim();
  if (!contenido || contenido[0] === '<') {
    return { error: 'no se pudo leer (¿el Sheet no está compartido o no existe la pestaña?)' };
  }
  const { cabecera, filas } = leerTabla(contenido);
  const faltan = definicion.obligatorias
    .filter(([clave]) => !cabecera.includes(clave))
    .map(([, etiqueta]) => etiqueta);
  if (faltan.length) {
    return { error: `faltan columnas: ${faltan.join(', ')} (revise el nombre de la pestaña)` };
  }
  if (!filas.length) return { error: 'no tiene filas' };
  // Pedidos: la columna «Fecha pedido» (fecha de ingreso) se usa como Fecha en toda la app
  filas.forEach(f => {
    if (f.fecha === undefined && f.fechapedido !== undefined) f.fecha = f.fechapedido;
  });
  return { filas };
}

// Lee las pestañas del Sheet. Nunca falla por una pestaña: devuelve el resultado de cada una.
// `descargar` es fetch; se puede cambiar para hacer pruebas.
async function leerHoja(enlace, descargar = fetch) {
  const id = idDeHoja(enlace);
  if (!id) {
    throw new Error('El enlace no parece de Google Sheets (debe contener /spreadsheets/d/…).');
  }

  const pestanas = await Promise.all(
    PESTANAS.map(async definicion => {
      try {
        const respuesta = await descargar(urlCsv(id, definicion.nombre));
        if (respuesta.status === 400 || respuesta.status === 404) {
          // La pestaña no existe con ese nombre: se dice así en vez de un error de conexión
          return { definicion, error: definicion.opcional ? 'no existe (es opcional)' : 'no existe la pestaña (revise el nombre)' };
        }
        if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
        const resultado = interpretarPestana(definicion, await respuesta.text());
        return { definicion, ...resultado };
      } catch (e) {
        return { definicion, error: 'no se pudo conectar con Google (' + e.message + ')' };
      }
    })
  );

  const tablas = { inventario: [], pedidos: [], otif: [], causas: [], layout: [], ubicaciones: [], muros: [], pasillos: [], ajustes: [] };
  pestanas.forEach(p => {
    if (p.filas) tablas[p.definicion.tabla] = p.filas;
  });

  return {
    tablas,
    pestanas: pestanas.map(p => ({
      nombre: p.definicion.nombre,
      opcional: !!p.definicion.opcional,
      ok: !p.error,
      filas: p.filas ? p.filas.length : 0,
      error: p.error || ''
    }))
  };
}

Object.defineProperty(__e, 'PESTANAS', { get: () => PESTANAS, enumerable: true });
Object.defineProperty(__e, 'idDeHoja', { get: () => idDeHoja, enumerable: true });
Object.defineProperty(__e, 'interpretarPestana', { get: () => interpretarPestana, enumerable: true });
Object.defineProperty(__e, 'leerHoja', { get: () => leerHoja, enumerable: true });
return __e;
})();

// ===== sincronizacion.js =====
__m["sincronizacion.js"] = (function () {
const __e = {};
// Conecta con el Google Sheet: lo lee, guarda el enlace y recalcula.

const { datos, ajustes, conexion } = __m["nucleo/estado.js"];
const { leerHoja, idDeHoja } = __m["nucleo/hojas.js"];
const { guardarPreferencias } = __m["nucleo/almacenamiento.js"];
const { recalcular } = __m["modelo.js"];
const { AJUSTES_POR_DEFECTO } = __m["nucleo/ajustes.js"];

const SIN_DATOS = () => ({
  inventario: [],
  pedidos: [],
  otif: [],
  causas: [],
  layout: [],
  ubicaciones: [],
  muros: [],
  pasillos: []
});

// Si el Sheet tiene la pestaña Ajustes y se leyó bien, sus valores reemplazan a los de este navegador.
function aplicarAjustesDelSheet(filas, pestanas) {
  const pestana = pestanas.find(p => p.nombre === 'Ajustes');
  if (!pestana || !pestana.ok) return;
  filas.forEach(fila => {
    const clave = fila.parametro;
    if (!Object.prototype.hasOwnProperty.call(AJUSTES_POR_DEFECTO, clave)) return;
    const valor = Number(String(fila.valor).replace(',', '.'));
    if (fila.valor !== '' && Number.isFinite(valor)) ajustes[clave] = valor;
  });
}

// Lee el Sheet de `enlace`. `avisar` redibuja la pantalla (al empezar y al terminar la lectura).
// `recordar: false` (operario) no guarda el enlace en este navegador.
async function sincronizar(enlace, avisar, { recordar = true } = {}) {
  conexion.enlace = (enlace || '').trim();
  conexion.mensaje = '';

  // Un enlace inválido no se guarda ni se lee
  if (!conexion.enlace || !idDeHoja(conexion.enlace)) {
    conexion.estado = 'error';
    conexion.pestanas = [];
    conexion.mensaje = conexion.enlace
      ? 'El enlace no parece de Google Sheets (debe contener /spreadsheets/d/…).'
      : 'Pegue el enlace de su Google Sheet.';
    Object.assign(datos, SIN_DATOS());
    recalcular();
    avisar();
    return;
  }

  conexion.estado = 'leyendo';
  avisar();
  if (recordar) guardarPreferencias({ enlace: conexion.enlace, ajustes });

  try {
    const { tablas, pestanas } = await leerHoja(conexion.enlace);
    const { ajustes: filasAjustes, ...resto } = tablas;
    Object.assign(datos, resto);
    aplicarAjustesDelSheet(filasAjustes, pestanas);
    conexion.pestanas = pestanas;
    // Las pestañas opcionales no cuentan: si faltan, la conexión sigue estando completa
    const necesarias = pestanas.filter(p => !p.opcional);
    const leidas = necesarias.filter(p => p.ok).length;
    conexion.estado = leidas === necesarias.length ? 'ok' : leidas ? 'parcial' : 'error';
    conexion.mensaje = leidas
      ? ''
      : 'No se pudo leer ninguna pestaña. Revise que el Sheet esté compartido como «Cualquier persona con el enlace» y que haya conexión a internet.';
    conexion.ultimaLectura = new Date();
  } catch (e) {
    Object.assign(datos, SIN_DATOS());
    conexion.pestanas = [];
    conexion.estado = 'error';
    conexion.mensaje = e.message;
  }
  recalcular();
  avisar();
}

Object.defineProperty(__e, 'sincronizar', { get: () => sincronizar, enumerable: true });
return __e;
})();

// ===== nucleo/html.js =====
__m["nucleo/html.js"] = (function () {
const __e = {};
// Piezas de HTML que se repiten en varias pantallas.

const { esc } = __m["nucleo/formato.js"];

const etiqueta = (clase, texto) => `<span class="tag ${clase}">${texto}</span>`;

const etiquetaZona = zona => etiqueta('t-' + esc(zona), esc(zona));

// Tarjeta con un indicador. color: '', 'er' (rojo), 'wa' (naranja) o 'ok' (verde).
const kpi = (titulo, valor, detalle, color = '') =>
  `<div class="card k ${color}"><span>${titulo}</span><b>${valor}</b><span>${detalle || ''}</span></div>`;

const tabla = (cabeceras, filas) =>
  `<div class="tw"><table><tr>${cabeceras.map(c => `<th>${c}</th>`).join('')}</tr>${filas
    .map(f => `<tr>${f.map(c => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</table></div>`;

// Barras horizontales. Cada fila: [nombre, valor, color, texto a la derecha].
function barras(filas, colorPorDefecto) {
  const maximo = Math.max(...filas.map(f => f[1]), 1);
  return filas
    .map(
      f =>
        `<div class="bar"><span>${f[0]}</span><div><i style="width:${(f[1] / maximo) * 100}%;background:${f[2] || colorPorDefecto}"></i></div><b>${f[3]}</b></div>`
    )
    .join('');
}

// Título de la pantalla con su subtítulo y, opcionalmente, botones a la derecha.
const encabezado = (titulo, subtitulo, acciones = '') =>
  `<div class="top"><div><h1>${titulo}</h1><p class="sub">${subtitulo}</p></div><div class="row">${acciones}</div></div>`;

// Mensaje que se muestra cuando todavía no hay datos para la pantalla.
const estadoVacio = (titulo, texto, boton = true) =>
  `<div class="card vacio"><h2>${titulo}</h2><p class="mu">${texto}</p>${
    boton ? '<button class="btn p" data-go="datos">Ir a Datos →</button>' : ''
  }</div>`;

Object.defineProperty(__e, 'etiqueta', { get: () => etiqueta, enumerable: true });
Object.defineProperty(__e, 'etiquetaZona', { get: () => etiquetaZona, enumerable: true });
Object.defineProperty(__e, 'kpi', { get: () => kpi, enumerable: true });
Object.defineProperty(__e, 'tabla', { get: () => tabla, enumerable: true });
Object.defineProperty(__e, 'barras', { get: () => barras, enumerable: true });
Object.defineProperty(__e, 'encabezado', { get: () => encabezado, enumerable: true });
Object.defineProperty(__e, 'estadoVacio', { get: () => estadoVacio, enumerable: true });
return __e;
})();

// ===== nucleo/graficos.js =====
__m["nucleo/graficos.js"] = (function () {
const __e = {};
// Gráficos dibujados como SVG: evolución del OTIF, dispersión con recta ajustada y plano de la planta.

const { fmt, esc } = __m["nucleo/formato.js"];

// Evolución mensual del OTIF contra la meta. `meses` viene de calcularOtif().
function graficoLineas(meses, meta) {
  if (!meses.length) return '';
  const ancho = 640;
  const alto = 230;
  const margen = 36;
  const minimo = Math.min(80, ...meses.map(m => m.otif)) - 1;
  const maximo = 100;
  const X = i => margen + (i * (ancho - margen - 10)) / Math.max(meses.length - 1, 1);
  const Y = v => alto - 24 - ((v - minimo) / (maximo - minimo)) * (alto - 40);

  let svg = `<svg viewBox="0 0 ${ancho} ${alto}">`;
  for (let v = Math.ceil(minimo / 5) * 5; v <= 100; v += 5) {
    svg += `<line x1="${margen}" x2="${ancho}" y1="${Y(v)}" y2="${Y(v)}" stroke="#eef1f6"/><text x="${margen - 6}" y="${Y(v) + 4}" font-size="11" text-anchor="end" fill="#667085">${v}</text>`;
  }
  svg += `<line x1="${margen}" x2="${ancho}" y1="${Y(meta)}" y2="${Y(meta)}" stroke="#16a34a" stroke-dasharray="6 4"/><text x="${margen + 4}" y="${Y(meta) - 4}" font-size="11" fill="#16a34a">Meta ${meta} %</text>`;
  // La línea azul solo une los meses completos; el mes parcial se dibuja aparte, como círculo vacío.
  const puntosLinea = meses
    .filter(m => !m.parcial)
    .map(m => X(meses.indexOf(m)) + ',' + Y(m.otif))
    .join(' ');
  svg += `<polyline fill="none" stroke="#2563eb" stroke-width="2" points="${puntosLinea}"/>`;
  meses.forEach((m, i) => {
    const relleno = m.parcial ? '#fff' : m.otif >= meta ? '#16a34a' : '#dc2626';
    svg += `<circle cx="${X(i)}" cy="${Y(m.otif)}" r="4.5" fill="${relleno}" stroke="${m.parcial ? '#94a3b8' : 'none'}"><title>${esc(m.mes)}: ${fmt(m.otif, 1)} %</title></circle><text x="${X(i)}" y="${alto - 6}" text-anchor="middle" font-size="10" fill="#475569">${esc(m.mes)}</text>`;
  });
  return svg + '</svg>';
}

// Un punto por mes (incidencias contra OTIF) y la recta de mínimos cuadrados.
function graficoDispersion(puntos, regresion, meta) {
  const ancho = 520;
  const alto = 300;
  const margen = 44;
  const incidencias = puntos.map(m => m.incidencias);
  const x0 = Math.min(...incidencias, 20) - 5;
  const x1 = Math.max(...incidencias, 80) + 5;
  const y0 = Math.min(...puntos.map(m => m.otif), 84) - 1;
  const y1 = 99;
  const X = v => margen + ((v - x0) / (x1 - x0)) * (ancho - margen - 10);
  const Y = v => alto - 36 - ((v - y0) / (y1 - y0)) * (alto - 50);
  const { intercepto, pendiente } = regresion;

  let svg = `<svg viewBox="0 0 ${ancho} ${alto}"><line x1="${margen}" x2="${ancho}" y1="${Y(meta)}" y2="${Y(meta)}" stroke="#16a34a" stroke-dasharray="6 4"/><line x1="${X(x0)}" y1="${Y(intercepto + pendiente * x0)}" x2="${X(x1)}" y2="${Y(intercepto + pendiente * x1)}" stroke="#dc2626" stroke-width="2"/>`;
  puntos.forEach(m => {
    svg += `<circle cx="${X(m.incidencias)}" cy="${Y(m.otif)}" r="5" fill="#2563eb"/><text x="${X(m.incidencias) + 6}" y="${Y(m.otif) - 6}" font-size="10">${esc(m.mes)}</text>`;
  });
  svg += `<text x="${ancho / 2}" y="${alto - 6}" text-anchor="middle" font-size="12" font-weight="700">Incidencias de almacén en el mes</text></svg>`;
  return svg;
}

const COLOR_TIPO = {
  picking: '#3f7fd6',
  almacenaje: '#f0aa3a',
  staging: '#59ae47',
  pnc: '#dc4f48',
  otro: '#9ba0a6'
};
const RGB_ZONA = { SECO: '245,158,11', REFRIGERADO: '56,189,248', CONGELADO: '99,102,241' };

// Nombres de las columnas y filas (SA, SB, CA…): se sacan de los códigos de las ubicaciones (SB-17 → SB)
function etiquetasDeLineas(ubicaciones, tamano) {
  const porLinea = {};
  ubicaciones.forEach(u => {
    const nombre = u.id.includes('-') ? u.id.slice(0, u.id.lastIndexOf('-')) : null;
    if (nombre) (porLinea[nombre] ||= []).push(u);
  });
  let svg = '';
  Object.entries(porLinea).forEach(([nombre, lista]) => {
    const xs = lista.map(u => u.x);
    const ys = lista.map(u => u.y);
    const esColumna = Math.max(...ys) - Math.min(...ys) >= Math.max(...xs) - Math.min(...xs);
    const fuente = tamano * 0.9;
    if (esColumna) {
      const abajo = lista.reduce((a, u) => (u.y > a.y ? u : a));
      svg += `<text x="${abajo.x}" y="${abajo.y + abajo.alto / 2 + fuente * 1.5}" font-size="${fuente}" font-weight="700" text-anchor="middle" fill="#475569">${esc(nombre)}</text>`;
    } else {
      const izquierda = lista.reduce((a, u) => (u.x < a.x ? u : a));
      svg += `<text x="${izquierda.x - izquierda.ancho / 2 - fuente * 0.8}" y="${izquierda.y + fuente * 0.35}" font-size="${fuente}" font-weight="700" text-anchor="end" fill="#475569">${esc(nombre)}</text>`;
    }
  });
  return svg;
}

// Plano de la planta. Opciones:
//   ocupacion: { ubicacion: fracción } → pinta las ubicaciones de picking según qué tan llenas están
//   recorrido: lista de ubicaciones    → dibuja la ruta de picking (empieza y termina en 'DOCK')
//   paradas:   lista de ubicaciones    → numera las paradas de la ruta
//   animable:  true                    → deja listos los elementos que mueve la animación del recorrido
function dibujarPlano(planta, { ocupacion, recorrido, paradas, animable } = {}) {
  if (!planta.hay) return '';
  const { layout, ubicaciones, muelle, celda } = planta;
  const tamano = celda * 1.4; // unidad para dibujar textos y marcas

  let svg = `<svg class="plano" viewBox="0 0 ${layout.ancho} ${layout.alto}" style="background:#fff;border:1px solid #e2e6ee;border-radius:10px">`;

  layout.muros.forEach(m => {
    svg += `<rect x="${m.x0}" y="${m.y0}" width="${m.x1 - m.x0}" height="${m.y1 - m.y0}" fill="#0b3a72"/>`;
  });

  ubicaciones.forEach(u => {
    const llenado = ocupacion && u.tipo === 'picking' ? ocupacion[u.id] : null;
    const saturado = llenado > 1;
    let relleno = COLOR_TIPO[u.tipo] || COLOR_TIPO.otro;
    let opacidad = 1;
    if (ocupacion) {
      if (llenado != null) {
        relleno = `rgba(${RGB_ZONA[u.zona] || RGB_ZONA.SECO},${Math.min(0.15 + llenado * 0.8, 1)})`;
      } else {
        opacidad = 0.3;
      }
    }
    const detalle = `${u.id} · ${NOMBRE_DE_TIPO[u.tipo] || u.tipo} · ${u.zona}${llenado != null ? ' · ' + Math.round(llenado * 100) + ' % lleno' : ''}`;
    svg += `<rect data-ubicacion="${esc(u.id)}" x="${u.x - u.ancho / 2}" y="${u.y - u.alto / 2}" width="${u.ancho}" height="${u.alto}" rx="2" fill="${relleno}" opacity="${opacidad}" stroke="${saturado ? '#dc2626' : '#1e3a8a'}" stroke-width="${saturado ? 3 : 1}"><title>${esc(detalle)}</title></rect>`;
  });

  svg += etiquetasDeLineas(ubicaciones, tamano);

  // Muelle
  const ancho = tamano * 4;
  const alto = tamano * 2.6;
  svg += `<rect x="${muelle.x - ancho / 2}" y="${muelle.y - alto / 2}" width="${ancho}" height="${alto}" rx="4" fill="#16a34a"/><text x="${muelle.x}" y="${muelle.y + tamano * 0.35}" font-size="${tamano * 0.9}" fill="#fff" text-anchor="middle" font-weight="700">MUELLE</text>`;

  if (recorrido && recorrido.length > 1) {
    const puntos = [];
    for (let i = 1; i < recorrido.length; i++) {
      planta.camino(recorrido[i - 1], recorrido[i]).forEach(p => puntos.push(`${p.x},${p.y}`));
    }
    svg += `<polyline points="${puntos.join(' ')}" fill="none" stroke="#2563eb" stroke-width="${celda * 0.4}" stroke-dasharray="${celda * 0.9} ${celda * 0.6}" stroke-linejoin="round"/>`;
    (paradas || []).forEach((id, i) => {
      const u = planta.nodos[id];
      svg += `<circle cx="${u.x}" cy="${u.y}" r="${tamano * 0.9}" fill="#f97316" stroke="#fff" stroke-width="2"/><text x="${u.x}" y="${u.y + tamano * 0.35}" font-size="${tamano * 0.95}" fill="#fff" text-anchor="middle" font-weight="700">${i + 1}</text>`;
    });
  }

  if (animable) {
    svg += `<polyline id="anim-estela" points="" fill="none" stroke="#dc2626" stroke-width="${celda * 0.55}" stroke-linejoin="round" stroke-linecap="round"/><g id="anim-picker" transform="translate(${muelle.x},${muelle.y})"><circle r="${tamano * 1.15}" fill="#dc2626" stroke="#fff" stroke-width="3"/><circle r="${tamano * 0.4}" fill="#fff"/></g>`;
  }
  return svg + '</svg>';
}

const NOMBRE_DE_TIPO = {
  picking: 'Picking',
  almacenaje: 'Almacenaje',
  staging: 'Staging',
  pnc: 'PNC',
  otro: 'Otro'
};

Object.defineProperty(__e, 'graficoLineas', { get: () => graficoLineas, enumerable: true });
Object.defineProperty(__e, 'graficoDispersion', { get: () => graficoDispersion, enumerable: true });
Object.defineProperty(__e, 'dibujarPlano', { get: () => dibujarPlano, enumerable: true });
return __e;
})();

// ===== nucleo/requisitos.js =====
__m["nucleo/requisitos.js"] = (function () {
const __e = {};
// Cada pantalla necesita ciertas tablas del Sheet. Si faltan, se muestra un aviso en vez de la pantalla.

const { modelo, conexion } = __m["nucleo/estado.js"];
const { encabezado, estadoVacio } = __m["nucleo/html.js"];
const { PESTANAS } = __m["nucleo/hojas.js"];

const NOMBRE_PESTANA = {
  ...Object.fromEntries(PESTANAS.map(p => [p.tabla, p.nombre])),
  layout: 'Layout y Ubicaciones'
};

// Devuelve el HTML del aviso si falta alguna tabla, o null si la pantalla puede dibujarse.
function pantallaVacia(titulo, subtitulo, requeridas) {
  const faltan = requeridas.filter(tabla => !modelo.hay[tabla]);
  if (!faltan.length) return null;

  let aviso;
  switch (conexion.estado) {
    case 'sin_enlace':
      aviso = estadoVacio(
        'Conecte su Google Sheet',
        'Esta pantalla se llena con los datos de su Sheet. Pegue el enlace en la pantalla Datos.'
      );
      break;
    case 'leyendo':
      aviso = estadoVacio('Leyendo el Sheet…', 'Un momento, se están cargando los datos.', false);
      break;
    case 'error':
      aviso = estadoVacio('No se pudo leer el Sheet', conexion.mensaje);
      break;
    default:
      aviso = estadoVacio(
        'Faltan datos en el Sheet',
        'Esta pantalla necesita las pestañas: ' +
          faltan.map(t => NOMBRE_PESTANA[t]).join(', ') +
          '. Revise sus nombres y columnas en la pantalla Datos.' +
          (faltan.includes('layout')
            ? ' El plano de la planta se crea con «Configurar layout» (pantalla Datos) y se pega en el Sheet.'
            : '')
      );
  }
  return encabezado(titulo, subtitulo) + aviso;
}

Object.defineProperty(__e, 'pantallaVacia', { get: () => pantallaVacia, enumerable: true });
return __e;
})();

// ===== modulos/panel/vista.js =====
__m["modulos/panel/vista.js"] = (function () {
const __e = {};
// Panel: resumen de la operación y tareas ordenadas por urgencia.

const { modelo, ajustes, datos } = __m["nucleo/estado.js"];
const { fmt, pc, sol, sum } = __m["nucleo/formato.js"];
const { kpi, barras, encabezado, etiqueta } = __m["nucleo/html.js"];
const { graficoLineas } = __m["nucleo/graficos.js"];
const { pantallaVacia } = __m["nucleo/requisitos.js"];

const TITULO = 'Panel de control';
const SUBTITULO = 'Resumen de la operación y lo que conviene hacer hoy.';

// Etiqueta verde si la tabla tiene datos, naranja si no.
const estadoDeTabla = (nombre, cantidad, unidad) =>
  cantidad
    ? etiqueta('t-g', `${nombre}: ${fmt(cantidad)} ${unidad}`)
    : etiqueta('t-a', `${nombre}: sin datos`);

function render() {
  const vacio = pantallaVacia(TITULO, SUBTITULO, ['inventario', 'pedidos', 'otif']);
  if (vacio) return vacio;

  const { catalogo, inventario, otif, ubicaciones } = modelo;
  const aReponer = inventario.pedir.length;
  const sinMes = { mes: '-', otif: 0 };
  const peorMes = otif.completos.length
    ? otif.completos.reduce((peor, m) => (m.otif < peor.otif ? m : peor))
    : sinMes;
  const mejorMes = otif.completos.length
    ? otif.completos.reduce((mejor, m) => (m.otif > mejor.otif ? m : mejor))
    : sinMes;

  return (
    encabezado(TITULO, SUBTITULO) +
    `<div class="grid">${kpi('OTIF promedio (meses completos)', fmt(otif.promedio, 1) + ' %', `Meta ${ajustes.meta} % · ${fmt(otif.promedio - ajustes.meta, 1)} pp`, otif.promedio < ajustes.meta ? 'er' : 'ok')}${kpi('Exactitud de inventario (ERI)', pc(inventario.eri), `${inventario.contados - inventario.diferencias.length} de ${inventario.contados} SKUs sin diferencia`, inventario.eri * 100 < ajustes.eri ? 'er' : 'ok')}${kpi('SKUs a reponer hoy', aReponer, 'Inversión ' + sol(sum(inventario.pedir, s => s.inversion)), 'er')}${kpi('Traslados sugeridos', ubicaciones ? ubicaciones.traslados.length : '—', ubicaciones ? ubicaciones.riesgoTermico + ' críticos por riesgo térmico' : 'Falta el layout de la planta', 'wa')}${kpi('Valor del inventario', sol(inventario.valorInventario), catalogo.skus.length + ' SKUs activos')}</div>
<div class="grid g2"><div class="card"><h2>Tendencia histórica del OTIF</h2>${graficoLineas(otif.meses, ajustes.meta)}</div><div class="card"><h2>Desglose del OTIF</h2><p class="mu">OTIF = pedidos entregados a tiempo (On Time) y completos (In Full) a la vez.</p>${barras(
      [
        ['In Full (cajas)', otif.inFull * 100, '#2563eb', fmt(otif.inFull * 100, 2) + ' %'],
        ['OTIF', otif.promedio, otif.promedio < ajustes.meta ? '#dc2626' : '#16a34a', fmt(otif.promedio, 1) + ' %']
      ],
      '#2563eb'
    )}<p>${fmt(otif.pedidosFuera)} de ${fmt(otif.pedidosTotales)} pedidos quedaron fuera del OTIF.</p><p class="mu">Mejor mes: <b>${mejorMes.mes} · ${fmt(mejorMes.otif, 1)} %</b><br>Peor mes: <b>${peorMes.mes} · ${fmt(peorMes.otif, 1)} %</b><br>Meses bajo la meta: <b>${otif.bajoMeta} de ${otif.completos.length}</b></p></div></div>
<h2>Tareas ordenadas por urgencia</h2><div class="grid g2"><div class="card task"><big style="color:var(--er)">${aReponer}</big><div><b>Generar pedidos de reposición</b><p class="mu">SKUs en o bajo su punto de reorden. Otros ${inventario.pronto} lo estarán pronto.</p><button class="btn r" data-go="inv">Ver plan de compras →</button></div></div><div class="card task"><big style="color:var(--er)">${ubicaciones ? ubicaciones.riesgoTermico : '—'}</big><div><b>Trasladar productos mal ubicados</b><p class="mu">Productos fuera de su cámara: trasladarlos primero.</p><button class="btn r" data-go="ubic">Ver traslados →</button></div></div><div class="card task a"><big style="color:var(--wa)">${Math.min(40, inventario.diferencias.length)}</big><div><b>Conteo cíclico de la semana</b><p class="mu">Hay ${inventario.diferencias.length} SKUs con diferencia entre sistema y físico: se cuentan primero.</p><button class="btn o" data-go="inv" data-pestana="2">Ver lista de conteo →</button></div></div><div class="card task b"><big style="color:var(--ac)">→</big><div><b>Armar un pedido con la mejor ruta</b><p class="mu">Elija un pedido, vea el recorrido y descargue la hoja de picking.</p><button class="btn p" data-go="pick">Ir a Picking →</button></div></div></div>
<div class="card"><h2>Estado de los datos</h2>${estadoDeTabla('Inventario', datos.inventario.length, 'SKUs')} ${estadoDeTabla('Pedidos', datos.pedidos.length, 'líneas')} ${estadoDeTabla('OTIF', datos.otif.length, 'meses')} ${estadoDeTabla('Causas', datos.causas.length, 'causas')} ${estadoDeTabla('Layout', datos.ubicaciones.length, 'ubicaciones')} <button class="btn" data-go="datos">Gestionar datos</button><p class="mu">Demanda calculada con ${fmt(catalogo.nPedidos)} pedidos de los últimos ${ajustes.vent} días.</p></div>`
  );
}

__e.default = { id: 'panel', titulo: 'Panel', icono: '⌂', color: '#2563eb', render };


return __e;
})();

// ===== modulos/diagnostico/vista.js =====
__m["modulos/diagnostico/vista.js"] = (function () {
const __e = {};
// Diagnóstico OTIF: ¿qué tan bien cumplimos y por qué falla?

const { modelo, ajustes } = __m["nucleo/estado.js"];
const { fmt, pc, num, esc } = __m["nucleo/formato.js"];
const { kpi, tabla, barras, encabezado, etiqueta } = __m["nucleo/html.js"];
const { graficoLineas, graficoDispersion } = __m["nucleo/graficos.js"];
const { pantallaVacia } = __m["nucleo/requisitos.js"];
const { esCausaQueAtacaUnModulo } = __m["modulos/diagnostico/calculo.js"];
const { alClick } = __m["nucleo/dom.js"];

const TITULO = 'Diagnóstico OTIF';
const SUBTITULO =
  '¿Qué tan bien cumplimos y por qué falla? Evolución, efecto de las incidencias y causas que más pesan.';

function render() {
  const vacio = pantallaVacia(TITULO, SUBTITULO, ['otif']);
  if (vacio) return vacio;

  const { otif } = modelo;
  const { regresion, causas } = otif;
  const { pendiente, intercepto, r2, incidenciasPromedio } = regresion;
  // Incidencias por mes con las que la recta cruzaría la meta
  const incidenciasParaLaMeta = pendiente ? (ajustes.meta - intercepto) / pendiente : 0;

  const pareto = barras(
    causas.lista.map((c, i) => [
      esc(c.causa),
      num(c.frecuencia),
      esCausaQueAtacaUnModulo(c.causa) ? '#16a34a' : '#94a3b8',
      `${fmt(num(c.frecuencia))} · ${pc(num(c.frecuencia) / causas.total)} (acum. ${pc(causas.acumulados[i], 0)})`
    ])
  );
  const etapas = Object.entries(causas.porEtapa)
    .map(([etapa, frecuencia]) => etiqueta('t-b', esc(etapa) + ' ' + pc(frecuencia / causas.total)))
    .join(' ');

  const detalleMensual = tabla(
    ['Mes', 'Estado', 'Pedidos OTIF', 'Pedidos totales', 'OTIF', 'Cajas entregadas', 'Incidencias'],
    otif.meses.map(m => [
      esc(m.mes),
      m.parcial
        ? etiqueta('t-b', 'Parcial')
        : m.otif < ajustes.meta
          ? etiqueta('t-r', 'Bajo meta')
          : etiqueta('t-g', 'Cumple'),
      fmt(m.cumplidos),
      fmt(m.total),
      '<b>' + fmt(m.otif, 1) + ' %</b>',
      fmt(m.cajasEntregadas),
      m.incidencias ?? '—'
    ])
  );

  return (
    encabezado(TITULO, SUBTITULO) +
    `<div class="row no-pdf" style="justify-content:flex-end"><button class="btn p" id="pdf-diagnostico">⬇ Guardar PDF</button></div>` +
    `<div class="grid">${kpi('OTIF promedio', fmt(otif.promedio, 1) + ' %', `${fmt(otif.promedio - ajustes.meta, 1)} pp frente a la meta`, 'er')}${kpi('Meses bajo la meta', otif.bajoMeta + ' de ' + otif.completos.length, '', 'er')}${kpi('Incidencias en picking', fmt(((causas.porEtapa['Picking'] || 0) / causas.total) * 100, 1) + ' %', 'Etapa donde más se puede mejorar')}${kpi('Relación incidencias ↔ OTIF', 'R² = ' + fmt(r2 * 100, 0) + ' %', `Pendiente ${fmt(pendiente, 3)} pp por incidencia`)}${kpi('In Full (Fill Rate)', fmt(otif.inFull * 100, 2) + ' %', 'Cajas entregadas ÷ pedidas', 'ok')}</div>
<div class="card"><h2>Evolución mensual del OTIF</h2>${graficoLineas(otif.meses, ajustes.meta)}</div>
<div class="grid g2"><div class="card"><h2>¿Las incidencias explican el OTIF?</h2>${graficoDispersion(otif.puntos, regresion, ajustes.meta)}<p class="mu">Recta: OTIF = ${fmt(intercepto, 2)} ${fmt(pendiente, 4)} × incidencias. Para alcanzar ${ajustes.meta} % harían falta unas <b>${fmt(incidenciasParaLaMeta)}</b> incidencias/mes (hoy ${fmt(incidenciasPromedio)}).</p></div>
<div class="card"><h2>Causas de las incidencias (Pareto)</h2>${pareto}<p class="mu">Verde: causas que atacan los módulos. Por etapa: ${etapas}</p></div></div>
<div class="card"><h2>Detalle mensual</h2>${detalleMensual}</div>`
  );
}

// El PDF se pide en el momento del clic (no al cargar) para evitar una dependencia circular con pdf.js
function enlazar() {
  alClick('#pdf-diagnostico', () => __m["modulos/diagnostico/pdf.js"].descargarDiagnosticoPdf());
}

__e.default = {
  id: 'diag',
  titulo: 'Diagnóstico OTIF',
  icono: '∿',
  color: '#7c3aed',
  seccion: 'ANÁLISIS',
  render,
  enlazar
};


return __e;
})();

// ===== modulos/diagnostico/pdf.js =====
__m["modulos/diagnostico/pdf.js"] = (function () {
const __e = {};
// Descarga del Diagnóstico OTIF en PDF.
// Se arma la pantalla completa en un área oculta y se abre el cuadro de impresión del navegador:
// ahí se elige «Guardar como PDF». No necesita librerías externas.

const { modelo, ajustes } = __m["nucleo/estado.js"];
const diagnostico = __m["modulos/diagnostico/vista.js"].default;
const { guardarArchivo, cargarJsPdf, cargarHtml2Canvas } = __m["nucleo/csv.js"];

async function descargarDiagnosticoPdf() {
  if (!modelo.hay.otif) return;

  const area = document.getElementById('area-impresion');
  const hoy = new Date();
  area.innerHTML =
    diagnostico.render() +
    `<p class="mu pie-pdf">Copia generada el ${hoy.toLocaleDateString('es-PE')} · AXIONLOG · Meta OTIF ${ajustes.meta} %</p>`;
  area.querySelectorAll('.no-pdf').forEach(e => e.remove()); // los botones no van en el PDF
  // Se muestra fuera de la pantalla solo mientras se captura, con ancho de hoja A4
  Object.assign(area.style, {
    display: 'block', position: 'absolute', left: '-10000px', top: '0',
    width: '794px', background: '#fff', padding: '24px'
  });
  area.querySelectorAll('.tw').forEach(t => {
    t.style.maxHeight = 'none';
    t.style.overflow = 'visible';
  });
  document.body.classList.add('imprimiendo');

  try {
    const [JsPDF, html2canvas] = await Promise.all([cargarJsPdf(), cargarHtml2Canvas()]);
    // La pantalla completa se toma como imagen y se parte en páginas A4
    const lienzo = await html2canvas(area, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const doc = new JsPDF({ unit: 'pt', format: 'a4' });
    const margen = 28;
    const anchoUtil = doc.internal.pageSize.getWidth() - margen * 2;
    const altoUtil = doc.internal.pageSize.getHeight() - margen * 2;
    const escala = anchoUtil / lienzo.width; // puntos PDF por píxel del lienzo
    const pxPorPagina = Math.floor(altoUtil / escala);

    for (let y = 0, pagina = 0; y < lienzo.height; y += pxPorPagina, pagina++) {
      const trozo = document.createElement('canvas');
      trozo.width = lienzo.width;
      trozo.height = Math.min(pxPorPagina, lienzo.height - y);
      trozo.getContext('2d').drawImage(lienzo, 0, y, lienzo.width, trozo.height, 0, 0, trozo.width, trozo.height);
      if (pagina > 0) doc.addPage();
      doc.addImage(trozo.toDataURL('image/jpeg', 0.92), 'JPEG', margen, margen, anchoUtil, trozo.height * escala);
    }

    const nombre = 'Diagnostico_OTIF_' + hoy.toISOString().slice(0, 10) + '.pdf';
    await guardarArchivo(nombre, new Blob([doc.output('blob')], { type: 'application/pdf' }), 'Documento PDF', '.pdf');
  } catch (error) {
    alert('No se pudo generar el PDF. Revise la conexión a internet e intente de nuevo.');
  } finally {
    document.body.classList.remove('imprimiendo');
    area.innerHTML = '';
    area.removeAttribute('style');
  }
}

Object.defineProperty(__e, 'descargarDiagnosticoPdf', { get: () => descargarDiagnosticoPdf, enumerable: true });
return __e;
})();

// ===== modulos/datos/vista.js =====
__m["modulos/datos/vista.js"] = (function () {
const __e = {};
// Datos: aquí se conecta el Google Sheet (única vía de entrada de información) y se ve el estado de la lectura.

const { modelo, conexion, ajustes } = __m["nucleo/estado.js"];
const { planta } = __m["nucleo/planta.js"];
const { PESTANAS, idDeHoja } = __m["nucleo/hojas.js"];
const { fmt, esc } = __m["nucleo/formato.js"];
const { encabezado, etiqueta } = __m["nucleo/html.js"];
const { $, alClick } = __m["nucleo/dom.js"];
const { descargarDiagnosticoPdf } = __m["modulos/diagnostico/pdf.js"];

const TITULO = 'Datos';
const SUBTITULO = 'Toda la información entra desde su Google Sheet. Pegue el enlace y la app lo recordará.';

const MENSAJE_ESTADO = {
  sin_enlace: ['t-a', 'Sin Sheet conectado'],
  leyendo: ['t-b', 'Leyendo el Sheet…'],
  ok: ['t-g', 'Conectado · pestañas leídas'],
  parcial: ['t-a', 'Conectado con avisos · faltan pestañas'],
  error: ['t-r', 'No se pudo leer']
};

// `editable` es false para el operario: en vez del detalle técnico le indica a quién recurrir
function estadoDeLectura(editable) {
  const [clase, texto] = MENSAJE_ESTADO[conexion.estado];
  const hora = conexion.ultimaLectura
    ? ` <span class="mu">Última lectura: ${conexion.ultimaLectura.toLocaleString('es-PE')}</span>`
    : '';
  const aviso = conexion.mensaje ? `<p class="er-text">${esc(conexion.mensaje)}</p>` : '';
  const pestanas = conexion.pestanas.length
    ? `<ul class="lectura">${conexion.pestanas
        .map(
          p =>
            `<li>${p.ok ? '✔' : p.opcional ? '–' : '✘'} <b>${esc(p.nombre)}</b>${p.opcional ? ' (opcional)' : ''} · ${
              p.ok ? fmt(p.filas) + ' filas' : esc(p.error)
            }</li>`
        )
        .join('')}</ul>`
    : '';
  const pedirSupervisor =
    !editable && (!conexion.enlace || conexion.estado === 'error')
      ? '<p class="er-text">Pida al supervisor que cargue los datos.</p>'
      : '';
  return `<p>${etiqueta(clase, texto)}${hora}</p>${aviso}${pedirSupervisor}${pestanas}`;
}

function tarjetaDeEnlace(editable) {
  if (!editable) {
    return `<div class="card"><h2>Datos del Google Sheet</h2>${estadoDeLectura(false)}
<p class="mu">Los datos se leen solos del Sheet compartido por el supervisor, al abrir la app y cada 5 minutos.</p></div>`;
  }
  const leyendo = conexion.estado === 'leyendo';
  const nombres = PESTANAS.map(p => `<b>${p.nombre}</b>${p.opcional ? ' (opcional)' : ''}`).join(', ');
  const hayEnlace = !!idDeHoja(conexion.enlace);
  return `<div class="card"><h2>Conexión con Google Sheet</h2>
<label class="campo-enlace"><span>Enlace de su Google Sheet</span><input id="enlace" type="url" placeholder="https://docs.google.com/spreadsheets/d/…" value="${esc(conexion.enlace)}" autocomplete="off"></label>
<div class="row"><button class="btn p" id="conectar" ${leyendo ? 'disabled' : ''}>${conexion.enlace ? '↻ Actualizar datos' : 'Conectar'}</button><button class="btn" id="copiar-enlace" ${hayEnlace ? '' : 'disabled'}>⧉ Copiar enlace para el operario</button></div>
${estadoDeLectura(true)}
<ol class="pasos"><li>En Google Sheets, pulse <b>Compartir</b> y elija «Cualquier persona con el enlace» (lector).</li><li>El Sheet debe tener las pestañas ${nombres}, escritas así.</li><li>Copie el enlace del navegador, péguelo arriba y pulse el botón.</li></ol>
<p class="mu">El enlace queda guardado en este navegador: al abrir la app se vuelve a leer el mismo Sheet. El operario no necesita pegarlo: use «Copiar enlace para el operario» y envíeselo.</p></div>`;
}

function tarjetaDeLayout() {
  const hay = modelo.hay.layout;
  const medidas = hay
    ? `${fmt(planta.layout.ancho * planta.layout.metrosPorPixel)} m × ${fmt(planta.layout.alto * planta.layout.metrosPorPixel)} m`
    : '';
  const estado = hay
    ? `${fmt(planta.ubicaciones.length)} ubicaciones (${fmt(planta.racks.length)} de picking) · ${medidas}`
    : 'Sin layout en el Sheet (pestañas Layout y Ubicaciones)';
  const aviso = hay && planta.inaccesibles.length
    ? `<p class="er-text">${planta.inaccesibles.length} ubicaciones sin camino desde el muelle.</p>`
    : '';
  return `<div class="card"><h2>Layout de la planta</h2><p class="mu">Se crea una sola vez a partir de la imagen del plano y se pega en el Sheet.</p><p class="${hay ? 'ok2' : 'mu'}">${estado}</p>${aviso}<button class="btn p" data-go="layout">Configurar layout →</button></div>`;
}

function tarjetaDeOtif() {
  const hay = modelo.hay.otif;
  const meses = hay ? modelo.otif.meses.length : 0;
  return `<div class="card"><h2>OTIF mensual</h2><p class="mu">Pedidos entregados a tiempo y completos, mes a mes (pestaña OTIF del Sheet).</p><p class="${hay ? 'ok2' : 'mu'}">${hay ? meses + ' meses' : 'Sin datos'}</p><button class="btn p" id="pdf" ${hay ? '' : 'disabled'}>⬇ Descargar Diagnóstico OTIF (PDF)</button></div>`;
}

function render({ editable = false } = {}) {
  return (
    encabezado(TITULO, SUBTITULO) +
    tarjetaDeEnlace(editable) +
    `<div class="grid g2">${tarjetaDeLayout()}${tarjetaDeOtif()}</div>`
  );
}

function enlazar({ sincronizar, copiar }) {
  // El operario no tiene campo de enlace ni botón de conectar: solo ve el estado
  const campo = $('#enlace');
  if (campo) {
    const conectar = () => sincronizar(campo.value);
    alClick('#conectar', conectar);
    campo.onkeydown = e => {
      if (e.key === 'Enter') conectar();
    };
  }
  alClick('#copiar-enlace', boton => {
    const id = idDeHoja(conexion.enlace);
    if (!id) return;
    const enlaceOperario = `${location.origin}${location.pathname}?hoja=${id}&modo=operario`;
    copiar(enlaceOperario)
      .then(() => (boton.textContent = '✔ Enlace copiado'))
      .catch(() => (boton.textContent = 'No se pudo copiar'));
  });
  alClick('#pdf', descargarDiagnosticoPdf);
}

__e.default = {
  id: 'datos',
  titulo: 'Datos',
  icono: '▤',
  color: '#0f766e',
  seccion: 'DATOS',
  render,
  enlazar
};


return __e;
})();

// ===== modulos/ubicaciones/vista.js =====
__m["modulos/ubicaciones/vista.js"] = (function () {
const __e = {};
// Ubicaciones (slotting): plan de traslados y plano de la planta con la ocupación de las ubicaciones de picking.

const { modelo, ui } = __m["nucleo/estado.js"];
const { planta } = __m["nucleo/planta.js"];
const { fmt, esc } = __m["nucleo/formato.js"];
const { kpi, tabla, encabezado, etiqueta, etiquetaZona } = __m["nucleo/html.js"];
const { dibujarPlano } = __m["nucleo/graficos.js"];
const { descargarCsv } = __m["nucleo/csv.js"];
const { $, alClick } = __m["nucleo/dom.js"];
const { pantallaVacia } = __m["nucleo/requisitos.js"];

const TITULO = 'Ubicaciones (Slotting)';
const SUBTITULO =
  'Ubique cerca del muelle lo que más se pide y mantenga cada producto en su cámara.';

const CLASE_PRIORIDAD = { Crítica: 't-r', Alta: 't-a', Media: 't-b' };

function planDeTraslados(traslados, total, filtro, filtros) {
  const nombres = { prioridad: 'Prioridad', cliente: 'Cliente', zona: 'Zona', abc: 'ABC' };
  const opciones = (campo, valores) =>
    `<label style="display:flex;flex-direction:column;gap:2px;font-size:12px">${nombres[campo]}<select data-filtro="${campo}"><option value="">Todos</option>${valores
      .map(v => `<option value="${esc(v)}" ${filtros[campo] === v ? 'selected' : ''}>${esc(v)}</option>`)
      .join('')}</select></label>`;
  const unicos = campo => [...new Set(traslados.map(t => t[campo]).filter(Boolean))].sort();
  const coincide = t =>
    (!filtros.prioridad || t.prioridad === filtros.prioridad) &&
    (!filtros.cliente || t.cliente === filtros.cliente) &&
    (!filtros.zona || t.zona === filtros.zona) &&
    (!filtros.abc || t.abc === filtros.abc) &&
    (!filtro || (t.sku + t.descripcion).toLowerCase().includes(filtro.toLowerCase()));
  const filas = traslados.filter(coincide);
  return `<div class="card"><div class="row"><input id="filtro" placeholder="Buscar por SKU o producto…" value="${esc(filtro)}"></div><div class="row">${opciones('prioridad', ['Crítica', 'Alta', 'Media'])}${opciones('cliente', unicos('cliente'))}${opciones('zona', unicos('zona'))}${opciones('abc', ['A', 'B', 'C'])}</div><p class="mu">Mostrando ${filas.length} de ${total} SKUs</p>${tabla(
    ['Prioridad', 'SKU', 'Producto', 'Cliente', 'Zona', 'ABC', 'Rack actual', 'Rack propuesto', 'Mejora (m)', 'Motivo'],
    filas.map(t => [
      etiqueta(CLASE_PRIORIDAD[t.prioridad], t.prioridad),
      esc(t.sku),
      esc(t.descripcion),
      esc(t.cliente),
      etiquetaZona(t.zona),
      t.abc,
      '<b>' + esc(t.rack) + '</b>',
      '<b>' + esc(t.rackPropuesto) + '</b>',
      fmt(t.mejora),
      esc(t.motivo)
    ])
  )}</div>`;
}

function planoDeRacks(ubicaciones, conPlanAplicado) {
  return `<div class="card"><div class="row"><h2 style="flex:1">Ocupación de las ubicaciones de picking</h2><button class="btn ${conPlanAplicado ? '' : 'p'}" data-ocupacion="0">Situación actual</button><button class="btn ${conPlanAplicado ? 'p' : ''}" data-ocupacion="1">Con el plan aplicado</button></div>${dibujarPlano(planta, {
    ocupacion: conPlanAplicado ? ubicaciones.ocupacionPropuesta : ubicaciones.ocupacionActual
  })}</div>`;
}

// Explica en pantalla por qué hay SKUs sin ubicación o traslados que no se pueden aplicar
function avisosDelPlan(a) {
  const lineas = [];
  if (a.rackVacio) lineas.push(`${fmt(a.rackVacio)} SKUs no tienen Rack en el Inventario.`);
  if (a.sinRack) lineas.push(`${fmt(a.sinRack)} SKUs tienen un Rack que no existe en la pestaña Ubicaciones.`);
  if (a.zonasSinRacks.length)
    lineas.push(`No hay ubicaciones de picking con camino para la zona ${a.zonasSinRacks.join(', ')}: ${fmt(a.sinZonaConRacks)} SKUs no se pueden ubicar.`);
  if (a.zonaDesconocida) lineas.push(`${fmt(a.zonaDesconocida)} SKUs tienen una zona que la app no reconoce (use SECO, REFRIGERADO o CONGELADO).`);
  if (a.sinCamino) lineas.push(`${fmt(a.sinCamino)} SKUs están en racks sin camino desde el muelle: no se calcula su traslado.`);
  if (a.bloqueados) lineas.push(`${fmt(a.bloqueados)} traslados no se aplican: ningún rack de su cámara con camino tiene lugar hoy.`);
  return lineas.length
    ? `<div class="card"><h2>Avisos del plan</h2>${lineas.map(l => `<p class="er-text">${esc(l)}</p>`).join('')}</div>`
    : '';
}

function render() {
  const vacio = pantallaVacia(TITULO, SUBTITULO, ['inventario', 'layout', 'pedidos']);
  if (vacio) return vacio;

  const { catalogo, ubicaciones } = modelo;
  const { pestana, filtro, ocupacion } = ui.ubicaciones;
  const total = catalogo.skus.length;

  return (
    encabezado(TITULO, SUBTITULO, `<button class="btn" id="exportar">⬇ Exportar plan</button>`) +
    avisosDelPlan(ubicaciones.avisos) +
    `<div class="grid">${kpi('Traslados sugeridos', ubicaciones.traslados.length, `de ${total} SKUs (${fmt((ubicaciones.traslados.length / (total || 1)) * 100, 0)} %)`, 'wa')}${kpi('Riesgo térmico', ubicaciones.riesgoTermico, 'productos fuera de su cámara', 'er')}${kpi('Ahorro estimado', fmt(ubicaciones.ahorro) + ' m/sem', 'metros de recorrido si se aplican todos')}${kpi('Ubicaciones sobre su capacidad', ubicaciones.saturadosActual, 'Con el plan: ' + ubicaciones.saturadosPropuesta, 'wa')}${kpi('SKUs sin ubicación', ubicaciones.sinUbicacion, '', 'ok')}</div>
<div class="tabs"><button class="${pestana == 1 ? 'on' : ''}" data-pestana="1">Plan de traslados</button><button class="${pestana == 2 ? 'on' : ''}" data-pestana="2">Plano de la planta</button></div>` +
    (pestana == 1 ? planDeTraslados(ubicaciones.traslados, total, filtro, ui.ubicaciones.filtros) : planoDeRacks(ubicaciones, ocupacion))
  );
}

function enlazar({ refrescar }) {
  alClick('[data-pestana]', boton => {
    ui.ubicaciones.pestana = +boton.dataset.pestana;
    refrescar();
  });
  alClick('[data-ocupacion]', boton => {
    ui.ubicaciones.ocupacion = +boton.dataset.ocupacion;
    refrescar();
  });

  document.querySelectorAll('[data-filtro]').forEach(selector => {
    selector.onchange = () => {
      ui.ubicaciones.filtros[selector.dataset.filtro] = selector.value;
      refrescar();
    };
  });

  // El filtro se aplica mientras se escribe; se devuelve el cursor a su sitio al redibujar
  const campo = $('#filtro');
  if (campo) {
    campo.oninput = () => {
      ui.ubicaciones.filtro = campo.value;
      const posicion = campo.selectionStart;
      refrescar();
      const nuevo = $('#filtro');
      nuevo.focus();
      nuevo.setSelectionRange(posicion, posicion);
    };
  }

  alClick('#exportar', () =>
    descargarCsv('plan_traslados', [
      ['Prioridad', 'SKU', 'Producto', 'Rack actual', 'Rack propuesto', 'Mejora m', 'Motivo'],
      ...modelo.ubicaciones.traslados.map(t => [
        t.prioridad,
        t.sku,
        t.descripcion,
        t.rack,
        t.rackPropuesto,
        Math.round(t.mejora),
        t.motivo
      ])
    ])
  );
}

__e.default = {
  id: 'ubic',
  titulo: 'Ubicaciones',
  icono: '▦',
  color: '#d97706',
  seccion: 'MÓDULOS',
  render,
  enlazar
};


return __e;
})();

// ===== nucleo/animacion.js =====
__m["nucleo/animacion.js"] = (function () {
const __e = {};
// Animación del recorrido de picking: un punto recorre el camino parada por parada
// a la velocidad de Ajustes, se detiene a recoger y cuenta la exposición al frío.
// Se usa en Picking y en la prueba del asistente de layout.

const VELOCIDAD_ANIMACION = 30; // veces el tiempo real

// HTML de los controles (se coloca debajo del plano dibujado con `animable: true`)
const controlesDeAnimacion = () => `<div class="anim">
<div class="row"><button class="btn p" id="anim-play">▶ Reproducir</button><button class="btn" id="anim-reiniciar">↺ Reiniciar</button></div>
<input type="range" id="anim-barra" min="0" max="1000" value="0" style="width:100%">
<p id="anim-estado" class="mu"></p></div>`;

// Arma la línea de tiempo del recorrido y conecta los controles.
//   planta, recorrido ('DOCK', …paradas…, 'DOCK'), paradas
//   lineasPorParada: { ubicacion: cantidad de líneas que se recogen ahí }
//   ajustes: { vel, tpl, frioMax }
//   descripcion(ubicacion): texto corto de lo que se recoge (opcional)
function iniciarAnimacion({ planta, recorrido, paradas, lineasPorParada = {}, ajustes, descripcion = () => '' }) {
  const picker = document.getElementById('anim-picker');
  const estela = document.getElementById('anim-estela');
  const play = document.getElementById('anim-play');
  const barra = document.getElementById('anim-barra');
  if (!picker || !estela || !play || !barra || recorrido.length < 2 || !paradas.length) return null;

  const metrosPorPixel = planta.layout.metrosPorPixel;
  const velocidad = ajustes.vel; // m/s

  // --- Camino completo en puntos, con la distancia acumulada (px) en cada uno
  const puntos = [];
  const acumulado = [];
  const tramos = []; // { tipo, t0, t1, d0, d1, paso, ubicacion }
  let t = 0;
  let distancia = 0;
  const agregar = p => {
    if (puntos.length) {
      const ant = puntos[puntos.length - 1];
      distancia += Math.hypot(p.x - ant.x, p.y - ant.y);
    }
    puntos.push(p);
    acumulado.push(distancia);
  };
  const muelle = planta.nodos.DOCK;
  agregar({ x: muelle.x, y: muelle.y });

  for (let i = 1; i < recorrido.length; i++) {
    const d0 = distancia;
    planta.camino(recorrido[i - 1], recorrido[i]).forEach((p, k) => {
      if (k || puntos.length === 0) agregar(p);
      else if (Math.hypot(p.x - puntos[puntos.length - 1].x, p.y - puntos[puntos.length - 1].y) > 0) agregar(p);
    });
    const segundos = ((distancia - d0) * metrosPorPixel) / velocidad;
    tramos.push({ tipo: 'mover', t0: t, t1: t + segundos, d0, d1: distancia, paso: i, ubicacion: recorrido[i] });
    t += segundos;
    if (i <= paradas.length) {
      const espera = (lineasPorParada[recorrido[i]] || 1) * ajustes.tpl;
      tramos.push({ tipo: 'parada', t0: t, t1: t + espera, d0: distancia, d1: distancia, paso: i, ubicacion: recorrido[i] });
      t += espera;
    }
  }
  const duracion = t;

  // --- Exposición al frío: desde que llega a la primera parada fría hasta que termina la última
  const esFria = id => planta.nodos[id] && planta.nodos[id].zona !== 'SECO' && planta.nodos[id].zona !== 'DOCK';
  const paradasFrias = tramos.filter(x => x.tipo === 'parada' && esFria(x.ubicacion));
  const inicioFrio = paradasFrias.length ? paradasFrias[0].t0 : null;
  const finFrio = paradasFrias.length ? paradasFrias[paradasFrias.length - 1].t1 : null;

  // --- Posición del punto para una distancia recorrida
  const posicionEn = d => {
    let i = 1;
    while (i < puntos.length - 1 && acumulado[i] < d) i++;
    const a = puntos[i - 1];
    const b = puntos[i];
    const largo = acumulado[i] - acumulado[i - 1] || 1;
    const f = Math.min(1, Math.max(0, (d - acumulado[i - 1]) / largo));
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, indice: i };
  };
  const distanciaEn = tiempo => {
    const tramo = tramos.find(x => tiempo <= x.t1) || tramos[tramos.length - 1];
    if (tramo.tipo === 'parada') return tramo.d0;
    const f = tramo.t1 > tramo.t0 ? (tiempo - tramo.t0) / (tramo.t1 - tramo.t0) : 1;
    return tramo.d0 + (tramo.d1 - tramo.d0) * Math.min(1, Math.max(0, f));
  };

  const estado = document.getElementById('anim-estado');

  let ahora = 0; // segundos simulados
  const dibujar = () => {
    const d = distanciaEn(ahora);
    const pos = posicionEn(d);
    picker.setAttribute('transform', `translate(${pos.x},${pos.y})`);
    const trazo = puntos.slice(0, pos.indice).map(p => `${p.x},${p.y}`);
    trazo.push(`${pos.x},${pos.y}`);
    estela.setAttribute('points', trazo.join(' '));
    barra.value = duracion ? Math.round((ahora / duracion) * 1000) : 0;

    const tramo = tramos.find(x => ahora <= x.t1) || tramos[tramos.length - 1];
    if (ahora >= duracion) {
      estado.textContent = 'Pedido armado y de regreso en el muelle.';
    } else if (tramo.tipo === 'parada') {
      estado.textContent = `Parada ${tramo.paso} de ${paradas.length} · recogiendo en ${tramo.ubicacion} ${descripcion(tramo.ubicacion)}`;
    } else if (tramo.paso > paradas.length) {
      estado.textContent = 'Regresando al muelle.';
    } else {
      estado.textContent = `Camino a la parada ${tramo.paso} de ${paradas.length} · ${tramo.ubicacion} (${planta.nodos[tramo.ubicacion].zona})`;
    }

  };

  // --- Reproducción
  let reproduciendo = false;
  let ultimo = 0;
  const cuadro = marca => {
    if (!reproduciendo) return;
    if (!picker.isConnected) {
      reproduciendo = false; // se cambió de pantalla
      return;
    }
    const factor = VELOCIDAD_ANIMACION;
    ahora = Math.min(duracion, ahora + ((marca - ultimo) / 1000) * factor);
    ultimo = marca;
    dibujar();
    if (ahora >= duracion) {
      reproduciendo = false;
      play.textContent = '▶ Reproducir';
      return;
    }
    requestAnimationFrame(cuadro);
  };
  const reproducir = () => {
    if (ahora >= duracion) ahora = 0;
    reproduciendo = true;
    play.textContent = '⏸ Pausar';
    ultimo = performance.now();
    requestAnimationFrame(cuadro);
  };
  const pausar = () => {
    reproduciendo = false;
    play.textContent = '▶ Reproducir';
  };

  play.onclick = () => (reproduciendo ? pausar() : reproducir());
  document.getElementById('anim-reiniciar').onclick = () => {
    pausar();
    ahora = 0;
    dibujar();
  };
  barra.oninput = () => {
    ahora = (barra.value / 1000) * duracion;
    dibujar();
  };
  dibujar();
  return { reproducir, pausar, duracion };
}

Object.defineProperty(__e, 'controlesDeAnimacion', { get: () => controlesDeAnimacion, enumerable: true });
Object.defineProperty(__e, 'iniciarAnimacion', { get: () => iniciarAnimacion, enumerable: true });
return __e;
})();

// ===== modulos/picking/vista.js =====
__m["modulos/picking/vista.js"] = (function () {
const __e = {};
// Picking · Rutas: elegir un pedido, ver su recorrido en la planta y descargar la hoja de picking.

const { modelo, ajustes, ui } = __m["nucleo/estado.js"];
const { planta } = __m["nucleo/planta.js"];
const { fmt, mmss, esc } = __m["nucleo/formato.js"];
const { kpi, tabla, encabezado, etiqueta, etiquetaZona, estadoVacio } = __m["nucleo/html.js"];
const { dibujarPlano } = __m["nucleo/graficos.js"];
const { controlesDeAnimacion, iniciarAnimacion } = __m["nucleo/animacion.js"];
const { descargarCsv, guardarArchivo, cargarJsPdf } = __m["nucleo/csv.js"];
const { $, alClick, alCambiar } = __m["nucleo/dom.js"];
const { pantallaVacia } = __m["nucleo/requisitos.js"];
const { METODOS, calcularRuta } = __m["modulos/picking/calculo.js"];

const TITULO = 'Picking · Rutas';
const SUBTITULO =
  'Elija un pedido y el sistema calcula el recorrido respetando la cadena de frío: muelle → seco → refrigerado → congelado → muelle.';
const PEDIDOS_EN_LISTA = 400;

// --- Estado de los pedidos: con Fecha entrega = Completado; sin Fecha entrega = Pendiente.
// Un Completado se puede devolver a Pendientes; esa marca se guarda en este navegador.
const CLAVE_REABIERTOS = 'axionlog.pedidosDevueltos';

function pedidosDevueltos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE_REABIERTOS) || '[]');
    return new Set(Array.isArray(lista) ? lista.map(String) : []);
  } catch (error) {
    return new Set(); // sin acceso a localStorage: se muestran solo los estados de las fechas
  }
}

function guardarPedidosDevueltos(conjunto) {
  try {
    localStorage.setItem(CLAVE_REABIERTOS, JSON.stringify([...conjunto]));
  } catch (error) {
    alert('No se pudo guardar el cambio en este navegador.');
  }
}

// Pedidos separados en Pendientes y Completados (y cuántos hay de cada uno)
function pedidosPorEstado() {
  const devueltos = pedidosDevueltos();
  const pendientes = [];
  const completados = [];
  modelo.catalogo.pedidos.forEach(p => {
    const tieneEntrega = !Number.isNaN(p.marcaEntrega) && !devueltos.has(String(p.id));
    (tieneEntrega ? completados : pendientes).push(p);
  });
  return { pendientes, completados };
}

// Pedido elegido, método y ubicaciones con los que se calcula la ruta
function seleccion() {
  const { ubicaciones } = modelo;
  const { pendientes, completados } = pedidosPorEstado();
  const pedidos = (ui.picking.estado === 'completados' ? completados : pendientes).slice(0, PEDIDOS_EN_LISTA);
  const elegido = ui.picking.pedido || (pedidos[0] && pedidos[0].id);
  return {
    pedidos,
    conteos: { pendientes: pendientes.length, completados: completados.length },
    pedido: pedidos.find(p => p.id == elegido) || pedidos[0],
    metodo: 'zonas',
    ubicaciones: ui.picking.plan ? ubicaciones.propuesta : ubicaciones.actual
  };
}

function tabsDeEstado(conteos) {
  const estado = ui.picking.estado;
  return (
    `<div class="tabs">` +
    `<button class="${estado === 'pendientes' ? 'on' : ''}" data-estado="pendientes">Pendientes (${fmt(conteos.pendientes)})</button>` +
    `<button class="${estado === 'completados' ? 'on' : ''}" data-estado="completados">Completados (${fmt(conteos.completados)})</button></div>`
  );
}

const contextoDeRutas = () => ({ porSku: modelo.catalogo.porSku, planta, ajustes });

function render() {
  const vacio = pantallaVacia(TITULO, SUBTITULO, ['inventario', 'pedidos', 'layout']);
  if (vacio) return vacio;

  const { pedidos, pedido, metodo, ubicaciones, conteos } = seleccion();
  if (!pedido) {
    const mensaje = ui.picking.estado === 'completados' ? 'No hay pedidos completados' : 'No hay pedidos pendientes';
    return (
      encabezado(TITULO, SUBTITULO) +
      tabsDeEstado(conteos) +
      estadoVacio(mensaje, 'Revise la pestaña Pedidos de su Sheet y la fecha de corte en Ajustes.')
    );
  }

  if (ui.picking.estado === 'completados') return vistaCompletados(conteos);

  const ruta = calcularRuta(pedido, metodo, ubicaciones, contextoDeRutas());
  const dentroDelLimite = ruta.exposicionFrio / 60 <= ajustes.frioMax;
  const sinRecorrido = ruta.paradas.length === 0; // ningún SKU del pedido se puede ubicar en el plano
  const conPlan = ui.picking.plan;
  const maximizado = ui.picking.recorridoMaximizado === true;

  const elegir =
    `<div class="card"><h2>1 · Elija el pedido</h2>` +
    `<select id="pedido" style="width:100%">${pedidos.map(p => `<option value="${esc(p.id)}" ${p.id == pedido.id ? 'selected' : ''}>${esc(p.id)} · ${esc(p.tienda)} · ${p.lineas.length} líneas</option>`).join('')}</select>` +
    `<p class="mu">Completados: pedidos con fecha de entrega. Pendientes: pedidos sin fecha de entrega. Se muestran los ${PEDIDOS_EN_LISTA} más recientes.</p></div>`;

  const plan =
    `<div class="card"><h2>Plan de distribución</h2><div class="tabs"><button class="${conPlan ? '' : 'on'}" data-plan="0">Ubicaciones actuales</button><button class="${conPlan ? 'on' : ''}" data-plan="1">Con plan aplicado</button></div></div>`;

  return (
    encabezado(TITULO, SUBTITULO) +
    tabsDeEstado(conteos) +
    `<div class="picking-top${maximizado ? ' maximizado' : ''}"><div class="picking-izq">${elegir}${plan}` +
    `<div class="grid kpis-compactos">${kpi('Distancia total', fmt(ruta.distancia) + ' m', 'ida y vuelta al muelle', 'ac')}${kpi('Tiempo de armado', mmss(ruta.tiempo), ajustes.vel + ' m/s + ' + ajustes.tpl + ' s por línea', 'wa')}${kpi('Exposición al frío', mmss(ruta.exposicionFrio), `Límite ${ajustes.frioMax} min · ${dentroDelLimite ? 'dentro' : 'EXCEDIDO'}`, dentroDelLimite ? 'ok' : 'er')}${kpi('Paradas y líneas', ruta.paradas.length + ' / ' + ruta.nLineas, 'racks a visitar / líneas', 'vi')}</div></div>` +
    `<div class="recorrido-bloque">${sinRecorrido ? '' : `<div class="card controles-recorrido">${controlesDeAnimacion()}</div>`}<div class="card recorrido-caja"><div class="row" style="align-items:center"><h2 style="flex:1">Recorrido en la planta</h2><button class="btn" data-maximizar="${maximizado ? 0 : 1}">${maximizado ? 'Restaurar' : 'Maximizar'}</button></div>${sinRecorrido ? '<p class="mu">Este pedido no tiene SKUs que se puedan recorrer: sus Racks no están en la pestaña Ubicaciones o no tienen camino desde el muelle. Revise los avisos de la pantalla Ubicaciones.</p>' : ''}<div class="plano-wrap">${dibujarPlano(planta, { recorrido: ruta.recorrido, paradas: ruta.paradas, animable: true })}</div></div></div></div>` +
    `<div class="card"><div class="row"><h2 style="flex:1">Hoja de picking</h2><button class="btn p" id="exportar">⬇ Exportar CSV</button><button class="btn" id="imprimir">Guardar PDF</button></div>${tabla(
      ['Paso', 'Rack', 'Zona', 'SKU', 'Producto', 'Cantidad'],
      ruta.hoja.map(h => [h[0], '<b>' + esc(h[1]) + '</b>', etiquetaZona(h[2]), esc(h[3]), esc(h[4]), esc(h[5])])
    )}</div>`
  );
}

// Pedidos completados: buscador, filtros por cliente y tienda, y tabla paginada (40 por página)
const FILAS_POR_PAGINA = 40;
const fechaDe = marca => (marca == null || Number.isNaN(marca) ? '—' : new Date(marca).toLocaleDateString('es-PE', { timeZone: 'UTC' }));

function filtrarCompletados(lista) {
  const { buscar, filtros } = ui.picking;
  const texto = String(buscar || '').trim().toLowerCase();
  return lista.filter(
    p =>
      (!filtros.cliente || p.cliente === filtros.cliente) &&
      (!filtros.tienda || p.tienda === filtros.tienda) &&
      (!texto || `${p.id} ${p.cliente} ${p.tienda}`.toLowerCase().includes(texto))
  );
}

const selectorPick = (campo, nombre, valores, actual) =>
  `<label>${nombre}<select data-filtro-pick="${campo}"><option value="">Todos</option>${valores
    .map(v => `<option value="${esc(v)}" ${actual === v ? 'selected' : ''}>${esc(v)}</option>`)
    .join('')}</select></label>`;

function vistaCompletados(conteos) {
  const todos = pedidosPorEstado().completados;
  const lista = filtrarCompletados(todos);
  const paginas = Math.max(1, Math.ceil(lista.length / FILAS_POR_PAGINA));
  const pagina = Math.min(Math.max(1, ui.picking.pagina || 1), paginas);
  const inicio = (pagina - 1) * FILAS_POR_PAGINA;
  const filas = lista.slice(inicio, inicio + FILAS_POR_PAGINA);
  const unicos = campo => [...new Set(todos.map(p => p[campo]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'es'));
  const f = ui.picking.filtros;

  return (
    encabezado(TITULO, SUBTITULO) +
    tabsDeEstado(conteos) +
    `<div class="barra-filtros"><input id="filtro-pick" class="buscar" placeholder="Buscar por pedido, cliente o tienda…" value="${esc(ui.picking.buscar || '')}"><div class="campos">${selectorPick('cliente', 'Cliente', unicos('cliente'), f.cliente)}${selectorPick('tienda', 'Tienda', unicos('tienda'), f.tienda)}</div></div>` +
    `<div class="card"><p class="mu">${fmt(lista.length)} de ${fmt(todos.length)} pedidos completados</p>` +
    (filas.length
      ? tabla(
          ['Pedido', 'Fecha pedido', 'Cliente', 'Tienda', 'Fecha entrega', ''],
          filas.map(p => [
            '<b>' + esc(p.id) + '</b>',
            fechaDe(p.marca),
            esc(p.cliente),
            esc(p.tienda),
            fechaDe(p.marcaEntrega),
            `<button class="btn" data-devolver="${esc(p.id)}">Devolver a Pendientes</button>`
          ])
        ) +
        `<div class="row" style="align-items:center;justify-content:space-between;margin-top:14px"><button class="btn" data-pagina="-1" ${pagina <= 1 ? 'disabled' : ''}>‹ Anterior</button><b>Página ${pagina} de ${paginas}</b><button class="btn" data-pagina="1" ${pagina >= paginas ? 'disabled' : ''}>Siguiente ›</button></div>`
      : estadoVacio('Ningún pedido coincide', 'Cambie el buscador o quite los filtros.')) +
    `</div>`
  );
}

// Conecta la animación del recorrido con la ruta que se está mostrando
function animarRecorrido() {
  if (!$('#anim-picker')) return; // la pantalla está mostrando un aviso en vez del plano
  const { pedido, metodo, ubicaciones } = seleccion();
  if (!pedido) return;
  const ruta = calcularRuta(pedido, metodo, ubicaciones, contextoDeRutas());
  const lineasPorParada = {};
  const productos = {};
  ruta.hoja.forEach(([, rack, , , producto]) => {
    lineasPorParada[rack] = (lineasPorParada[rack] || 0) + 1;
    (productos[rack] ||= []).push(producto);
  });
  iniciarAnimacion({
    planta,
    recorrido: ruta.recorrido,
    paradas: ruta.paradas,
    lineasPorParada,
    ajustes,
    descripcion: rack => '(' + productos[rack].join(', ') + ')'
  });
}

// --- Hoja de picking en PDF (formato de la hoja de ejemplo)
const UNIDADES_PDF = { CJ: 'Caja', UN: 'Unidad', BT: 'Botella', BO: 'Bolsa', LT: 'Litro', GM: 'Galón', RL: 'Rollo', KG: 'Kilo' };
const unidadPdf = codigo => (UNIDADES_PDF[codigo] ? `${UNIDADES_PDF[codigo]} (${codigo})` : codigo || '');

async function descargarHojaPdf() {
  const { pedido, metodo, ubicaciones } = seleccion();
  if (!pedido) return;
  const ruta = calcularRuta(pedido, metodo, ubicaciones, contextoDeRutas());

  let JsPDF;
  try {
    JsPDF = await cargarJsPdf();
  } catch (error) {
    alert('No se pudo preparar el PDF. Revise la conexión a internet e intente de nuevo.');
    return;
  }

  const doc = new JsPDF({ unit: 'pt', format: 'a4' });
  const margen = 40;
  const fecha = pedido.fecha instanceof Date ? pedido.fecha.toLocaleDateString('es-PE') : String(pedido.fecha || '');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Pedido ${pedido.id} · ${pedido.tienda} · ${fecha}`, margen, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 100, 115);
  doc.text(`Método: ${METODOS[metodo]}`, margen, 68);
  doc.text(`Distancia ${fmt(ruta.distancia)} m · Tiempo estimado ${mmss(ruta.tiempo)} · Exposición al frío ${mmss(ruta.exposicionFrio)}`, margen, 82);
  doc.text('Orden obligatorio: Seco > Frío > Congelado', margen, 96);

  doc.autoTable({
    startY: 116,
    head: [['Sec.', 'Rack', 'Zona', 'SKU', 'Producto', 'Cantidad y unidad', 'OK']],
    body: ruta.hoja.map(h => [h[0], h[1], h[2], h[3], h[4], `${fmt(h[5])} ${unidadPdf(h[6])}`, '']),
    margin: { left: margen, right: margen },
    styles: { fontSize: 8, cellPadding: 4, textColor: [0, 0, 0], lineColor: [200, 205, 215], lineWidth: 0.4 },
    headStyles: { fillColor: [31, 56, 100], textColor: [255, 255, 255], halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 30 },
      5: { halign: 'right' },
      6: { halign: 'center', cellWidth: 26 }
    },
    didDrawCell: data => {
      if (data.section === 'body' && data.column.index === 6) {
        const lado = 8;
        doc.rect(data.cell.x + (data.cell.width - lado) / 2, data.cell.y + (data.cell.height - lado) / 2, lado, lado);
      }
    },
    didDrawPage: data => {
      doc.setFontSize(8);
      doc.setTextColor(90, 100, 115);
      doc.text(String(data.pageNumber), doc.internal.pageSize.getWidth() - margen, doc.internal.pageSize.getHeight() - 24, { align: 'right' });
    }
  });

  const pdf = doc.output('blob');
  await guardarArchivo('Hoja_de_picking.pdf', new Blob([pdf], { type: 'application/pdf' }), 'Documento PDF', '.pdf');
}

function enlazar({ refrescar }) {
  alCambiar('#pedido', valor => {
    ui.picking.pedido = valor;
    refrescar();
  });
  alClick('[data-plan]', boton => {
    ui.picking.plan = +boton.dataset.plan;
    refrescar();
  });
  alClick('[data-estado]', boton => {
    ui.picking.estado = boton.dataset.estado;
    ui.picking.pedido = '';
    ui.picking.pagina = 1;
    refrescar();
  });
  alClick('[data-devolver]', boton => {
    const devueltos = pedidosDevueltos();
    devueltos.add(boton.dataset.devolver);
    guardarPedidosDevueltos(devueltos);
    refrescar();
  });
  alClick('[data-maximizar]', boton => {
    ui.picking.recorridoMaximizado = boton.dataset.maximizar === '1';
    refrescar();
  });
  alClick('[data-pagina]', boton => {
    ui.picking.pagina = (ui.picking.pagina || 1) + Number(boton.dataset.pagina);
    refrescar();
  });

  document.querySelectorAll('[data-filtro-pick]').forEach(selector => {
    selector.onchange = () => {
      ui.picking.filtros[selector.dataset.filtroPick] = selector.value;
      ui.picking.pagina = 1;
      refrescar();
    };
  });
  const filtroPick = document.querySelector('#filtro-pick');
  if (filtroPick) {
    filtroPick.oninput = () => {
      ui.picking.buscar = filtroPick.value;
      ui.picking.pagina = 1;
      const posicion = filtroPick.selectionStart;
      refrescar();
      const nuevo = document.querySelector('#filtro-pick');
      nuevo.focus();
      nuevo.setSelectionRange(posicion, posicion);
    };
  }
  alClick('#exportar', () => {
    const { pedido, metodo, ubicaciones } = seleccion();
    const ruta = calcularRuta(pedido, metodo, ubicaciones, contextoDeRutas());
    descargarCsv('hoja_picking_' + pedido.id, [
      ['Paso', 'Rack', 'Zona', 'SKU', 'Producto', 'Cantidad'],
      ...ruta.hoja
    ]);
  });
  alClick('#imprimir', () => descargarHojaPdf());
  animarRecorrido();
}

__e.default = {
  id: 'pick',
  titulo: 'Picking',
  icono: '⇢',
  color: '#0e7490',
  seccion: 'MÓDULOS',
  render,
  enlazar
};


return __e;
})();

// ===== modulos/inventario/vista.js =====
__m["modulos/inventario/vista.js"] = (function () {
const __e = {};
// Inventario y compras: plan de compras, diferencias de inventario y conteo cíclico semanal.

const { modelo, ajustes, ui } = __m["nucleo/estado.js"];
const { fmt, pc, sol, esc } = __m["nucleo/formato.js"];
const { kpi, tabla, encabezado, etiqueta, etiquetaZona } = __m["nucleo/html.js"];
const { descargarCsv } = __m["nucleo/csv.js"];
const { alClick } = __m["nucleo/dom.js"];
const { pantallaVacia } = __m["nucleo/requisitos.js"];

const TITULO = 'Inventario y compras';
const SUBTITULO = 'Qué reponer, cuánto pedir y qué contar esta semana.';

const CLASE_ESTADO = { PEDIR: ['t-r', 'PEDIR HOY'], PRONTO: ['t-a', 'PRONTO'], PROXIMO: ['t-b', 'PRÓXIMO'], OK: ['t-b', 'SIN URGENCIA'] };

// Cuándo llegaría cada SKU a su punto de reorden: días = (stock − punto de reorden) ÷ demanda diaria
// Solo se muestran los SKUs que hay que comprar hasta fin de este mes
const HORIZONTES = ['Hoy', 'En 2 días', 'Esta semana', 'En 2 semanas', 'Este mes'];
// Stock que quedaría al cierre del mes si la venta sigue al ritmo diario de Pedidos
const diasHastaFinDeMes = hoy => Math.max(0, (new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59) - hoy) / 86400000);
const stockFinDeMes = (s, hoy) => Math.max(0, s.stockActual - s.demandaDiaria * diasHastaFinDeMes(hoy));
// Lo que hay que comprar para cerrar el mes con el stock de seguridad (0 si no hace falta)
// Se redondea al múltiplo del tamaño de lote del SKU
const faltaParaFinDeMes = (s, hoy) => {
  const falta = Math.max(0, s.stockSeguridad - stockFinDeMes(s, hoy));
  return falta ? Math.ceil(falta / s.lote) * s.lote : 0;
};

function horizonteDeSku(s, hoy = new Date()) {
  if (!(s.demandaDiaria > 0)) return null;
  const dias = Math.max(0, (s.stockActual - s.puntoReorden) / s.demandaDiaria);
  const fecha = new Date(hoy.getTime() + dias * 86400000);
  const finEsteMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
  let nombre = null;
  if (dias <= 0) nombre = 'Hoy';
  else if (dias <= 2) nombre = 'En 2 días';
  else if (dias <= 7) nombre = 'Esta semana';
  else if (dias <= 15) nombre = 'En 2 semanas'; // 15 días máximo
  // Este mes: de 15 días hasta fin de mes
  else if (fecha <= finEsteMes) nombre = 'Este mes';
  return nombre ? { nombre, dias, fecha } : null;
}
const CONTEO_POR_SEMANA = 40;

const NOMBRES_FILTRO_INV = { cuando: 'Cuándo pedir', cliente: 'Cliente', zona: 'Zona', abc: 'ABC' };
const selectorFiltro = (campo, valores, actual) =>
  `<label>${NOMBRES_FILTRO_INV[campo]}<select data-filtro-inv="${campo}"><option value="">Todos</option>${valores
    .map(v => `<option value="${esc(v)}" ${actual === v ? 'selected' : ''}>${esc(v)}</option>`)
    .join('')}</select></label>`;

const selectorFiltroDif = (campo, valores, actual) =>
  `<label>${NOMBRES_FILTRO_INV[campo]}<select data-filtro-dif="${campo}"><option value="">Todos</option>${valores
    .map(v => `<option value="${esc(v)}" ${actual === v ? 'selected' : ''}>${esc(v)}</option>`)
    .join('')}</select></label>`;

function planDeCompras(inventario) {
  const f = ui.inventario.filtros;
  const hoy = new Date();
  // Solo SKUs con demanda (sin demanda no hay reposición que calcular), con su horizonte de compra
  const universo = inventario.filas.filter(s => s.demandaDiaria > 0);
  const unicos = campo => [...new Set(universo.map(s => s[campo]).filter(Boolean))].sort();
  const conHorizonte = universo.map(s => ({ s, h: horizonteDeSku(s, hoy) })).filter(({ h }) => h);
  const texto = (ui.inventario.filtroPlan || '').trim().toLowerCase();
  const filas = conHorizonte
    .filter(
      ({ s, h }) =>
        (!f.cuando || h.nombre === f.cuando) &&
        (!f.zona || s.zona === f.zona) &&
        (!f.cliente || s.cliente === f.cliente) &&
        (!f.abc || s.abc === f.abc) &&
        (!texto || (s.sku + ' ' + s.descripcion).toLowerCase().includes(texto))
    )
    .sort((a, b) => HORIZONTES.indexOf(a.h.nombre) - HORIZONTES.indexOf(b.h.nombre) || (a.h.dias ?? 0) - (b.h.dias ?? 0));
  const fechaTexto = h => (h.fecha ? (h.dias <= 0 ? 'Hoy' : h.fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })) : '—');
  return (
    `<div class="barra-filtros"><input id="filtro-plan" class="buscar" placeholder="Buscar por SKU o producto…" value="${esc(ui.inventario.filtroPlan || '')}"><div class="campos">${selectorFiltro('cuando', HORIZONTES, f.cuando)}${selectorFiltro('cliente', unicos('cliente'), f.cliente)}${selectorFiltro('zona', unicos('zona'), f.zona)}${selectorFiltro('abc', ['A', 'B', 'C'], f.abc)}</div></div>` +
    `<p class="mu">Mostrando ${filas.length} SKUs que hay que comprar hasta fin de este mes.</p>` +
    tabla(
      ['Decisión', 'Cuándo pedir', 'Pedir antes del', 'SKU', 'Producto', 'Zona', 'Un.', 'Stock hoy', 'Venta diaria', 'Stock a fin de mes', 'Stock seguridad', 'Falta comprar', 'Inversión'],
      filas.map(({ s, h }) => [
        etiqueta(CLASE_ESTADO[s.estado][0], CLASE_ESTADO[s.estado][1]),
        h.nombre,
        fechaTexto(h),
        esc(s.sku),
        esc(s.descripcion),
        etiquetaZona(s.zona),
        esc(s.um),
        fmt(s.stockActual),
        fmt(s.demandaDiaria, 1),
        fmt(stockFinDeMes(s, hoy)),
        fmt(s.stockSeguridad),
        fmt(faltaParaFinDeMes(s, hoy)),
        sol(faltaParaFinDeMes(s, hoy) * s.costo)
      ])
    )
  );
}

function diferenciasDeInventario(inventario) {
  const f = ui.inventario.filtrosDif;
  const texto = (ui.inventario.filtroDif || '').trim().toLowerCase();
  const unicos = campo => [...new Set(inventario.diferencias.map(s => s[campo]).filter(Boolean))].sort();
  const mayorValorPrimero = inventario.diferencias
    .filter(
      s =>
        (!f.cliente || s.cliente === f.cliente) &&
        (!f.zona || s.zona === f.zona) &&
        (!f.abc || s.abc === f.abc) &&
        (!texto || (s.sku + ' ' + s.descripcion).toLowerCase().includes(texto))
    )
    .sort(
      (a, b) =>
        Math.abs(b.stockFisico - b.stockSistema) * b.costo -
        Math.abs(a.stockFisico - a.stockSistema) * a.costo
    );
  return (
    `<div class="barra-filtros"><input id="filtro-dif" class="buscar" placeholder="Buscar por SKU o producto…" value="${esc(ui.inventario.filtroDif || '')}"><div class="campos">${selectorFiltroDif('cliente', unicos('cliente'), f.cliente)}${selectorFiltroDif('zona', unicos('zona'), f.zona)}${selectorFiltroDif('abc', ['A', 'B', 'C'], f.abc)}</div></div>` +
    `<p class="mu">${mayorValorPrimero.length} SKUs con diferencia entre el sistema y el conteo físico, ordenados por impacto.</p>` +
    tabla(
      ['Tipo', 'SKU', 'Producto', 'Cliente', 'ABC', 'Zona', 'Sistema', 'Físico', 'Diferencia', 'Valor (S/)', 'Rack'],
      mayorValorPrimero.map(s => {
        const diferencia = s.stockFisico - s.stockSistema;
        return [
          diferencia < 0 ? etiqueta('t-r', 'Faltante') : etiqueta('t-b', 'Sobrante'),
          esc(s.sku),
          esc(s.descripcion),
          esc(s.cliente),
          s.abc,
          etiquetaZona(s.zona),
          fmt(s.stockSistema),
          fmt(s.stockFisico),
          `<b class="${diferencia < 0 ? 'wn' : 'ok2'}">${diferencia > 0 ? '+' : ''}${diferencia}</b>`,
          sol(diferencia * s.costo),
          esc(s.rack)
        ];
      })
    )
  );
}

function conteoCiclico(inventario) {
  const lista = inventario.conteoSemanal.map((s, i) => ({ ...s, orden: i + 1 }));
  const semanas = Math.max(1, Math.ceil(lista.length / CONTEO_POR_SEMANA));
  const semana = Math.min(Math.max(1, ui.inventario.semanaConteo || 1), semanas);
  const desde = (semana - 1) * CONTEO_POR_SEMANA;
  const texto = (ui.inventario.filtroConteo || '').trim().toLowerCase();
  // Con texto en el buscador se muestran los SKUs que coinciden (de toda la lista); sin texto, la semana elegida
  const filas = texto
    ? lista.filter(s => (s.sku + ' ' + s.descripcion).toLowerCase().includes(texto))
    : lista.slice(desde, desde + CONTEO_POR_SEMANA);
  const resumen = texto
    ? `Mostrando ${filas.length} SKUs que coinciden con «${esc(texto)}»`
    : `Página ${semana}: SKUs ${desde + 1}–${Math.min(lista.length, desde + CONTEO_POR_SEMANA)}. Se cuentan primero los SKUs con diferencia y mayor valor, luego los de alta rotación (clase A).`;
  // Próximo conteo físico: fecha de la foto del stock + frecuencia (Ajustes)
  let proximo = 'Próximo conteo físico: ponga la fecha de la foto del stock en Ajustes.';
  if (ajustes.fotoStock) {
    const f = String(ajustes.fotoStock);
    const fecha = new Date(+f.slice(0, 4), +f.slice(4, 6) - 1, +f.slice(6, 8));
    fecha.setDate(fecha.getDate() + ajustes.frecuenciaConteo);
    proximo = `Próximo conteo físico: ${fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}.`;
  }
  const navegacion =
    `<div class="row" style="align-items:center;justify-content:space-between;margin-top:14px">` +
    `<button class="btn" data-semana-nav="-1" ${semana <= 1 || texto ? 'disabled' : ''}>‹ Anterior</button>` +
    `<b>${texto ? 'Búsqueda' : `Página ${semana} de ${semanas}`}</b>` +
    `<button class="btn" data-semana-nav="1" ${semana >= semanas || texto ? 'disabled' : ''}>Siguiente ›</button></div>`;
  return (
    `<div class="barra-filtros"><input id="filtro-conteo" class="buscar" placeholder="Buscar por SKU o producto…" value="${esc(ui.inventario.filtroConteo || '')}"></div>` +
    `<p class="mu">${resumen}</p>` +
    (texto ? '' : `<p class="mu">${proximo}</p>`) +
    tabla(
      ['Orden', 'SKU', 'Producto', 'Zona', 'Rack', 'ABC', 'Stock sistema', 'Conteo físico', 'Diferencia', 'Valor dif.', 'Motivo'],
      filas.map(s => {
        // Sin conteo físico no hay diferencia: se deja en blanco (—) en lugar de suponer un valor
        const tieneConteo = s.stockFisico !== null;
        const diferencia = tieneConteo ? s.stockFisico - s.stockSistema : null;
        return [
          s.orden,
          esc(s.sku),
          esc(s.descripcion),
          etiquetaZona(s.zona),
          esc(s.rack),
          s.abc,
          fmt(s.stockSistema),
          tieneConteo ? fmt(s.stockFisico) : '—',
          diferencia === null ? '—' : `<b class="${diferencia < 0 ? 'wn' : diferencia > 0 ? 'ok2' : ''}">${diferencia > 0 ? '+' : ''}${diferencia}</b>`,
          diferencia === null ? '—' : sol(diferencia * s.costo),
          s.motivo
        ];
      })
    ) +
    navegacion
  );
}

function render() {
  const vacio = pantallaVacia(TITULO, SUBTITULO, ['inventario']);
  if (vacio) return vacio;

  const { inventario, catalogo } = modelo;
  const pestana = ui.inventario.pestana;
  const contenido = [planDeCompras, diferenciasDeInventario, conteoCiclico][pestana - 1](inventario);

  return (
    encabezado(TITULO, SUBTITULO, `<button class="btn p" id="exportar">⬇ Exportar pestaña actual</button>`) +
    `<div class="grid">${kpi('ERI por SKU', pc(inventario.eri), `Meta ${ajustes.eri} % · ${inventario.contados - inventario.diferencias.length} de ${inventario.contados} sin diferencia`, inventario.eri * 100 < ajustes.eri ? 'er' : 'ok')}${kpi('ERI valorizado', pc(inventario.eriValorizado), 'Diferencia absoluta ' + sol(inventario.valorDiferenciaAbsoluta))}${kpi('Faltantes / sobrantes', inventario.faltantes + ' / ' + inventario.sobrantes, 'Neto ' + sol(inventario.diferenciaNeta), 'wa')}${kpi('SKUs a reponer hoy', inventario.pedir.length, inventario.pronto + ' más pronto', 'er')}${kpi('Inversión inmediata', sol(inventario.pedir.reduce((t, s) => t + s.inversion, 0)), 'para cubrir lo urgente')}</div><div class="tabs"><button class="${pestana == 1 ? 'on' : ''}" data-pestana="1">Plan de compras</button><button class="${pestana == 2 ? 'on' : ''}" data-pestana="2">Diferencias de inventario (${inventario.diferencias.length})</button><button class="${pestana == 3 ? 'on' : ''}" data-pestana="3">Conteo cíclico semanal</button></div><div class="card">${contenido}</div>`
  );
}

function enlazar({ refrescar }) {
  alClick('[data-pestana]', boton => {
    ui.inventario.pestana = +boton.dataset.pestana;
    refrescar();
  });
  document.querySelectorAll('[data-filtro-inv]').forEach(selector => {
    selector.onchange = () => {
      ui.inventario.filtros[selector.dataset.filtroInv] = selector.value;
      refrescar();
    };
  });
  alClick('[data-semana]', boton => {
    ui.inventario.semanaConteo = +boton.dataset.semana;
    refrescar();
  });
  alClick('[data-semana-nav]', boton => {
    const semanas = Math.max(1, Math.ceil(modelo.inventario.conteoSemanal.length / CONTEO_POR_SEMANA));
    const nueva = (ui.inventario.semanaConteo || 1) + +boton.dataset.semanaNav;
    ui.inventario.semanaConteo = Math.min(semanas, Math.max(1, nueva));
    refrescar();
  });
  document.querySelectorAll('[data-filtro-dif]').forEach(selector => {
    selector.onchange = () => {
      ui.inventario.filtrosDif[selector.dataset.filtroDif] = selector.value;
      refrescar();
    };
  });
  // Buscador de diferencias: se aplica mientras se escribe, con el cursor en su sitio
  const filtroDif = document.querySelector('#filtro-dif');
  if (filtroDif) {
    filtroDif.oninput = () => {
      ui.inventario.filtroDif = filtroDif.value;
      const posicion = filtroDif.selectionStart;
      refrescar();
      const nuevo = document.querySelector('#filtro-dif');
      nuevo.focus();
      nuevo.setSelectionRange(posicion, posicion);
    };
  }
  // Buscador del plan de compras: igual que el del conteo, se aplica mientras se escribe
  const filtroPlan = document.querySelector('#filtro-plan');
  if (filtroPlan) {
    filtroPlan.oninput = () => {
      ui.inventario.filtroPlan = filtroPlan.value;
      const posicion = filtroPlan.selectionStart;
      refrescar();
      const nuevo = document.querySelector('#filtro-plan');
      nuevo.focus();
      nuevo.setSelectionRange(posicion, posicion);
    };
  }
  // El buscador de producto se aplica mientras se escribe, con el cursor en su sitio
  const filtroConteo = document.querySelector('#filtro-conteo');
  if (filtroConteo) {
    filtroConteo.oninput = () => {
      ui.inventario.filtroConteo = filtroConteo.value;
      const posicion = filtroConteo.selectionStart;
      refrescar();
      const nuevo = document.querySelector('#filtro-conteo');
      nuevo.focus();
      nuevo.setSelectionRange(posicion, posicion);
    };
  }
  alClick('#exportar', () =>
    descargarCsv('inventario_compras', [
      ['SKU', 'Producto', 'Decisión', 'Stock', 'Punto reorden', 'Cantidad a pedir', 'Inversión'],
      ...modelo.inventario.filas
        .filter(s => s.estado != 'OK')
        .map(s => [
          s.sku,
          s.descripcion,
          s.estado,
          s.stockSistema,
          Math.round(s.puntoReorden),
          s.cantidadPedir,
          Math.round(s.inversion)
        ])
    ])
  );
}

// Permite que otras pantallas (el Panel) abran una pestaña concreta: data-pestana="2"
function alEntrar({ pestana }) {
  if (pestana) ui.inventario.pestana = +pestana;
}

__e.default = {
  id: 'inv',
  titulo: 'Inventario y compras',
  icono: '▣',
  color: '#15803d',
  seccion: 'MÓDULOS',
  render,
  enlazar,
  alEntrar
};


return __e;
})();

// ===== modulos/escenarios/vista.js =====
__m["modulos/escenarios/vista.js"] = (function () {
const __e = {};
// Escenarios: situación actual (As-Is) frente a la propuesta (To-Be) y simulador «¿qué pasa si…?».

const { modelo, ajustes, ui } = __m["nucleo/estado.js"];
const { fmt, pc, sol, sum, mmss } = __m["nucleo/formato.js"];
const { kpi, tabla, barras, encabezado, etiqueta } = __m["nucleo/html.js"];
const { alClick, alCambiar } = __m["nucleo/dom.js"];
const { pantallaVacia } = __m["nucleo/requisitos.js"];
const { NIVELES_SERVICIO } = __m["nucleo/ajustes.js"];
const { simularReposicion } = __m["modulos/escenarios/calculo.js"];

const TITULO = 'Escenarios';
const SUBTITULO =
  'Compare la situación actual con la propuesta y pruebe «qué pasa si» cambia la demanda o el tiempo de entrega.';

// Variación porcentual de y respecto a x
const variacion = (x, y) => (x ? (y / x - 1) * 100 : 0);
const etiquetaVariacion = (x, y) =>
  `<span class="tag ${y < x ? 't-g' : 't-b'}">${fmt(variacion(x, y), 1)} %</span>`;

function comparacion({ escenarios, otif, inventario, ubicaciones, catalogo }) {
  const { actual: a, propuesta: b, incidencias, incidenciasEvitadas, otifProyectado } = escenarios;
  const pedidosSimulados = Math.min(100, catalogo.pedidos.length);

  return `<div class="card"><h2>Situación actual (As-Is) frente a la propuesta (To-Be)</h2>${tabla(
    ['Indicador', 'Actual', 'Propuesta', 'Variación', 'Origen', 'Módulo'],
    [
      ['Distancia media por pedido', fmt(a.distancia) + ' m', fmt(b.distancia) + ' m', etiquetaVariacion(a.distancia, b.distancia), 'Simulado', '1 + 2'],
      ['Tiempo de armado por pedido', mmss(a.tiempo), mmss(b.tiempo), etiquetaVariacion(a.tiempo, b.tiempo), 'Simulado', '1 + 2'],
      ['Exposición media al frío', mmss(a.exposicionFrio), mmss(b.exposicionFrio), etiquetaVariacion(a.exposicionFrio || 1, b.exposicionFrio), 'Simulado', '2'],
      ['Pedidos que exceden ' + ajustes.frioMax + ' min en frío', pc(a.excedenFrio), pc(b.excedenFrio), '', 'Simulado', '2'],
      ['SKUs con riesgo térmico', ubicaciones.riesgoTermico, 0, '', 'Simulado', '1'],
      ['ERI por SKU', pc(inventario.eri), ajustes.eri + ' %', '', 'Objetivo (Ajustes)', '3'],
      ['OTIF (promedio mensual)', fmt(otif.promedio, 1) + ' %', fmt(otifProyectado, 1) + ' %', '+' + fmt(otifProyectado - otif.promedio, 1) + ' pp', 'Proyección', '1 + 2 + 3'],
      ['Incidencias de almacén por mes', fmt(incidencias), fmt(incidencias - incidenciasEvitadas), etiquetaVariacion(incidencias || 1, incidencias - incidenciasEvitadas), 'Proyección', '1 + 2 + 3'],
      ['Horas de picking ahorradas por mes', '—', fmt(escenarios.horasAhorradasPorMes, 0) + ' h', '', 'Simulado × volumen', '1 + 2'],
      ['Ahorro mensual en mano de obra', '—', sol(escenarios.horasAhorradasPorMes * ajustes.costoH), '', '× costo hora (Ajustes)', '1 + 2']
    ]
  )}<p class="mu">Simulación con ${pedidosSimulados} pedidos reales de sus datos.</p></div>`;
}

function aporteDeCadaModulo({ escenarios }) {
  const { actual: a, propuesta: b } = escenarios;
  return `<div class="card"><h2>¿Qué aporta cada módulo? (distancia media por pedido)</h2>${barras([
    ['Situación actual', a.distancia, '#94a3b8', fmt(a.distancia) + ' m'],
    ['Solo ruteo óptimo', a.distancia, '#0284c7', fmt(a.distancia) + ' m (ruteo ya incluido en As-Is)'],
    ['Solo reubicación (lista impresa)', escenarios.distanciaListaPropuesta, '#d97706', fmt(escenarios.distanciaListaPropuesta) + ' m'],
    ['Reubicación + ruteo', b.distancia, '#16a34a', fmt(b.distancia) + ' m (' + fmt(variacion(a.distancia, b.distancia), 1) + ' %)']
  ])}<p class="mu">Referencia: lista impresa con ubicaciones actuales = ${fmt(escenarios.distanciaListaActual)} m; vecino más cercano = ${fmt(escenarios.distanciaVecinoActual)} m.</p></div>`;
}

function proyeccionOtif({ escenarios, otif }) {
  const { otifProyectado, incidencias, incidenciasEvitadas } = escenarios;
  return `<div class="card"><h2>Proyección del OTIF</h2><div class="grid">${kpi('OTIF actual', fmt(otif.promedio, 1) + ' %', 'Meta ' + ajustes.meta + ' %', 'wa')}${kpi('OTIF proyectado con el artefacto', fmt(otifProyectado, 1) + ' %', '+' + fmt(otifProyectado - otif.promedio, 1) + ' puntos', 'wa')}${kpi('Incidencias por mes', fmt(incidencias) + ' → ' + fmt(incidencias - incidenciasEvitadas), 'según la efectividad supuesta')}</div><p class="mu">OTIF proyectado = OTIF actual + pendiente (${fmt(otif.regresion.pendiente, 3)} pp por incidencia) × cambio de incidencias. La reducción por módulo es un supuesto (Ajustes).</p></div>`;
}

function simulador({ escenarios, otif, inventario }) {
  const demanda = ui.escenarios.demanda || 0;
  const leadTime = ui.escenarios.leadTime || 0;
  const servicio = ui.escenarios.servicio || ajustes.z;
  const sim = simularReposicion({ inventario, otif }, ajustes, { demanda, leadTime, servicio }, escenarios);
  const hoy = inventario.pedir.length;

  return `<div class="card"><h2>Simulador «¿Qué pasa si…?»</h2><div class="grid"><label>Variación de la demanda: <b>${demanda > 0 ? '+' : ''}${demanda} %</b><br><input type="range" id="demanda" min="-30" max="50" value="${demanda}" style="width:100%"></label><label>Retraso en el lead time: <b>+${leadTime} d</b><br><input type="range" id="leadtime" min="0" max="10" value="${leadTime}" style="width:100%"></label><label>Nivel de servicio<br><select id="servicio">${Object.keys(NIVELES_SERVICIO).map(z => `<option ${z == servicio ? 'selected' : ''}>${z}</option>`).join('')}</select></label></div><div class="grid">${kpi('SKUs en riesgo de quiebre', sim.enRiesgo, `Hoy: ${hoy} (${sim.enRiesgo - hoy >= 0 ? '+' : ''}${sim.enRiesgo - hoy})`, sim.enRiesgo > hoy ? 'er' : 'ok')}${kpi('Stock de seguridad total', fmt(sim.stockSeguridadTotal) + ' u.', 'Hoy: ' + fmt(sum(inventario.filas, s => s.stockSeguridad)) + ' u.')}${kpi('Inversión inmediata en reposición', sol(sim.inversionInmediata), 'para los SKUs bajo su punto de reorden')}${kpi('OTIF proyectado', fmt(sim.otifEstimado, 1) + ' %', sim.otifEstimado < ajustes.meta ? 'Bajo la meta de ' + ajustes.meta + ' %' : 'Cumple la meta', 'wa')}</div></div>`;
}

function render() {
  const vacio = pantallaVacia(TITULO, SUBTITULO, ['inventario', 'pedidos', 'otif', 'layout']);
  if (vacio) return vacio;

  const datos = modelo; // catalogo, inventario, otif, ubicaciones, escenarios
  return (
    encabezado(TITULO, SUBTITULO, `<button class="btn" id="recalcular">↻ Recalcular simulación</button>`) +
    comparacion(datos) +
    aporteDeCadaModulo(datos) +
    proyeccionOtif(datos) +
    simulador(datos)
  );
}

function enlazar({ refrescar }) {
  alClick('#recalcular', refrescar);
  alCambiar('#demanda', valor => {
    ui.escenarios.demanda = +valor;
    refrescar();
  });
  alCambiar('#leadtime', valor => {
    ui.escenarios.leadTime = +valor;
    refrescar();
  });
  alCambiar('#servicio', valor => {
    ui.escenarios.servicio = +valor;
    refrescar();
  });
}

__e.default = {
  id: 'esc',
  titulo: 'Escenarios',
  icono: '⚙',
  color: '#be185d',
  seccion: 'SIMULACIÓN',
  render,
  enlazar
};


return __e;
})();

// ===== modulos/ajustes/vista.js =====
__m["modulos/ajustes/vista.js"] = (function () {
const __e = {};
// Ajustes: parámetros y supuestos del modelo. Se guardan en este navegador.

const { ajustes } = __m["nucleo/estado.js"];
const { AJUSTES_POR_DEFECTO, GRUPOS_AJUSTES, NIVELES_SERVICIO } = __m["nucleo/ajustes.js"];
// (AJUSTES_POR_DEFECTO también se usa para copiar los ajustes al Sheet)
const { encabezado } = __m["nucleo/html.js"];
const { $$, alClick } = __m["nucleo/dom.js"];

const TITULO = 'Ajustes';
const SUBTITULO = 'Parámetros y supuestos del modelo. Cambiar un valor recalcula todo el sistema.';

function campo([clave, etiqueta, tipo]) {
  const control =
    tipo === 'seleccion'
      ? `<select data-ajuste="${clave}">${Object.keys(NIVELES_SERVICIO)
          .map(z => `<option ${ajustes[clave] == z ? 'selected' : ''}>${z}</option>`)
          .join('')}</select>`
      : `<input type="number" step="any" data-ajuste="${clave}" value="${ajustes[clave]}">`;
  return `<div class="fld"><span>${etiqueta}</span>${control}</div>`;
}

function render({ editable = false } = {}) {
  const aviso = editable
    ? `<p class="mu">Estos valores se guardan en este navegador. Si el Sheet tiene la pestaña <b>Ajustes</b>, sus valores mandan: después de guardar, pulse «Copiar ajustes para el Sheet» y péguelos en esa pestaña.</p>`
    : `<div class="card"><p class="er-text">Solo el supervisor puede modificar los ajustes.</p></div>`;
  const botones = editable
    ? `<button class="btn p" id="guardar">✓ Guardar cambios</button><button class="btn" id="restablecer">↺ Restablecer valores</button><button class="btn" id="copiar-ajustes">⧉ Copiar ajustes para el Sheet</button>`
    : '';
  return (
    encabezado(TITULO, SUBTITULO, botones) +
    aviso +
    `<div class="grid g2">${GRUPOS_AJUSTES.map(
      ([titulo, campos]) => `<div class="card"><h2>${titulo}</h2>${campos.map(campo).join('')}</div>`
    ).join('')}</div><div class="card"><h2>Acerca de</h2><p>AXIONLOG web · versión 2.0. Los datos se leen de su Google Sheet cada vez que se abre la app. En este navegador solo se guardan el enlace del Sheet y estos ajustes.</p></div>`
  );
}

function enlazar({ guardarAjustes, copiar }) {
  // Texto de dos columnas (Parametro, Valor) para pegar en la pestaña Ajustes del Sheet
  alClick('#copiar-ajustes', boton => {
    const filas = Object.keys(AJUSTES_POR_DEFECTO).map(clave => `${clave}\t${ajustes[clave]}`);
    copiar(['Parametro\tValor', ...filas].join('\n'))
      .then(() => (boton.textContent = '✔ Ajustes copiados'))
      .catch(() => (boton.textContent = 'No se pudo copiar'));
  });
  alClick('#guardar', () => {
    $$('[data-ajuste]').forEach(c => (ajustes[c.dataset.ajuste] = +c.value));
    guardarAjustes();
  });
  alClick('#restablecer', () => {
    Object.assign(ajustes, AJUSTES_POR_DEFECTO);
    guardarAjustes();
  });
}

__e.default = {
  id: 'aju',
  titulo: 'Ajustes',
  icono: '⚒',
  color: '#475569',
  seccion: 'SIMULACIÓN',
  render,
  enlazar
};


return __e;
})();

// ===== modulos/layout/deteccion.js =====
__m["modulos/layout/deteccion.js"] = (function () {
const __e = {};
// Lectura del plano de la planta a partir de una imagen (PNG o JPG).
// Todo son cálculos sobre píxeles: no toca la pantalla, así que se puede probar sola.
//
// Qué se espera de la imagen (como el plano de ejemplo):
//   - cada ubicación es un recuadro de color según su tipo (picking, almacenaje, staging, PNC…)
//   - las ubicaciones forman columnas o filas
//   - los muros de las cámaras son líneas gruesas azul oscuro
//   - las cámaras de congelado tienen un fondo celeste

const TIPOS = ['picking', 'almacenaje', 'staging', 'pnc', 'otro'];

const NOMBRE_TIPO = {
  picking: 'Picking',
  almacenaje: 'Almacenaje',
  staging: 'Staging',
  pnc: 'PNC (no conforme)',
  otro: 'Otro'
};

// Colores de la leyenda del plano de ejemplo. El cliente puede corregirlos tomándolos de su imagen.
const PALETA_INICIAL = {
  picking: [47, 112, 196],
  almacenaje: [225, 160, 44],
  staging: [74, 154, 57],
  pnc: [218, 69, 63],
  otro: [156, 159, 166],
  camara: [209, 226, 247],
  muro: [11, 58, 114],
  pasillo: [200, 190, 230], // morado claro: por ahí se camina (se puede recalibrar con «Tomar de la imagen»)
  puente: [128, 128, 128] // gris sólido del «Puente»: también transitable
};

const TOLERANCIA_COLOR = 30; // qué tan distinto puede ser un píxel del color de la leyenda
const TOLERANCIA_GRIS = 12; // el gris se confunde fácil con los bordes suavizados: se exige más parecido
const RADIO_CIERRE = 3; // une las partes de una ubicación separadas por el número escrito dentro

const distanciaDeColor = (data, p, color) => {
  const dr = data[p] - color[0];
  const dg = data[p + 1] - color[1];
  const db = data[p + 2] - color[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const mediana = lista => {
  if (!lista.length) return 0;
  const orden = [...lista].sort((a, b) => a - b);
  return orden[Math.floor(orden.length / 2)];
};

// Promedio de color en un cuadrito de 5×5 alrededor de (x, y): sirve para tomar un color de la imagen.
function colorEn(imagen, x, y) {
  const { data, ancho, alto } = imagen;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let j = -2; j <= 2; j++) {
    for (let i = -2; i <= 2; i++) {
      const px = Math.min(ancho - 1, Math.max(0, Math.round(x) + i));
      const py = Math.min(alto - 1, Math.max(0, Math.round(y) + j));
      const p = (py * ancho + px) * 4;
      r += data[p];
      g += data[p + 1];
      b += data[p + 2];
      n++;
    }
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

// Píxeles muy oscuros (los bordes finos de cada recuadro).
function mascaraOscura({ data, ancho, alto }) {
  const m = new Uint8Array(ancho * alto);
  for (let i = 0, p = 0; i < m.length; i++, p += 4) {
    if (data[p] < 110 && data[p + 1] < 110 && data[p + 2] < 110) m[i] = 1;
  }
  return m;
}

// Máscara de los píxeles que se parecen a un color.
function mascaraDeColor(imagen, color, tolerancia) {
  const { data, ancho, alto } = imagen;
  const mascara = new Uint8Array(ancho * alto);
  for (let i = 0, p = 0; i < mascara.length; i++, p += 4) {
    if (distanciaDeColor(data, p, color) <= tolerancia) mascara[i] = 1;
  }
  return mascara;
}

// Engorda la máscara `radio` píxeles hacia cada lado (primero en horizontal y luego en vertical).
function dilatar(mascara, ancho, alto, radio) {
  const medio = new Uint8Array(mascara.length);
  for (let y = 0; y < alto; y++) {
    const fila = y * ancho;
    let ultimo = -Infinity;
    // último píxel encendido visto a la izquierda y a la derecha
    for (let x = 0; x < ancho; x++) {
      if (mascara[fila + x]) ultimo = x;
      if (x - ultimo <= radio) medio[fila + x] = 1;
    }
    ultimo = Infinity;
    for (let x = ancho - 1; x >= 0; x--) {
      if (mascara[fila + x]) ultimo = x;
      if (ultimo - x <= radio) medio[fila + x] = 1;
    }
  }
  const salida = new Uint8Array(mascara.length);
  for (let x = 0; x < ancho; x++) {
    let ultimo = -Infinity;
    for (let y = 0; y < alto; y++) {
      if (medio[y * ancho + x]) ultimo = y;
      if (y - ultimo <= radio) salida[y * ancho + x] = 1;
    }
    ultimo = Infinity;
    for (let y = alto - 1; y >= 0; y--) {
      if (medio[y * ancho + x]) ultimo = y;
      if (ultimo - y <= radio) salida[y * ancho + x] = 1;
    }
  }
  return salida;
}

// Grupos de píxeles pegados (componentes conexas). El tamaño se mide solo con la máscara original.
function componentes(mascara, ancho, alto, radio, bloqueo) {
  const unida = dilatar(mascara, ancho, alto, radio);
  // Los bordes oscuros de cada recuadro no se cruzan: así dos ubicaciones pegadas no se funden en una
  if (bloqueo) for (let i = 0; i < unida.length; i++) if (bloqueo[i]) unida[i] = 0;
  const visto = new Uint8Array(unida.length);
  const pila = new Int32Array(unida.length);
  const lista = [];
  for (let inicio = 0; inicio < unida.length; inicio++) {
    if (!unida[inicio] || visto[inicio]) continue;
    let tope = 0;
    pila[tope++] = inicio;
    visto[inicio] = 1;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    let area = 0;
    while (tope) {
      const p = pila[--tope];
      const x = p % ancho;
      const y = (p - x) / ancho;
      if (mascara[p]) {
        area++;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      if (x > 0 && unida[p - 1] && !visto[p - 1]) (visto[p - 1] = 1), (pila[tope++] = p - 1);
      if (x < ancho - 1 && unida[p + 1] && !visto[p + 1]) (visto[p + 1] = 1), (pila[tope++] = p + 1);
      if (y > 0 && unida[p - ancho] && !visto[p - ancho]) (visto[p - ancho] = 1), (pila[tope++] = p - ancho);
      if (y < alto - 1 && unida[p + ancho] && !visto[p + ancho]) (visto[p + ancho] = 1), (pila[tope++] = p + ancho);
    }
    if (area > 0) lista.push({ x0, y0, x1: x1 + 1, y1: y1 + 1, area });
  }
  return lista;
}

// --- 1. Ubicaciones: un recuadro por cada celda de color
function detectarCeldas(imagen, paleta) {
  const { ancho, alto } = imagen;
  const encontradas = [];
  const bloqueo = mascaraOscura(imagen);
  TIPOS.forEach(tipo => {
    const mascara = mascaraDeColor(imagen, paleta[tipo], tipo === 'otro' ? TOLERANCIA_GRIS : TOLERANCIA_COLOR);
    componentes(mascara, ancho, alto, RADIO_CIERRE, bloqueo).forEach(c => {
      encontradas.push({ tipo, x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1, area: c.area });
    });
  });

  // Se descartan manchas pequeñas (bordes, textos) y formas que no parecen una ubicación
  const grandes = encontradas.filter(c => c.area >= 80);
  const anchoTipico = mediana(grandes.map(c => c.x1 - c.x0));
  const altoTipico = mediana(grandes.map(c => c.y1 - c.y0));
  const celdas = grandes
    .filter(c => {
      const w = c.x1 - c.x0;
      const h = c.y1 - c.y0;
      const llena = c.area / (w * h) > 0.5;
      const tamanoRazonable = w >= anchoTipico * 0.4 && w <= anchoTipico * 3.2 && h >= altoTipico * 0.4 && h <= altoTipico * 3.2;
      return llena && tamanoRazonable;
    })
    .map(c => ({
      tipo: c.tipo,
      x: (c.x0 + c.x1) / 2,
      y: (c.y0 + c.y1) / 2,
      ancho: c.x1 - c.x0,
      alto: c.y1 - c.y0
    }));
  return separarFundidas(celdas);
}

// Si dos ubicaciones pegadas se fundieron en una (borde casi invisible), se parte según el tamaño
// de sus vecinas de la misma columna (o fila).
function separarFundidas(celdas) {
  const salida = [];
  celdas.forEach(c => {
    const vertical = c.alto >= c.ancho - 2;
    const eje = vertical ? 'x' : 'y';
    const largo = vertical ? 'alto' : 'ancho';
    const vecinas = celdas.filter(o => o !== c && o.alto >= o.ancho - 2 === vertical && Math.abs(o[eje] - c[eje]) < 8);
    const referencia = mediana(vecinas.map(o => o[largo]).filter(l => l < c[largo] * 0.75));
    const partes = referencia ? Math.round(c[largo] / referencia) : 1;
    if (partes < 2 || partes > 4 || c[largo] < referencia * 1.6) return salida.push(c);
    const parte = c[largo] / partes;
    const inicio = (vertical ? c.y : c.x) - c[largo] / 2;
    for (let i = 0; i < partes; i++) {
      const centro = inicio + parte * (i + 0.5);
      salida.push({ ...c, [vertical ? 'y' : 'x']: centro, [largo]: parte });
    }
  });
  return salida;
}

// --- 2. Columnas y filas: las celdas alineadas forman un grupo
// Las celdas más altas que anchas forman columnas; las más anchas que altas, filas.
function agruparEnLineas(celdas) {
  const tamano = mediana(celdas.map(c => Math.min(c.ancho, c.alto)));
  const tolerancia = Math.max(3, tamano * 0.35);

  const aGrupos = (lista, eje) => {
    const ordenadas = [...lista].sort((a, b) => a[eje] - b[eje]);
    const grupos = [];
    ordenadas.forEach(c => {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && c[eje] - ultimo.ref <= tolerancia) {
        ultimo.celdas.push(c);
        ultimo.ref = c[eje];
      } else {
        grupos.push({ ref: c[eje], celdas: [c] });
      }
    });
    return grupos;
  };

  const verticales = celdas.filter(c => c.alto >= c.ancho - 2);
  const horizontales = celdas.filter(c => c.alto < c.ancho - 2);
  const lineas = [];

  const procesar = (lista, orientacion) => {
    const eje = orientacion === 'columna' ? 'x' : 'y';
    const ejeAlong = orientacion === 'columna' ? 'y' : 'x';
    const largo = orientacion === 'columna' ? 'alto' : 'ancho';
    aGrupos(lista, eje).forEach(g => {
      if (g.celdas.length < 3) return;
      // columnas: de abajo hacia arriba (1 abajo); filas: de izquierda a derecha
      const orden = [...g.celdas].sort((a, b) =>
        orientacion === 'columna' ? b[ejeAlong] - a[ejeAlong] : a[ejeAlong] - b[ejeAlong]
      );
      const saltos = [];
      for (let i = 1; i < orden.length; i++) saltos.push(Math.abs(orden[i][ejeAlong] - orden[i - 1][ejeAlong]));
      const paso = mediana(saltos);
      // Una fila de recuadros muy separados entre sí (como la leyenda) no es una línea de ubicaciones
      if (paso > mediana(orden.map(c => c[largo])) * 2.2) return;

      const huecos = [];
      for (let i = 1; i < orden.length; i++) {
        const salto = Math.abs(orden[i][ejeAlong] - orden[i - 1][ejeAlong]);
        if (salto > paso * 1.5) huecos.push({ despuesDe: i, ubicacionesQueFaltan: Math.round(salto / paso) - 1 });
      }
      lineas.push({ orientacion, celdas: orden, paso, huecos });
    });
  };
  procesar(verticales, 'columna');
  procesar(horizontales, 'fila');
  return lineas;
}

// Qué celdas pertenecen a una línea: se usan para quitar la leyenda y manchas sueltas
function celdasDeLineas(lineas) {
  return lineas.flatMap(l => l.celdas);
}

// --- 3. Zona de cada línea: si está dentro de una cámara de congelado (fondo celeste) es CONGELADO
function zonaSugerida(imagen, linea, paleta) {
  const { data, ancho, alto } = imagen;
  let dentro = 0;
  linea.celdas.forEach(c => {
    const separacion = (linea.orientacion === 'columna' ? c.ancho : c.alto) / 2 + Math.min(c.ancho, c.alto) * 0.33 + 6;
    const lados =
      linea.orientacion === 'columna'
        ? [[c.x - separacion, c.y], [c.x + separacion, c.y]]
        : [[c.x, c.y - separacion], [c.x, c.y + separacion]];
    const esCamara = lados.some(([x, y]) => {
      const px = Math.round(x);
      const py = Math.round(y);
      if (px < 0 || py < 0 || px >= ancho || py >= alto) return false;
      const q = (py * ancho + px) * 4;
      // celeste de la cámara (en algunos planos con dos tonos): el de la leyenda o cualquier celeste claro
      const celeste = data[q + 2] - data[q] >= 12 && data[q] >= 195 && data[q + 1] >= 215;
      return celeste || distanciaDeColor(data, q, paleta.camara) <= 14;
    });
    if (esCamara) dentro++;
  });
  return dentro / linea.celdas.length >= 0.5 ? 'CONGELADO' : 'SECO';
}

// --- 4. Muros: píxeles azul oscuro agrupados en bloques de 2×2 (un bloque es muro si al menos la mitad
// de sus píxeles son azul oscuro). Así los bordes suavizados no cortan el muro, y los huecos
// (puertas y entradas) quedan abiertos.
const TOLERANCIA_MURO = 60; // el azul de muro se mide con más margen: los bordes se suavizan

// Une bloques encendidos en rectángulos: cada tramo de una fila sigue al rectángulo de la fila anterior
// si tiene el mismo ancho (con `tolerancia` en bloques).
function rectangulosDeBloques(mascara, columnas, filas, paso, ancho, alto, tolerancia, grosorMinimo, largoMinimo) {
  let abiertos = [];
  const terminados = [];
  for (let cy = 0; cy <= filas; cy++) {
    const tramos = [];
    let inicio = -1;
    for (let cx = 0; cx <= columnas; cx++) {
      const encendido = cx < columnas && cy < filas && mascara[cy * columnas + cx] === 1;
      if (encendido && inicio < 0) inicio = cx;
      if (!encendido && inicio >= 0) {
        tramos.push([inicio, cx]);
        inicio = -1;
      }
    }
    const siguientes = [];
    tramos.forEach(([a, b]) => {
      const previo = abiertos.find(r => !r.usado && Math.abs(r.cx0 - a) <= tolerancia && Math.abs(r.cx1 - b) <= tolerancia);
      if (previo) {
        previo.usado = true;
        previo.cy1 = cy + 1;
        siguientes.push(previo);
      } else {
        siguientes.push({ cx0: a, cx1: b, cy0: cy, cy1: cy + 1, usado: true });
      }
    });
    abiertos.filter(r => !r.usado).forEach(r => terminados.push(r));
    abiertos = siguientes;
    abiertos.forEach(r => (r.usado = false));
  }

  return terminados
    .map(r => ({
      x0: r.cx0 * paso,
      y0: r.cy0 * paso,
      x1: Math.min(ancho, r.cx1 * paso),
      y1: Math.min(alto, r.cy1 * paso)
    }))
    .filter(r => Math.min(r.x1 - r.x0, r.y1 - r.y0) >= grosorMinimo && Math.max(r.x1 - r.x0, r.y1 - r.y0) >= largoMinimo);
}

function detectarMuros(imagen, paleta, grosorMinimo = 8, paso = 2) {
  const { data, ancho, alto } = imagen;
  const columnas = Math.ceil(ancho / paso);
  const filas = Math.ceil(alto / paso);
  const muro = new Uint8Array(columnas * filas);
  for (let cy = 0; cy < filas; cy++) {
    for (let cx = 0; cx < columnas; cx++) {
      let oscuros = 0;
      let n = 0;
      for (let j = 0; j < paso; j++) {
        for (let i = 0; i < paso; i++) {
          const x = cx * paso + i;
          const y = cy * paso + j;
          if (x >= ancho || y >= alto) continue;
          n++;
          if (distanciaDeColor(data, (y * ancho + x) * 4, paleta.muro) <= TOLERANCIA_MURO) oscuros++;
        }
      }
      if (n && oscuros / n >= 0.5) muro[cy * columnas + cx] = 1;
    }
  }
  // Un borde suavizado puede variar 1 bloque entre filas: se tolera para que el muro no se parta en franjas finas
  return rectangulosDeBloques(muro, columnas, filas, paso, ancho, alto, 1, grosorMinimo, 12);
}

// --- 5. Pasillos: zonas por donde sí se puede caminar (morado claro, fondo de cámara y «Puente»).
// Todo lo que no es pasillo, muro ni rack queda bloqueado. Se mira el color promedio de cada bloque
// de 4×4 píxeles, para que las rayas del «Puente» cuenten como una sola zona.
function detectarPasillos(imagen, paleta, paso = 4, grosorMinimo = 8) {
  const { data, ancho, alto } = imagen;
  const columnas = Math.ceil(ancho / paso);
  const filas = Math.ceil(alto / paso);
  const colores = [paleta.pasillo, paleta.camara, paleta.puente].filter(Boolean);

  const libre = new Uint8Array(columnas * filas);
  for (let cy = 0; cy < filas; cy++) {
    for (let cx = 0; cx < columnas; cx++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let j = 0; j < paso; j++) {
        for (let i = 0; i < paso; i++) {
          const x = cx * paso + i;
          const y = cy * paso + j;
          if (x >= ancho || y >= alto) continue;
          const q = (y * ancho + x) * 4;
          r += data[q];
          g += data[q + 1];
          b += data[q + 2];
          n++;
        }
      }
      if (!n) continue;
      const promedio = [r / n, g / n, b / n];
      libre[cy * columnas + cx] = colores.some(c => distanciaDeColor([promedio[0], promedio[1], promedio[2], 255], 0, c) <= 28) ? 1 : 0;
    }
  }

  // Rectángulos: tramos de celdas libres por fila que siguen al rectángulo de la fila anterior
  let abiertos = [];
  const terminados = [];
  for (let cy = 0; cy <= filas; cy++) {
    const tramos = [];
    let inicio = -1;
    for (let cx = 0; cx <= columnas; cx++) {
      const esLibre = cx < columnas && cy < filas && libre[cy * columnas + cx] === 1;
      if (esLibre && inicio < 0) inicio = cx;
      if (!esLibre && inicio >= 0) {
        tramos.push([inicio, cx]);
        inicio = -1;
      }
    }
    const siguientes = [];
    tramos.forEach(([a, b]) => {
      const previo = abiertos.find(r => !r.usado && Math.abs(r.cx0 - a) <= 1 && Math.abs(r.cx1 - b) <= 1);
      if (previo) {
        previo.usado = true;
        previo.cy1 = cy + 1;
        siguientes.push(previo);
      } else {
        siguientes.push({ cx0: a, cx1: b, cy0: cy, cy1: cy + 1, usado: true });
      }
    });
    abiertos.filter(r => !r.usado).forEach(r => terminados.push(r));
    abiertos = siguientes;
    abiertos.forEach(r => (r.usado = false));
  }

  return terminados
    .map(r => ({
      x0: r.cx0 * paso,
      y0: r.cy0 * paso,
      x1: Math.min(ancho, r.cx1 * paso),
      y1: Math.min(alto, r.cy1 * paso)
    }))
    .filter(r => Math.min(r.x1 - r.x0, r.y1 - r.y0) >= grosorMinimo);
}

// --- Todo junto
function leerPlano(imagen, paleta) {
  const todas = detectarCeldas(imagen, paleta);
  const lineas = agruparEnLineas(todas);
  const celdas = celdasDeLineas(lineas);
  lineas.forEach(l => (l.zona = zonaSugerida(imagen, l, paleta)));
  const muros = detectarMuros(imagen, paleta);
  const pasillos = detectarPasillos(imagen, paleta);
  const descartadas = todas.length - celdas.length;
  return { ancho: imagen.ancho, alto: imagen.alto, celdas, lineas, muros, pasillos, descartadas };
}

Object.defineProperty(__e, 'TIPOS', { get: () => TIPOS, enumerable: true });
Object.defineProperty(__e, 'NOMBRE_TIPO', { get: () => NOMBRE_TIPO, enumerable: true });
Object.defineProperty(__e, 'PALETA_INICIAL', { get: () => PALETA_INICIAL, enumerable: true });
Object.defineProperty(__e, 'colorEn', { get: () => colorEn, enumerable: true });
Object.defineProperty(__e, 'detectarCeldas', { get: () => detectarCeldas, enumerable: true });
Object.defineProperty(__e, 'agruparEnLineas', { get: () => agruparEnLineas, enumerable: true });
Object.defineProperty(__e, 'celdasDeLineas', { get: () => celdasDeLineas, enumerable: true });
Object.defineProperty(__e, 'zonaSugerida', { get: () => zonaSugerida, enumerable: true });
Object.defineProperty(__e, 'detectarMuros', { get: () => detectarMuros, enumerable: true });
Object.defineProperty(__e, 'leerPlano', { get: () => leerPlano, enumerable: true });
return __e;
})();

// ===== modulos/layout/construccion.js =====
__m["modulos/layout/construccion.js"] = (function () {
const __e = {};
// Del resultado de la detección y lo que corrige el cliente (nombres, zonas, escala, muelle)
// a los datos finales del plano: las tres tablas que se copian al Google Sheet.

const { ZONAS } = __m["nucleo/planta.js"];

const PREFIJO_DE_ZONA = { SECO: 'S', REFRIGERADO: 'R', CONGELADO: 'C' };

const mediana = lista => {
  const orden = [...lista].sort((a, b) => a - b);
  return orden.length ? orden[Math.floor(orden.length / 2)] : 0;
};

// 0 → A, 1 → B, … 25 → Z, 26 → AA
const letra = n => (n >= 26 ? letra(Math.floor(n / 26) - 1) : '') + String.fromCharCode(65 + (n % 26));

// Pone nombre a cada columna/fila que el cliente no haya nombrado a mano: SA, SB… (seco), RA, RB… (refrigerado), CA, CB… (congelado).
// Se numeran de izquierda a derecha y de arriba abajo.
function proponerNombres(lineas) {
  const cuenta = {};
  [...lineas]
    .sort((a, b) => minimo(a, 'x') - minimo(b, 'x') || minimo(a, 'y') - minimo(b, 'y'))
    .forEach(linea => {
      const prefijo = PREFIJO_DE_ZONA[linea.zona] || 'X';
      const n = cuenta[prefijo] || 0;
      cuenta[prefijo] = n + 1;
      if (!linea.nombreManual) linea.nombre = prefijo + letra(n);
    });
}

const minimo = (linea, eje) => Math.min(...linea.celdas.map(c => c[eje] - (eje === 'x' ? c.ancho : c.alto) / 2));

// Número de cada ubicación de una línea. Empieza en `inicio` y sigue de uno en uno;
// después de un hueco puede continuar en otro número (`saltos[despuesDe] = siguiente`).
function numerarLinea(linea) {
  const numeros = [];
  let actual = linea.inicio ?? 1;
  linea.celdas.forEach((_, i) => {
    numeros.push(actual);
    const salto = linea.saltos?.[i + 1];
    actual = salto != null && salto !== '' ? Number(salto) : actual + 1;
  });
  return numeros;
}

// Código de cada ubicación: SB-17
const codigo = (linea, numero) => `${linea.nombre}-${numero}`;

// Metros por píxel, a partir de cuántos metros mide una ubicación (lo que ocupa su lugar en la columna)
function metrosPorPixel(lineas, metrosPorUbicacion) {
  const paso = mediana(lineas.map(l => l.paso));
  return paso ? metrosPorUbicacion / paso : 0;
}

// Muelle propuesto: a la izquierda de la primera ubicación de abajo (supuesto: el cliente lo corrige haciendo clic)
function muelleSugerido(lineas, alto) {
  const celdas = lineas.flatMap(l => l.celdas);
  if (!celdas.length) return { x: 10, y: alto - 10 };
  const izquierda = Math.min(...celdas.map(c => c.x - c.ancho / 2));
  const abajo = Math.max(...celdas.map(c => c.y + c.alto / 2));
  return { x: Math.round(Math.max(8, izquierda / 2)), y: Math.round(Math.min(alto - 8, abajo)) };
}

// El plano completo en el formato interno de la app
function construirLayout({ ancho, alto, lineas, muros, pasillos = [], metrosPorUbicacion, muelle }) {
  const ubicaciones = [];
  lineas.forEach(linea => {
    const numeros = numerarLinea(linea);
    linea.celdas.forEach((c, i) =>
      ubicaciones.push({
        id: codigo(linea, numeros[i]),
        zona: linea.zona,
        tipo: c.tipo,
        x: Math.round(c.x),
        y: Math.round(c.y),
        ancho: Math.round(c.ancho),
        alto: Math.round(c.alto)
      })
    );
  });
  return {
    ancho,
    alto,
    metrosPorPixel: metrosPorPixel(lineas, metrosPorUbicacion),
    muelle: muelle || muelleSugerido(lineas, alto),
    ubicaciones,
    muros: muros.map(m => ({ ...m })),
    pasillos: pasillos.map(p => ({ ...p }))
  };
}

// Problemas que conviene revisar antes de guardar
function revisar(layout, lineas) {
  const avisos = [];
  const vistos = new Set();
  const repetidos = new Set();
  layout.ubicaciones.forEach(u => (vistos.has(u.id) ? repetidos.add(u.id) : vistos.add(u.id)));
  if (repetidos.size) avisos.push(`Hay códigos repetidos: ${[...repetidos].slice(0, 6).join(', ')}${repetidos.size > 6 ? '…' : ''}. Revise los nombres o la numeración de las columnas.`);
  lineas.forEach(l => {
    const numeros = numerarLinea(l);
    if (numeros.some((n, i) => i && n <= numeros[i - 1])) {
      avisos.push(`La numeración de ${l.nombre} no va en aumento: revise el número en que continúa después de cada hueco.`);
    }
  });
  const nombres = lineas.map(l => l.nombre);
  if (new Set(nombres).size !== nombres.length) avisos.push('Hay dos columnas o filas con el mismo nombre.');
  if (!layout.metrosPorPixel) avisos.push('Falta la escala del plano.');
  return avisos;
}

// Las tres tablas que se pegan en el Google Sheet (la primera fila son los títulos)
function tablasParaSheet(layout) {
  const decimales = n => Number(n.toFixed(6));
  return {
    Layout: [
      ['Parametro', 'Valor'],
      ['Ancho_px', layout.ancho],
      ['Alto_px', layout.alto],
      ['Metros_por_px', decimales(layout.metrosPorPixel)],
      ['Muelle_X', layout.muelle.x],
      ['Muelle_Y', layout.muelle.y]
    ],
    Ubicaciones: [
      ['Ubicacion', 'Zona', 'Tipo', 'X', 'Y', 'Ancho', 'Alto'],
      ...layout.ubicaciones.map(u => [u.id, u.zona, u.tipo, u.x, u.y, u.ancho, u.alto])
    ],
    Muros: [['X0', 'Y0', 'X1', 'Y1'], ...layout.muros.map(m => [m.x0, m.y0, m.x1, m.y1])],
    Pasillos: [['X0', 'Y0', 'X1', 'Y1'], ...(layout.pasillos || []).map(p => [p.x0, p.y0, p.x1, p.y1])]
  };
}

// Texto separado por tabuladores: al pegarlo en Google Sheets cada dato cae en su celda
const aTsv = filas => filas.map(f => f.join('\t')).join('\n');



Object.defineProperty(__e, 'proponerNombres', { get: () => proponerNombres, enumerable: true });
Object.defineProperty(__e, 'numerarLinea', { get: () => numerarLinea, enumerable: true });
Object.defineProperty(__e, 'codigo', { get: () => codigo, enumerable: true });
Object.defineProperty(__e, 'metrosPorPixel', { get: () => metrosPorPixel, enumerable: true });
Object.defineProperty(__e, 'muelleSugerido', { get: () => muelleSugerido, enumerable: true });
Object.defineProperty(__e, 'construirLayout', { get: () => construirLayout, enumerable: true });
Object.defineProperty(__e, 'revisar', { get: () => revisar, enumerable: true });
Object.defineProperty(__e, 'tablasParaSheet', { get: () => tablasParaSheet, enumerable: true });
Object.defineProperty(__e, 'aTsv', { get: () => aTsv, enumerable: true });
Object.defineProperty(__e, 'ZONAS', { get: () => ZONAS, enumerable: true });
return __e;
})();

// ===== modulos/layout/vista.js =====
__m["modulos/layout/vista.js"] = (function () {
const __e = {};
// Configurar layout: asistente paso a paso que convierte la imagen del plano de la planta en datos
// (ubicaciones, muros, escala y muelle) y los prepara para pegarlos en el Google Sheet.
// La imagen no se guarda ni se envía a ningún sitio: se procesa en este navegador.

const { ajustes } = __m["nucleo/estado.js"];
const { construirPlanta } = __m["nucleo/planta.js"];
const { fmt, esc } = __m["nucleo/formato.js"];
const { encabezado, kpi } = __m["nucleo/html.js"];
const { dibujarPlano } = __m["nucleo/graficos.js"];
const { controlesDeAnimacion, iniciarAnimacion } = __m["nucleo/animacion.js"];
const { descargarCsv } = __m["nucleo/csv.js"];
const { $, $$, alClick, alCambiarCada } = __m["nucleo/dom.js"];
const { paradasPorZonas } = __m["modulos/picking/calculo.js"];
const {
  PALETA_INICIAL,
  NOMBRE_TIPO,
  TIPOS,
  colorEn,
  leerPlano
} = __m["modulos/layout/deteccion.js"];
const {
  proponerNombres,
  numerarLinea,
  codigo,
  muelleSugerido,
  construirLayout,
  revisar,
  tablasParaSheet,
  aTsv
} = __m["modulos/layout/construccion.js"];

const TITULO = 'Configurar layout';
const SUBTITULO = 'Suba la imagen del plano de la planta y revise lo que se detecta. Se hace una sola vez.';
const LADO_MAXIMO = 2600; // las imágenes más grandes se reducen para que el proceso sea rápido
const PASOS = ['Imagen', 'Detección', 'Columnas y filas', 'Escala y muelle', 'Probar', 'Guardar'];
const NOMBRE_DE_COLOR = { ...NOMBRE_TIPO, camara: 'Fondo de cámara', muro: 'Muros', pasillo: 'Pasillo (morado)', puente: 'Puente (rayado)' };
const COLOR_DE_TIPO = { picking: '#3f7fd6', almacenaje: '#f0aa3a', staging: '#59ae47', pnc: '#dc4f48', otro: '#9ba0a6' };
const COLOR_DE_ZONA = { SECO: '#f59e0b', REFRIGERADO: '#0ea5e9', CONGELADO: '#6366f1' };

// Todo lo que el asistente va recordando mientras se usa
const asistente = {
  paso: 1,
  archivo: '',
  imagen: null, // { data, ancho, alto } con los píxeles
  fuente: null, // lienzo con la imagen, para dibujar encima
  paleta: { ...PALETA_INICIAL },
  tomando: null, // color que se está tomando de la imagen con un clic
  lectura: null, // resultado de leer el plano
  lineas: [], // columnas y filas, con lo que el cliente corrige
  metrosPorUbicacion: 1.2,
  muelle: null,
  prueba: [], // ubicaciones elegidas para probar el recorrido
  pruebaManual: false, // true cuando el cliente ya eligió él mismo (no se vuelven a proponer)
  resaltada: null,
  mensaje: ''
};

const hayLectura = () => asistente.lectura && asistente.lineas.length > 0;
const puedeIr = paso => paso === 1 || (asistente.imagen && (paso === 2 || hayLectura()));

// ---------------------------------------------------------------- lectura de la imagen
async function cargarImagen(archivo) {
  const url = URL.createObjectURL(archivo);
  try {
    const elemento = new Image();
    elemento.src = url;
    await elemento.decode();
    const escala = Math.min(1, LADO_MAXIMO / Math.max(elemento.naturalWidth, elemento.naturalHeight));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(elemento.naturalWidth * escala);
    lienzo.height = Math.round(elemento.naturalHeight * escala);
    const contexto = lienzo.getContext('2d', { willReadFrequently: true });
    contexto.fillStyle = '#fff';
    contexto.fillRect(0, 0, lienzo.width, lienzo.height);
    contexto.drawImage(elemento, 0, 0, lienzo.width, lienzo.height);
    const datos = contexto.getImageData(0, 0, lienzo.width, lienzo.height);
    asistente.fuente = lienzo;
    asistente.imagen = { data: datos.data, ancho: lienzo.width, alto: lienzo.height };
    asistente.archivo = archivo.name;
    asistente.paleta = { ...PALETA_INICIAL };
    asistente.mensaje = '';
    detectar();
  } catch (e) {
    asistente.mensaje = 'No se pudo abrir la imagen. Use un archivo PNG o JPG.';
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Lee el plano con la paleta actual. Si ya había nombres y zonas corregidos, no se pierden.
function detectar() {
  const lectura = leerPlano(asistente.imagen, asistente.paleta);
  asistente.lectura = lectura;
  asistente.lineas = lectura.lineas;
  proponerNombres(asistente.lineas);
  asistente.muelle = muelleSugerido(asistente.lineas, lectura.alto);
  asistente.prueba = [];
  asistente.pruebaManual = false;
}

// El plano tal como quedaría con lo que el cliente configuró
const layoutActual = () =>
  construirLayout({
    ancho: asistente.imagen.ancho,
    alto: asistente.imagen.alto,
    lineas: asistente.lineas,
    muros: asistente.lectura.muros,
    pasillos: asistente.lectura.pasillos,
    metrosPorUbicacion: asistente.metrosPorUbicacion,
    muelle: asistente.muelle
  });

// ---------------------------------------------------------------- pasos
function pasoImagen() {
  const cargada = asistente.imagen
    ? `<p class="ok2">✔ ${esc(asistente.archivo)} · ${asistente.imagen.ancho} × ${asistente.imagen.alto} px</p>`
    : '';
  return `<div class="card"><h2>1 · Suba la imagen del plano</h2>
<p class="mu">Debe ser un archivo PNG o JPG, lo más nítido posible. Se espera un plano como el de ejemplo: cada ubicación es un recuadro de color según su tipo (picking, almacenaje, staging, PNC), ordenados en columnas o filas, con los muros de las cámaras en azul oscuro y su leyenda.</p>
<div class="row"><input type="file" id="archivo" accept="image/png,image/jpeg"></div>
${cargada}${asistente.mensaje ? `<p class="er-text">${esc(asistente.mensaje)}</p>` : ''}
<p class="mu">La imagen se procesa en su navegador: no se envía ni se guarda en ningún sitio. Lo que se guarda son los datos del plano, que usted pega en su Google Sheet.</p>
${asistente.imagen ? `<canvas id="lienzo" class="lienzo"></canvas>` : ''}</div>`;
}

function pasoDeteccion() {
  const { lectura, paleta, tomando } = asistente;
  const porTipo = {};
  lectura.celdas.forEach(c => (porTipo[c.tipo] = (porTipo[c.tipo] || 0) + 1));
  // Pasillos y puentes no se configuran: todo lo que no es muro ni rack se puede caminar
  const chips = [...TIPOS, 'camara', 'muro']
    .map(
      clave =>
        `<div class="chip-color ${tomando === clave ? 'activo' : ''}"><i style="background:rgb(${paleta[clave].join(',')})"></i><span><b>${NOMBRE_DE_COLOR[clave]}</b>${porTipo[clave] != null ? ` · ${porTipo[clave]}` : ''}</span><button class="btn" data-color="${clave}">Tomar de la imagen</button></div>`
    )
    .join('');
  const sin = !asistente.lineas.length;
  return `<div class="card"><h2>2 · Revise lo que se detectó</h2>
<p class="mu">La app busca los recuadros que tienen el color de cada tipo. Si algún tipo no aparece o aparecen de más, pulse «Tomar de la imagen» y haga clic sobre un ejemplo de ese color en la imagen (por ejemplo, en la leyenda).</p>
<div class="paleta">${chips}</div>
${tomando ? `<p class="aviso-clic">Haga clic en la imagen sobre un ejemplo de «${NOMBRE_DE_COLOR[tomando]}».</p>` : ''}
<div class="grid">${kpi('Ubicaciones', fmt(lectura.celdas.length), 'recuadros detectados', sin ? 'er' : 'ok')}${kpi('Columnas y filas', asistente.lineas.length, 'grupos de ubicaciones alineadas')}${kpi('Muros', lectura.muros.length, 'tramos de muro de las cámaras')}</div>
${sin ? '<p class="er-text">No se encontró ninguna columna o fila de ubicaciones. Revise los colores o use una imagen más nítida.</p>' : ''}
<canvas id="lienzo" class="lienzo ${tomando ? 'tomando' : ''}"></canvas></div>`;
}

function filaDeLinea(linea, i) {
  const numeros = numerarLinea(linea);
  const huecos = linea.huecos
    .map(h => {
      const antes = numeros[h.despuesDe - 1];
      const propuesto = linea.saltos?.[h.despuesDe] ?? '';
      return `<label class="hueco">tras la n.º ${antes} (faltan ${h.ubicacionesQueFaltan} lugares) continúa en <input type="number" step="1" min="1" placeholder="${antes + 1}" value="${propuesto}" data-hueco="${i}:${h.despuesDe}"></label>`;
    })
    .join('');
  return `<tr data-linea="${i}"><td><b>${i + 1}</b></td><td>${linea.orientacion === 'columna' ? 'Columna' : 'Fila'}</td><td>${linea.celdas.length}</td>
<td><select data-zona="${i}">${['SECO', 'REFRIGERADO', 'CONGELADO'].map(z => `<option ${z === linea.zona ? 'selected' : ''}>${z}</option>`).join('')}</select></td>
<td><input class="corto" data-nombre="${i}" value="${esc(linea.nombre)}"></td>
<td><input class="corto" type="number" min="1" step="1" data-inicio="${i}" value="${linea.inicio ?? 1}"></td>
<td>${huecos || '<span class="mu">—</span>'}</td>
<td class="mu">${esc(codigo(linea, numeros[0]))} … ${esc(codigo(linea, numeros[numeros.length - 1]))}</td></tr>`;
}

function pasoLineas() {
  const avisos = revisar(layoutActual(), asistente.lineas).filter(a => !a.includes('escala'));
  return `<div class="card"><h2>3 · Nombre y zona de cada columna y fila</h2>
<p class="mu">Pase el cursor por una fila de la tabla para ver cuál es en el plano. Ajuste la <b>zona</b> (la app solo reconoce las cámaras de congelado) y el <b>nombre</b>; el código de cada ubicación será «nombre-número» (por ejemplo SB-17). Las columnas se numeran de abajo hacia arriba y las filas de izquierda a derecha.</p>
<p class="mu"><b>Importante:</b> la numeración que hay detrás de los huecos (puentes) no se puede leer de la imagen. Si el plano salta números después de un hueco, escriba aquí en qué número continúa; si no, se sigue de uno en uno.</p>
${avisos.map(a => `<p class="er-text">⚠ ${esc(a)}</p>`).join('')}
<div class="tw"><table><tr><th>N.º</th><th>Tipo</th><th>Ubicaciones</th><th>Zona</th><th>Nombre</th><th>Empieza en</th><th>Huecos</th><th>Códigos</th></tr>${asistente.lineas.map(filaDeLinea).join('')}</table></div>
<canvas id="lienzo" class="lienzo"></canvas></div>`;
}

function pasoEscala() {
  const layout = layoutActual();
  const ancho = layout.ancho * layout.metrosPorPixel;
  const alto = layout.alto * layout.metrosPorPixel;
  return `<div class="card"><h2>4 · Escala y muelle</h2>
<div class="grid g2"><div><p class="mu">¿Cuántos <b>metros</b> ocupa en la realidad cada ubicación (el largo de un recuadro más su espacio)? Con eso se convierte el plano a metros. Ejemplo: una posición de pallet mide alrededor de 1,2 m.</p>
<label class="campo-enlace"><span>Metros por ubicación</span><input id="metros" type="number" step="0.05" min="0.2" value="${asistente.metrosPorUbicacion}"></label>
<p class="mu">El plano completo mediría unos <b>${fmt(ancho)} m × ${fmt(alto)} m</b>. La regla verde del dibujo marca 10 m.</p></div>
<div><p class="mu"><b>Muelle:</b> haga clic en la imagen en el lugar donde sale y entra el picker (el muelle de despacho). Si no lo marca, se usa el punto propuesto: a la izquierda de la primera ubicación de abajo.</p></div></div>
<canvas id="lienzo" class="lienzo tomando"></canvas></div>`;
}

// Ubicaciones elegidas para la prueba: si no hay ninguna, se proponen unas repartidas por el plano
function paradasDePrueba(planta) {
  const picking = planta.racks.map(r => r.id);
  asistente.prueba = asistente.prueba.filter(id => planta.nodos[id]);
  if (!asistente.pruebaManual && !asistente.prueba.length && picking.length) {
    const paso = Math.max(1, Math.floor(picking.length / 6));
    for (let i = Math.floor(paso / 2); i < picking.length && asistente.prueba.length < 6; i += paso) asistente.prueba.push(picking[i]);
  }
  return [...asistente.prueba];
}

function pasoPrueba() {
  const layout = layoutActual();
  const planta = construirPlanta(layout);
  const elegidas = paradasDePrueba(planta);
  const paradas = paradasPorZonas(elegidas, planta);
  const recorrido = ['DOCK', ...paradas, 'DOCK'];
  let metros = 0;
  for (let i = 1; i < recorrido.length; i++) metros += planta.distancia(recorrido[i - 1], recorrido[i]);
  const tiempo = metros / ajustes.vel + paradas.length * ajustes.tpl;
  const sinCamino = planta.inaccesibles;

  return `<div class="card"><h2>5 · Pruebe el recorrido</h2>
<p class="mu">Se eligieron unas ubicaciones de picking de ejemplo. Haga clic en cualquier ubicación del plano para agregarla o quitarla de la prueba y pulse «Reproducir» para ver cómo camina el picker (seco → frío → congelado → muelle). Si el camino atraviesa una pared o no llega a alguna ubicación, vuelva al paso anterior y revise el muelle y la escala.</p>
${sinCamino.length ? `<p class="er-text">⚠ ${sinCamino.length} ubicaciones no tienen camino desde el muelle (${esc(sinCamino.slice(0, 6).join(', '))}${sinCamino.length > 6 ? '…' : ''}). Revise la posición del muelle.</p>` : '<p class="ok2">✔ Todas las ubicaciones tienen camino desde el muelle.</p>'}
<div class="grid">${kpi('Paradas de la prueba', paradas.length, 'ubicaciones elegidas')}${kpi('Distancia del recorrido', fmt(metros) + ' m', 'ida y vuelta al muelle')}${kpi('Tiempo estimado', fmt(tiempo / 60, 1) + ' min', `${ajustes.vel} m/s + ${ajustes.tpl} s por parada`)}</div>
<div class="row"><button class="btn" id="prueba-azar">Elegir otras al azar</button><button class="btn" id="prueba-limpiar">Quitar todas</button></div>
${dibujarPlano(planta, { recorrido, paradas, animable: true })}${controlesDeAnimacion()}</div>`;
}

function tarjetaDeTabla(nombre, filas, nota) {
  const vista = filas.slice(0, 7);
  return `<div class="card"><div class="row"><h2 style="flex:1">Pestaña «${nombre}» · ${fmt(filas.length - 1)} filas</h2><button class="btn p" data-copiar="${nombre}">📋 Copiar</button><button class="btn" data-bajar="${nombre}">⬇ Descargar CSV</button><span class="ok2" data-copiado="${nombre}"></span></div>
${nota ? `<p class="mu">${nota}</p>` : ''}
<div class="tw"><table>${vista.map((f, i) => `<tr>${f.map(c => (i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`)).join('')}</tr>`).join('')}</table></div>
${filas.length > 7 ? `<p class="mu">… y ${fmt(filas.length - 7)} filas más.</p>` : ''}</div>`;
}

function pasoGuardar() {
  const layout = layoutActual();
  const tablas = tablasParaSheet(layout);
  const avisos = revisar(layout, asistente.lineas);
  return `<div class="card"><h2>6 · Guarde el plano en su Google Sheet</h2>
<ol class="pasos"><li>En su Google Sheet cree tres pestañas con estos nombres exactos: <b>Layout</b>, <b>Ubicaciones</b> y <b>Muros</b> (esta última es opcional si no hay cámaras).</li><li>En cada una, pulse «Copiar» aquí, haga clic en la celda <b>A1</b> de la pestaña y pegue (Ctrl+V).</li><li>Vuelva a la pantalla Datos y pulse «Actualizar datos».</li></ol>
${avisos.map(a => `<p class="er-text">⚠ ${esc(a)}</p>`).join('')}</div>
${tarjetaDeTabla('Layout', tablas.Layout, 'Tamaño de la imagen, escala y posición del muelle.')}
${tarjetaDeTabla('Ubicaciones', tablas.Ubicaciones, 'Una fila por ubicación: código, zona, tipo y posición en el plano.')}
${tarjetaDeTabla('Muros', tablas.Muros, 'Tramos de muro de las cámaras (opcional).')}`;
}

// ---------------------------------------------------------------- pantalla
function render() {
  const pasos = PASOS.map(
    (nombre, i) =>
      `<button class="${asistente.paso === i + 1 ? 'on' : ''}" data-paso="${i + 1}" ${puedeIr(i + 1) ? '' : 'disabled'}>${i + 1} · ${nombre}</button>`
  ).join('');
  const contenido = [pasoImagen, pasoDeteccion, pasoLineas, pasoEscala, pasoPrueba, pasoGuardar][asistente.paso - 1]();
  const puedeSeguir = asistente.paso < PASOS.length && puedeIr(asistente.paso + 1);

  return (
    encabezado(TITULO, SUBTITULO, `<button class="btn" data-go="datos">← Volver a Datos</button>`) +
    `<div class="tabs asistente-pasos">${pasos}</div>${contenido}
<div class="row"><button class="btn" id="atras" ${asistente.paso > 1 ? '' : 'disabled'}>← Atrás</button><button class="btn p" id="siguiente" ${puedeSeguir ? '' : 'disabled'}>Siguiente →</button>${asistente.imagen ? '<button class="btn" id="empezar">Empezar con otra imagen</button>' : ''}</div>`
  );
}

// ---------------------------------------------------------------- dibujo sobre la imagen
const aPixelesDeImagen = (lienzo, e) => {
  const caja = lienzo.getBoundingClientRect();
  return { x: ((e.clientX - caja.left) * lienzo.width) / caja.width, y: ((e.clientY - caja.top) * lienzo.height) / caja.height };
};

function dibujarLienzo() {
  const lienzo = $('#lienzo');
  if (!lienzo || !asistente.fuente) return;
  lienzo.width = asistente.fuente.width;
  lienzo.height = asistente.fuente.height;
  const g = lienzo.getContext('2d');
  g.drawImage(asistente.fuente, 0, 0);
  const { paso, lectura } = asistente;

  if (paso === 2 && lectura) {
    g.lineWidth = 3;
    lectura.celdas.forEach(c => {
      g.strokeStyle = '#000';
      g.strokeRect(c.x - c.ancho / 2 - 1, c.y - c.alto / 2 - 1, c.ancho + 2, c.alto + 2);
    });
    g.fillStyle = 'rgba(220,38,38,.55)';
    lectura.muros.forEach(m => g.fillRect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0));
    // Pasillos detectados (transitables) en verde para revisar que cubren lo correcto
    g.fillStyle = 'rgba(22,163,74,.28)';
    (lectura.pasillos || []).forEach(p => g.fillRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0));
  }

  if (paso === 3) {
    asistente.lineas.forEach((linea, i) => {
      const color = COLOR_DE_ZONA[linea.zona];
      const resaltada = asistente.resaltada === i;
      g.fillStyle = color + (resaltada ? 'cc' : '55');
      g.strokeStyle = color;
      g.lineWidth = resaltada ? 5 : 2;
      linea.celdas.forEach(c => {
        g.fillRect(c.x - c.ancho / 2, c.y - c.alto / 2, c.ancho, c.alto);
        g.strokeRect(c.x - c.ancho / 2, c.y - c.alto / 2, c.ancho, c.alto);
      });
      const primera = linea.celdas[0];
      g.font = 'bold 26px sans-serif';
      g.textAlign = 'center';
      g.lineWidth = 6;
      g.strokeStyle = '#fff';
      const y = linea.orientacion === 'columna' ? primera.y + primera.alto / 2 + 34 : primera.y + 9;
      const x = linea.orientacion === 'columna' ? primera.x : primera.x - primera.ancho / 2 - 30;
      g.strokeText(`${i + 1}`, x, y);
      g.fillStyle = '#111';
      g.fillText(`${i + 1}`, x, y);
    });
  }

  if (paso === 4) {
    const layout = layoutActual();
    const { x, y } = asistente.muelle;
    g.fillStyle = '#16a34a';
    g.fillRect(x - 40, y - 24, 80, 48);
    g.fillStyle = '#fff';
    g.font = 'bold 20px sans-serif';
    g.textAlign = 'center';
    g.fillText('MUELLE', x, y + 7);
    // regla de 10 metros
    const largo = 10 / layout.metrosPorPixel;
    g.fillStyle = '#16a34a';
    g.fillRect(30, lienzo.height - 40, largo, 8);
    g.font = 'bold 20px sans-serif';
    g.textAlign = 'left';
    g.fillText('10 m', 30 + largo + 8, lienzo.height - 30);
  }
}

// ---------------------------------------------------------------- eventos
function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
  return new Promise((resolver, rechazar) => {
    const area = document.createElement('textarea');
    area.value = texto;
    document.body.appendChild(area);
    area.select();
    const bien = document.execCommand('copy');
    area.remove();
    bien ? resolver() : rechazar(new Error('no se pudo copiar'));
  });
}

function enlazar({ refrescar }) {
  alClick('[data-paso]', boton => {
    asistente.paso = +boton.dataset.paso;
    refrescar();
  });
  alClick('#atras', () => {
    asistente.paso--;
    refrescar();
  });
  alClick('#siguiente', () => {
    asistente.paso++;
    refrescar();
  });
  alClick('#empezar', () => {
    Object.assign(asistente, { paso: 1, imagen: null, fuente: null, lectura: null, lineas: [], archivo: '', prueba: [], pruebaManual: false, tomando: null, mensaje: '' });
    refrescar();
  });

  // Paso 1: elegir el archivo
  const archivo = $('#archivo');
  if (archivo) {
    archivo.onchange = async () => {
      if (!archivo.files[0]) return;
      await cargarImagen(archivo.files[0]);
      if (asistente.imagen) asistente.paso = 2;
      refrescar();
    };
  }

  // Paso 2: tomar un color de la imagen
  alClick('[data-color]', boton => {
    asistente.tomando = asistente.tomando === boton.dataset.color ? null : boton.dataset.color;
    refrescar();
  });

  const lienzo = $('#lienzo');
  if (lienzo && asistente.paso === 2) {
    lienzo.onclick = e => {
      if (!asistente.tomando) return;
      const { x, y } = aPixelesDeImagen(lienzo, e);
      asistente.paleta[asistente.tomando] = colorEn(asistente.imagen, x, y);
      asistente.tomando = null;
      detectar();
      refrescar();
    };
  }

  // Paso 3: nombres, zonas y numeración
  alCambiarCada('[data-zona]', (valor, el) => {
    asistente.lineas[+el.dataset.zona].zona = valor;
    proponerNombres(asistente.lineas);
    refrescar();
  });
  alCambiarCada('[data-nombre]', (valor, el) => {
    const linea = asistente.lineas[+el.dataset.nombre];
    linea.nombre = valor.trim().toUpperCase() || linea.nombre;
    linea.nombreManual = true;
    refrescar();
  });
  alCambiarCada('[data-inicio]', (valor, el) => {
    asistente.lineas[+el.dataset.inicio].inicio = Math.max(1, Math.round(Number(valor)) || 1);
    refrescar();
  });
  alCambiarCada('[data-hueco]', (valor, el) => {
    const [i, despuesDe] = el.dataset.hueco.split(':').map(Number);
    const linea = asistente.lineas[i];
    linea.saltos = linea.saltos || {};
    if (valor === '') delete linea.saltos[despuesDe];
    else linea.saltos[despuesDe] = Math.max(1, Math.round(Number(valor)));
    refrescar();
  });
  $$('tr[data-linea]').forEach(fila => {
    fila.onmouseenter = () => {
      asistente.resaltada = +fila.dataset.linea;
      dibujarLienzo();
    };
    fila.onmouseleave = () => {
      asistente.resaltada = null;
      dibujarLienzo();
    };
  });

  // Paso 4: escala y muelle
  alCambiarCada('#metros', valor => {
    asistente.metrosPorUbicacion = Math.max(0.2, Number(valor) || 1.2);
    refrescar();
  });
  if (lienzo && asistente.paso === 4) {
    lienzo.onclick = e => {
      const { x, y } = aPixelesDeImagen(lienzo, e);
      asistente.muelle = { x: Math.round(x), y: Math.round(y) };
      dibujarLienzo();
    };
  }

  // Paso 5: elegir las ubicaciones de la prueba
  if (asistente.paso === 5) {
    $$('svg.plano rect[data-ubicacion]').forEach(rect => {
      rect.style.cursor = 'pointer';
      rect.onclick = () => {
        const id = rect.dataset.ubicacion;
        asistente.prueba = asistente.prueba.includes(id) ? asistente.prueba.filter(x => x !== id) : [...asistente.prueba, id];
        asistente.pruebaManual = true;
        refrescar();
      };
    });
    alClick('#prueba-limpiar', () => {
      asistente.prueba = [];
      asistente.pruebaManual = true;
      refrescar();
    });
    alClick('#prueba-azar', () => {
      const planta = construirPlanta(layoutActual());
      const ids = planta.racks.map(r => r.id);
      asistente.prueba = [...ids].sort(() => Math.random() - 0.5).slice(0, 6);
      asistente.pruebaManual = true;
      refrescar();
    });
    const layout = layoutActual();
    const planta = construirPlanta(layout);
    const paradas = paradasPorZonas(asistente.prueba.filter(id => planta.nodos[id]), planta);
    iniciarAnimacion({
      planta,
      recorrido: ['DOCK', ...paradas, 'DOCK'],
      paradas,
      lineasPorParada: {},
      ajustes,
      descripcion: id => `(${planta.nodos[id].tipo})`
    });
  }

  // Paso 6: copiar o descargar cada pestaña
  if (asistente.paso === 6) {
    const tablas = tablasParaSheet(layoutActual());
    alClick('[data-copiar]', async boton => {
      const nombre = boton.dataset.copiar;
      const marca = $(`[data-copiado="${nombre}"]`);
      try {
        await copiarTexto(aTsv(tablas[nombre]));
        marca.textContent = '✔ Copiado. Péguelo en la celda A1.';
      } catch (e) {
        marca.textContent = 'No se pudo copiar: use «Descargar CSV».';
      }
    });
    alClick('[data-bajar]', boton => descargarCsv('layout_' + boton.dataset.bajar.toLowerCase(), tablas[boton.dataset.bajar]));
  }

  dibujarLienzo();
}

__e.default = {
  id: 'layout',
  titulo: 'Configurar layout',
  icono: '▦',
  color: '#1e3a8a',
  oculta: true, // no aparece en el menú: se entra desde Datos
  padre: 'datos',
  render,
  enlazar
};


return __e;
})();

// ===== main.js =====
__m["main.js"] = (function () {
const __e = {};
// Punto de entrada: arma el menú, muestra la pantalla elegida y lee el Sheet guardado al abrir.

const { ajustes, conexion, modelo } = __m["nucleo/estado.js"];
const { $, $$ } = __m["nucleo/dom.js"];
const { leerPreferencias, guardarPreferencias, limpiarVersionAnterior } = __m["nucleo/almacenamiento.js"];
const { recalcular } = __m["modelo.js"];
const { sincronizar } = __m["sincronizacion.js"];

const panel = __m["modulos/panel/vista.js"].default;
const datos = __m["modulos/datos/vista.js"].default;
const diagnostico = __m["modulos/diagnostico/vista.js"].default;
const ubicaciones = __m["modulos/ubicaciones/vista.js"].default;
const picking = __m["modulos/picking/vista.js"].default;
const inventario = __m["modulos/inventario/vista.js"].default;
const escenarios = __m["modulos/escenarios/vista.js"].default;
const ajustesPantalla = __m["modulos/ajustes/vista.js"].default;
const layout = __m["modulos/layout/vista.js"].default;

// Orden del menú. La sección se muestra como título cuando cambia.
const PANTALLAS = [panel, datos, layout, diagnostico, ubicaciones, picking, inventario, escenarios, ajustesPantalla];
const POR_ID = Object.fromEntries(PANTALLAS.map(p => [p.id, p]));

// ---------------------------------------------------------------- acceso
// Dos usuarios fijos, sin registro. Es un control de acceso de la interfaz: quien pueda
// leer el código puede ver las contraseñas. Para proteger datos reales hace falta un servidor.

// El enlace del Sheet lo pone el supervisor en Datos. El operario lo recibe en la dirección
// (?hoja=…) que copia el supervisor, y lo guarda solo en la pestaña abierta (no en este navegador).
const CLAVE_HOJA = 'axionlog-hoja';

const USUARIOS = {
  supervisor: { clave: 'Supervisor2026!', nombre: 'Supervisor', puedeEditar: true },
  operario: { clave: 'Operario2026!', nombre: 'Operario', puedeEditar: false }
};
// El operario ve estas pantallas en solo lectura (campos deshabilitados, sin botones de guardar)
const PANTALLAS_SOLO_LECTURA = ['datos', 'aju'];
// Pantallas que el operario no puede abrir ni ver en la pantalla Datos
const PANTALLAS_SOLO_SUPERVISOR = ['layout'];
// Cada cuántos minutos se vuelve a leer el Sheet, para que ambos vean los cambios del otro
const MINUTOS_ACTUALIZACION = 5;
const CLAVE_SESION = 'axionlog-sesion';

function usuarioActual() {
  try {
    const usuario = sessionStorage.getItem(CLAVE_SESION);
    return USUARIOS[usuario] ? USUARIOS[usuario] : null;
  } catch (e) {
    return null;
  }
}

function usuarioActivo() {
  return usuarioActual() ? sessionStorage.getItem(CLAVE_SESION) : null;
}

const puedeEditar = () => !!(usuarioActual() && usuarioActual().puedeEditar);

function dibujarLogin(mensaje = '') {
  document.body.classList.add('sin-sesion');
  $('#view').innerHTML = `<div class="login-wrap"><form class="card login" id="login-form" autocomplete="off">
<div class="login-marca">✱ AXIONLOG</div><p class="mu">Planta 0801 · Gestión OTIF</p><h2 style="margin-top:12px">Iniciar sesión</h2>
<label class="campo-enlace"><span>Usuario</span><input id="login-usuario" autocomplete="username" required></label>
<label class="campo-enlace"><span>Contraseña</span><input id="login-clave" type="password" autocomplete="current-password" required></label>
<p class="er-text">${mensaje}</p>
<button class="btn p" type="submit">Entrar</button></form></div>`;
  $('#login-form').onsubmit = e => {
    e.preventDefault();
    intentarEntrar($('#login-usuario').value.trim().toLowerCase(), $('#login-clave').value);
  };
  $('#login-usuario').focus();
}

function intentarEntrar(usuario, clave) {
  if (!USUARIOS[usuario] || USUARIOS[usuario].clave !== clave) {
    dibujarLogin('Usuario o contraseña incorrectos.');
    return;
  }
  try {
    sessionStorage.setItem(CLAVE_SESION, usuario);
  } catch (e) {
    // sin almacenamiento: la sesión dura solo hasta recargar
  }
  // El operario solo usa el Sheet que recibió en esta pestaña, no el que guardó el supervisor
  if (!USUARIOS[usuario].puedeEditar) {
    try {
      conexion.enlace = sessionStorage.getItem(CLAVE_HOJA) || '';
    } catch (e) {
      conexion.enlace = '';
    }
  }
  entrar();
}

function entrar() {
  document.body.classList.remove('sin-sesion');
  ir('panel');
  // Se vuelve a leer el mismo Sheet cada vez que se abre la app
  if (conexion.enlace) contexto.sincronizar(conexion.enlace);
}

function cerrarSesion() {
  // Al cerrar sesión, el supervisor olvida el enlace del Sheet de este navegador (los ajustes se conservan)
  if (puedeEditar()) {
    conexion.enlace = '';
    guardarPreferencias({ enlace: '', ajustes: leerPreferencias().ajustes || {} });
  }
  try {
    sessionStorage.removeItem(CLAVE_SESION);
  } catch (e) {
    // nada que borrar
  }
  dibujarLogin();
}

let actual = 'panel';

// Íconos del menú: SVG con el mismo trazo y tamaño para todos los módulos
const ICONOS_MENU = {
  panel: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  datos: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  diag: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  ubic: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  pick: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5"/>',
  inv: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  esc: '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/>',
  aju: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  layout: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>'
};

// Insignias con cifras de lo que pide atención (solo se muestran si son mayores que cero)
function insigniasMenu() {
  return {
    inv: modelo.inventario ? modelo.inventario.pedir.length : 0,
    ubic: modelo.ubicaciones ? modelo.ubicaciones.sinUbicacion : 0
  };
}

function dibujarMenu() {
  let seccion = null;
  const insignias = insigniasMenu();
  $('#nav').innerHTML = PANTALLAS.filter(p => !p.oculta).map(p => {
    const titulo = p.seccion && p.seccion !== seccion ? `<h6>${(seccion = p.seccion)}</h6>` : '';
    const n = insignias[p.id] || 0;
    const marca = n > 0 ? `<em class="bdg" title="${n} por revisar">${n > 999 ? '999+' : n}</em>` : '';
    return `${titulo}<a data-go="${p.id}" title="${p.titulo}" class="${p.id === actual ? 'on' : ''}" style="--c:${p.color}"><i>${ICONOS_MENU[p.id] ? `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS_MENU[p.id]}</svg>` : p.icono}</i><span>${p.titulo}</span>${marca}</a>`;
  }).join('');
  activarMenuCompacto();
}

// Copia texto al portapapeles (también funciona fuera de https)
function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
  return new Promise((resolver, rechazar) => {
    const area = document.createElement('textarea');
    area.value = texto;
    document.body.appendChild(area);
    area.select();
    const bien = document.execCommand('copy');
    area.remove();
    bien ? resolver() : rechazar(new Error('no se pudo copiar'));
  });
}

// Contexto que reciben las pantallas para pedir cosas a la app sin conocerla por dentro.
// Solo el supervisor recuerda el enlace en este navegador.
const contexto = {
  ir,
  refrescar,
  copiar: copiarTexto,
  sincronizar: enlace => sincronizar(enlace, refrescar, { recordar: puedeEditar() }),
  guardarAjustes() {
    guardarPreferencias({ enlace: conexion.enlace, ajustes });
    recalcular();
    refrescar();
  }
};

// Al operario se le quita todo lo que pueda cambiar datos o ajustes
function restringirVista(id) {
  $$('[data-go]', $('#view')).forEach(b => {
    if (PANTALLAS_SOLO_SUPERVISOR.includes(b.dataset.go)) b.remove();
  });
  if (!PANTALLAS_SOLO_LECTURA.includes(id)) return;
  $$('#view input, #view select').forEach(c => (c.disabled = true));
  ['#guardar', '#restablecer'].forEach(s => {
    const boton = $(s, $('#view'));
    if (boton) boton.style.display = 'none';
  });
}

function dibujar() {
  if (!usuarioActivo()) return dibujarLogin();
  const pantalla = POR_ID[actual];
  // una pantalla oculta del menú (como Configurar layout) deja marcada la pantalla de la que viene
  const marcada = pantalla.padre || actual;
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.go === marcada));
  $('#view').innerHTML = pantalla.render({ editable: puedeEditar() });
  if (pantalla.enlazar) pantalla.enlazar(contexto);
  if (!puedeEditar()) restringirVista(pantalla.id);
  // Botones «Ir a …» que puede haber en cualquier pantalla
  $$('[data-go]', $('#view')).forEach(b => (b.onclick = () => ir(b.dataset.go, b.dataset)));
}

function ir(id, opciones = {}) {
  if (!puedeEditar() && PANTALLAS_SOLO_SUPERVISOR.includes(id)) id = 'panel';
  actual = id;
  if (POR_ID[id].alEntrar) POR_ID[id].alEntrar(opciones);
  dibujar();
  scrollTo(0, 0);
}

// Redibuja la pantalla actual sin perder la posición
function refrescar() {
  const y = scrollY;
  dibujar();
  scrollTo(0, y);
}

// La lectura automática no redibuja mientras se escribe en un campo: se perdería lo escrito
function refrescarAutomatico() {
  const activo = document.activeElement;
  if (activo && $('#view').contains(activo) && /^(INPUT|SELECT|TEXTAREA)$/.test(activo.tagName)) return;
  refrescar();
}

function activarMenuCompacto() {
  $('#hide').onclick = () => {
    const compacto = $('#side').classList.toggle('mini');
    $('#hi').textContent = compacto ? '»' : '«';
  };
  $$('#nav a').forEach(a => (a.onclick = () => ir(a.dataset.go)));
  $('#salir').onclick = cerrarSesion;
}

// Qué Sheet leer: el de la dirección (?hoja=…), el que recordó el operario en esta pestaña,
// o el que guardó el supervisor en este navegador.
function enlaceInicial(guardado) {
  try {
    const id = new URLSearchParams(location.search).get('hoja');
    if (id && /^[\w-]+$/.test(id)) {
      const enlace = `https://docs.google.com/spreadsheets/d/${id}/edit`;
      sessionStorage.setItem(CLAVE_HOJA, enlace); // esta pestaña recuerda el Sheet del enlace
      return enlace;
    }
    // Operario con sesión ya iniciada en esta pestaña: el Sheet que recibió en esta pestaña
    const usuario = USUARIOS[sessionStorage.getItem(CLAVE_SESION)];
    if (usuario && !usuario.puedeEditar) return sessionStorage.getItem(CLAVE_HOJA) || '';
  } catch (e) {
    // sin almacenamiento de sesión: se usa el enlace guardado
  }
  // Supervisor (o nadie todavía): el enlace que guardó en este navegador
  return guardado.enlace || '';
}

function iniciar() {
  limpiarVersionAnterior();
  const guardado = leerPreferencias();
  Object.assign(ajustes, guardado.ajustes || {});
  conexion.enlace = enlaceInicial(guardado);

  dibujarMenu();
  document.addEventListener('modelo-actualizado', dibujarMenu);
  recalcular();
  if (usuarioActivo()) entrar();
  else dibujarLogin();

  // Ambos usuarios vuelven a leer el Sheet para ver los cambios del otro
  setInterval(() => {
    if (usuarioActivo()) sincronizar(conexion.enlace, refrescarAutomatico, { recordar: puedeEditar() });
  }, MINUTOS_ACTUALIZACION * 60 * 1000);
}

iniciar();


return __e;
})();

})();
