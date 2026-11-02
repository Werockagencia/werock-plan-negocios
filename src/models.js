// Modelos financieros. Funciones puras: reciben supuestos, devuelven números.
const SMMLV = 1750905;      // Decreto 1469 de 2025
const AUX = 249095;         // Decreto 1470 de 2025
const FACTOR = 1.389;       // prestaciones + seguridad social de una SAS exonerada de salud/SENA/ICBF
const MESES = 60;
const RAMPA = [0.45, 0.55, 0.63, 0.70, 0.76, 0.81, 0.85, 0.89, 0.92, 0.95, 0.97];
const rampa = m => (m < RAMPA.length ? RAMPA[m] : 1);

function nomina(staff, recargo) {
  let base = 0, aux = 0, personas = 0;
  staff.forEach(p => {
    base += p.n * p.salario;
    personas += p.n;
    if (p.salario <= 2 * SMMLV) aux += p.n * AUX;
  });
  const recargos = base * recargo;
  return { base, aux, recargos, personas, total: base * FACTOR + aux + recargos };
}

const BAKED_FORMATOS = {
  completo: {
    nombre: 'Local con tarima',
    m2: 160, puestos: 80,
    staff: [
      { rol: 'Gerente / administrador', n: 1, salario: 5000000 },
      { rol: 'Jefe de cocina', n: 1, salario: 4500000 },
      { rol: 'Cocinero de hornos y línea', n: 2, salario: 2300000 },
      { rol: 'Auxiliar de cocina', n: 3, salario: SMMLV },
      { rol: 'Steward / aseo', n: 2, salario: SMMLV },
      { rol: 'Cajero / host', n: 1, salario: 1900000 },
      { rol: 'Mesero', n: 4, salario: SMMLV },
      { rol: 'Bartender', n: 1, salario: 2100000 },
      { rol: 'Domiciliario propio', n: 1, salario: SMMLV },
    ],
    recargo: 0.12,
    capex: [
      ['Adecuación: obra, redes de gas y eléctricas, baños, ductos de extracción', 95e6],
      ['Cocina: 2 hornos de convección, horno rostizador, campana, refrigeración, acero', 85e6],
      ['Salón y barra para 80 puestos', 45e6],
      ['Tarima, sonido e iluminación', 40e6],
      ['Insonorización (obligatoria para música en vivo en Cajicá)', 20e6],
      ['Diseño interior, señalética y menaje de marca', 20e6],
      ['Tecnología: POS, cámaras, wifi', 8e6],
      ['Legal y permisos: marca SIC, uso de suelo, bomberos, sanidad, Sayco-Acinpro', 9e6],
      ['Depósito de arriendo (2 meses)', 20e6],
      ['Inventario inicial y dotación', 15e6],
      ['Preapertura: 3 semanas de nómina en entrenamiento y pruebas', 40e6],
      ['Lanzamiento: pauta, evento de apertura, contenido', 20e6],
    ],
    defaults: {
      cubiertos: 60, ticket: 42000, domicilios: 35, ticketDom: 60000,
      noches: 12, asistentes: 80, ticketNoche: 65000, costoNoche: 1400000,
      costoMP: 33, pctApps: 60, arriendo: 10000000, servicios: 6000000, marketing: 6000000,
    },
    admin: 5700000,
  },
  fase1: {
    nombre: 'Fase 1 sin tarima',
    m2: 70, puestos: 30,
    staff: [
      { rol: 'Administrador', n: 1, salario: 3800000 },
      { rol: 'Jefe de cocina', n: 1, salario: 3800000 },
      { rol: 'Cocinero de hornos', n: 1, salario: 2200000 },
      { rol: 'Auxiliar de cocina', n: 2, salario: SMMLV },
      { rol: 'Steward / aseo', n: 1, salario: SMMLV },
      { rol: 'Cajero / host', n: 1, salario: 1900000 },
      { rol: 'Mesero', n: 1, salario: SMMLV },
      { rol: 'Domiciliario propio', n: 1, salario: SMMLV },
    ],
    recargo: 0.10,
    capex: [
      ['Adecuación: obra, redes de gas y eléctricas, extracción', 45e6],
      ['Cocina: 2 hornos de convección, campana, refrigeración, acero', 60e6],
      ['Salón para 30 puestos', 15e6],
      ['Diseño interior, señalética y menaje de marca', 12e6],
      ['Tecnología: POS, cámaras, wifi', 6e6],
      ['Legal y permisos: marca SIC, uso de suelo, bomberos, sanidad', 6e6],
      ['Depósito de arriendo (2 meses)', 9e6],
      ['Inventario inicial y dotación', 10e6],
      ['Preapertura: nómina en entrenamiento y pruebas', 20e6],
      ['Lanzamiento: pauta y contenido', 15e6],
    ],
    defaults: {
      cubiertos: 30, ticket: 40000, domicilios: 45, ticketDom: 60000,
      noches: 0, asistentes: 0, ticketNoche: 65000, costoNoche: 1400000,
      costoMP: 33, pctApps: 60, arriendo: 4500000, servicios: 3500000, marketing: 5000000,
    },
    admin: 3500000,
  },
};

const ESCENARIOS = { conservador: 0.7, base: 1, optimista: 1.2 };

function modeloBaked(formato, s, escenario) {
  const f = BAKED_FORMATOS[formato];
  const k = ESCENARIOS[escenario];
  const v = {
    salon: s.cubiertos * k * s.ticket * 30,
    dom: s.domicilios * k * s.ticketDom * 30,
    noches: s.noches * s.asistentes * k * s.ticketNoche,
  };
  const bruto = v.salon + v.dom + v.noches;
  const INC = 1.08;                               // impuesto al consumo de restaurantes
  const neto = bruto / INC;
  const domNeto = v.dom / INC;
  const variables = {
    mp: neto * s.costoMP / 100,
    apps: domNeto * s.pctApps / 100 * 0.28,       // comisión de apps: 28%
    empaques: domNeto * 0.05,
    datafono: neto * 0.6 * 0.022,                 // 60% de pagos con tarjeta al 2,2%
    ica: neto * 0.01,
  };
  const nom = nomina(f.staff, f.recargo);
  const fijos = {
    nomina: nom.total,
    arriendo: s.arriendo,
    servicios: s.servicios,
    musica: s.noches > 0 ? s.noches * s.costoNoche + 600000 : 0,
    marketing: s.marketing,
    admin: f.admin,
  };
  const totVar = Object.values(variables).reduce((a, b) => a + b, 0);
  const totFijo = Object.values(fijos).reduce((a, b) => a + b, 0);
  const ebitda = neto - totVar - totFijo;
  const contrib = neto > 0 ? 1 - totVar / neto : 0;
  const equilibrioNeto = contrib > 0 ? totFijo / contrib : Infinity;
  const equilibrioBruto = equilibrioNeto * INC;
  const capexSub = f.capex.reduce((a, c) => a + c[1], 0);
  const capex = capexSub * 1.1;

  // Flujo de 36 meses: las ventas suben con la rampa, los costos fijos están desde el mes 1
  const flujo = [];
  let acumOp = 0, minOp = 0, acum = -capex, payback = null;
  for (let m = 0; m < MESES; m++) {
    const r = rampa(m);
    const res = neto * r * (1 - totVar / (neto || 1)) - totFijo;
    acumOp += res;
    acum += res;
    minOp = Math.min(minOp, acumOp);
    if (payback === null && acum >= 0) payback = m + 1;
    flujo.push(acum);
  }
  const colchon = totFijo * 3;
  const capital = capex - minOp + colchon;
  const primerMesPositivo = (() => {
    for (let m = 0; m < MESES; m++) if (neto * rampa(m) * contrib - totFijo > 0) return m + 1;
    return null;
  })();
  return { f, v, bruto, neto, variables, fijos, nom, totVar, totFijo, ebitda, contrib,
    equilibrioBruto, capexSub, capex, flujo, minOp, colchon, capital, payback, primerMesPositivo };
}

// ---------- Cocinas ----------
function embudo(presupuesto, cpl, pctDiseno, pctCierre) {
  const leads = presupuesto / cpl;
  const disenos = leads * pctDiseno / 100;
  const proyectos = disenos * pctCierre / 100;
  return { leads, disenos, proyectos };
}

// La obra la paga el cliente: anticipo para materiales y pagos por avance para mano de obra.
// De caja solo sale la pauta, las herramientas y un montaje mínimo. El trabajo de We Rock va aparte (aporteWeRock).
const cplMes = (s, m) => (m < 3 ? s.cpl * 1.4 : s.cpl);   // los primeros 3 meses la pauta aprende

function modeloMiami(s) {
  const e = embudo(s.ads, s.cpl, s.pctDiseno, s.pctCierre);
  const porProyecto = s.ticket * s.margen / 100 * s.part / 100;
  const fees = (e.disenos - e.proyectos) * s.fee;   // a quien firma se le abona el diseño
  const ingreso = e.proyectos * porProyecto + fees;
  const pautaPropia = s.ads * (1 - s.pautaSocio / 100);
  const costo = pautaPropia + s.herramientas;
  const neto = ingreso - costo;
  const setup = 1000;                               // revisión del contrato con abogado en Florida
  const flujo = [];
  let acum = -setup, payback = null, minAcum = -setup;
  for (let m = 0; m < MESES; m++) {
    const em = embudo(s.ads, cplMes(s, m), s.pctDiseno, s.pctCierre);
    // un lead tarda ~1 mes en firmar. Parte de la participación se cobra con el anticipo
    // del cliente y el resto al entregar la obra (~3 meses después de firmar)
    const firmados = mm => (mm >= 1 ? embudo(s.ads, cplMes(s, mm - 1), s.pctDiseno, s.pctCierre).proyectos : 0);
    let cobro = firmados(m) * porProyecto * s.pagoFirma / 100;
    if (m >= 3) cobro += firmados(m - 3) * porProyecto * (1 - s.pagoFirma / 100);
    acum += cobro + (em.disenos - em.proyectos) * s.fee - costo;
    minAcum = Math.min(minAcum, acum);
    if (payback === null && acum >= 0) payback = m + 1;
    flujo.push(acum);
  }
  return { e, porProyecto, fees, ingreso, costo, pautaPropia, neto, setup, flujo, payback,
    capital: -minAcum, netoCOP: neto * s.trm };
}

function modeloColombia(s) {
  const e = embudo(s.ads, s.cpl, s.pctDiseno, s.pctCierre);
  const porProyecto = s.ticket * (s.margen - 3) / 100;  // 3% reservado para garantías
  const fees = (e.disenos - e.proyectos) * s.fee;
  const ingreso = e.proyectos * porProyecto + fees;
  const costo = s.ads + s.fijos;
  const neto = ingreso - costo;
  const setup = 2000000;                            // contrato modelo revisado por abogado y registro
  const flujo = [];
  let acum = -setup, payback = null, minAcum = -setup;
  for (let m = 0; m < MESES; m++) {
    const em = embudo(s.ads, cplMes(s, m), s.pctDiseno, s.pctCierre);
    // un lead tarda ~1 mes en firmar. El anticipo del 60% paga materiales y con el 30%
    // de la instalación (~1 mes después) queda el margen
    let cobrados = 0;
    if (m >= 2) cobrados = embudo(s.ads, cplMes(s, m - 2), s.pctDiseno, s.pctCierre).proyectos;
    acum += cobrados * porProyecto + (em.disenos - em.proyectos) * s.fee - costo;
    minAcum = Math.min(minAcum, acum);
    if (payback === null && acum >= 0) payback = m + 1;
    flujo.push(acum);
  }
  return { e, porProyecto, fees, ingreso, costo, neto, setup, flujo, payback, capital: -minAcum };
}

// Trabajo que pone We Rock y no sale de caja, valorado a sus tarifas regulares
function aporteWeRock(disenosMes) {
  const unaVez = [
    ['Marca y web bilingüe con cotizador', 8000000],
    ['CRM y WhatsApp automatizado', 3000000],
    ['Portafolio: renders, fotos y video editados', 3000000],
  ];
  const mensual = [
    ['Gestión de pauta Colombia (Google + Meta)', 2100000],
    ['Gestión de pauta Miami (Google + Meta)', 2100000],
    ['Contenido para los dos mercados', 1300000],
    [`Diseño de propuestas y despiece (${dec1(disenosMes)} diseños)`, disenosMes * 250000],
  ];
  const tUnaVez = unaVez.reduce((a, c) => a + c[1], 0);
  const tMes = mensual.reduce((a, c) => a + c[1], 0);
  return { unaVez, mensual, tUnaVez, tMes, anio1: tUnaVez + tMes * 12 };
}
const dec1 = n => n.toLocaleString('es-CO', { maximumFractionDigits: 1 });

// ---------- Plataforma de carga (SafeTrip como operador ancla) ----------
// Viajes nuevos que trae el marketing: suben en línea recta desde el mes 4 hasta la meta en el mes 15
const rampaViajes = (m, meta) => (m < 3 ? 0 : Math.min(1, (m - 2) / 12) * meta);

function modeloPlataforma(s) {
  const flujo = [], porAnio = [0, 0, 0].map(() => ({ ingreso: 0, costo: 0 }));
  let acum = 0, minAcum = 0, payback = null, regimen = null;
  const entrada = k => 15 + k * Math.round(12 / Math.max(1, s.operadoresExtra)); // mes (0-index) en que entra cada operador nuevo
  for (let m = 0; m < MESES; m++) {
    let ing = 0, cos = 0;
    // Construcción del MVP en los meses 1 a 3
    if (m < 3) cos += s.costoMVP / 3;
    if (m === 0 || m === 2) ing += s.implementacion / 2;          // 50% al firmar, 50% al entregar
    if (m >= 1) cos += s.marketing;                                // pauta y contenido para traer clientes
    if (m >= 3) {
      cos += s.operacion;                                          // desarrollador, servidores, soporte
      ing += s.licencia;
      ing += s.viajesActuales * s.flete * s.feePlataforma / 100;   // propios y terceros que pasan por la plataforma
      ing += rampaViajes(m, s.viajesNuevos) * s.flete * s.comisionNuevos / 100;
    }
    for (let k = 0; k < s.operadoresExtra * 2; k++) {
      const e = entrada(k);
      if (m === e) { ing += 15000000; cos += 5000000; }            // implementación de un operador nuevo
      if (m > e) { ing += s.licencia + 30 * s.flete * s.feePlataforma / 100; cos += 1500000; }
    }
    acum += ing - cos;
    minAcum = Math.min(minAcum, acum);
    if (payback === null && m >= 3 && acum >= 0) payback = m + 1;
    if (m < 36) { porAnio[Math.floor(m / 12)].ingreso += ing; porAnio[Math.floor(m / 12)].costo += cos; }
    if (m === 35) regimen = ing - cos;
    flujo.push(acum);
  }
  // Mes típico con SafeTrip ya en meta (sin operadores extra)
  const st = {
    licencia: s.licencia,
    feeActuales: s.viajesActuales * s.flete * s.feePlataforma / 100,
    comisionNuevos: s.viajesNuevos * s.flete * s.comisionNuevos / 100,
  };
  st.ingreso = st.licencia + st.feeActuales + st.comisionNuevos;
  st.costo = s.operacion + s.marketing;
  st.neto = st.ingreso - st.costo;
  const porOperador = s.licencia + 30 * s.flete * s.feePlataforma / 100 - 1500000;
  return { flujo, porAnio, payback, regimen, st, porOperador, capital: -minAcum + (s.operacion + s.marketing) * 3, minAcum };
}

if (typeof module !== 'undefined') module.exports = {
  modeloBaked, modeloMiami, modeloColombia, aporteWeRock, modeloPlataforma, BAKED_FORMATOS, nomina, SMMLV,
};
