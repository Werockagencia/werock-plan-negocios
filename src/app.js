const $ = s => document.querySelector(s);
const M = n => (Math.abs(n) >= 1e6 ? (n / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' M' : Math.round(n).toLocaleString('es-CO'));
const cop = n => (n < 0 ? '−$' : '$') + M(Math.abs(n));
const usd = n => (n < 0 ? '−US$' : 'US$') + Math.round(Math.abs(n)).toLocaleString('es-CO');
const dec = (n, d = 1) => n.toLocaleString('es-CO', { maximumFractionDigits: d });
const pct = n => dec(n * 100) + '%';
const cls = n => (n >= 0 ? 'pos' : 'neg');
const mes = m => (m ? 'Mes ' + m : 'Más de 5 años');

const state = {
  formato: 'completo', escenario: 'base',
  baked: { ...BAKED_FORMATOS.completo.defaults },
  miami: { ads: 3000, cpl: 160, pctDiseno: 25, pctCierre: 33, ticket: 38000, margen: 25, part: 40, fee: 500, herramientas: 150, pagoFirma: 50, pautaSocio: 0, trm: 4000 },
  col: { ads: 3000000, cpl: 55000, pctDiseno: 12, pctCierre: 30, ticket: 35000000, margen: 32, fee: 350000, fijos: 1500000 },
  trip: { implementacion: 35000000, costoMVP: 60000000, licencia: 4500000, operacion: 7500000, marketing: 5000000, flete: 4200000, viajesActuales: 40, feePlataforma: 1.5, viajesNuevos: 60, comisionNuevos: 4, operadoresExtra: 2 },
};
const BASE = JSON.parse(JSON.stringify(state));

const CAMPOS = {
  baked: [
    ['cubiertos', 'Comensales en salón por día', 'personas', 1],
    ['ticket', 'Ticket promedio en salón', 'COP', 1000],
    ['domicilios', 'Domicilios por día', 'pedidos', 1],
    ['ticketDom', 'Ticket promedio de domicilio', 'COP', 1000],
    ['pctApps', 'Domicilios que entran por apps', '%', 5],
    ['noches', 'Noches de música al mes', 'noches', 1],
    ['asistentes', 'Asistentes extra por noche', 'personas', 5],
    ['ticketNoche', 'Ticket por asistente en noche', 'COP', 1000],
    ['costoNoche', 'Costo por noche: artista, sonido, apoyo', 'COP', 100000],
    ['costoMP', 'Costo de materia prima', '% venta', 1],
    ['arriendo', 'Arriendo + administración', 'COP/mes', 500000],
    ['servicios', 'Servicios públicos (gas de hornos)', 'COP/mes', 250000],
    ['marketing', 'Marketing y pauta', 'COP/mes', 500000],
  ],
  miami: [
    ['ads', 'Pauta mensual (Google + Meta)', 'US$/mes', 250],
    ['cpl', 'Costo por lead', 'US$', 10],
    ['pctDiseno', 'Leads que pagan el diseño', '%', 1],
    ['pctCierre', 'Diseños que firman obra', '%', 1],
    ['ticket', 'Valor promedio de la cocina', 'US$', 1000],
    ['margen', 'Utilidad del proyecto que se reparte', '%', 1],
    ['part', 'Participación de ustedes', '%', 5],
    ['fee', 'Valor del diseño', 'US$', 50],
    ['herramientas', 'CRM, software, hosting', 'US$/mes', 50],
    ['pagoFirma', 'Participación que se cobra con el anticipo', '%', 10],
    ['pautaSocio', 'Pauta que pone su amigo', '%', 10],
    ['trm', 'TRM', 'COP', 50],
  ],
  col: [
    ['ads', 'Pauta mensual (Meta + Google)', 'COP/mes', 250000],
    ['cpl', 'Costo por lead', 'COP', 5000],
    ['pctDiseno', 'Leads que pagan visita + diseño', '%', 1],
    ['pctCierre', 'Diseños que firman obra', '%', 1],
    ['ticket', 'Valor promedio de la cocina', 'COP', 1000000],
    ['margen', 'Margen bruto del proyecto', '%', 1],
    ['fee', 'Valor de visita + diseño', 'COP', 50000],
    ['fijos', 'Fijos: contador, software de diseño, transporte', 'COP/mes', 250000],
  ],
  trip: [
    ['implementacion', 'Implementación que paga SafeTrip', 'COP', 1000000],
    ['costoMVP', 'Costo de construir el MVP (3 meses)', 'COP', 1000000],
    ['licencia', 'Licencia mensual por operador', 'COP/mes', 250000],
    ['operacion', 'Operación: desarrollador, servidores, soporte', 'COP/mes', 250000],
    ['marketing', 'Pauta y contenido para traer clientes', 'COP/mes', 250000],
    ['flete', 'Flete promedio por viaje', 'COP', 100000],
    ['viajesActuales', 'Viajes actuales de SafeTrip al mes', 'viajes', 5],
    ['feePlataforma', 'Fee por viaje (propios y terceros)', '% flete', 0.5],
    ['viajesNuevos', 'Meta de viajes nuevos por marketing', 'viajes/mes', 5],
    ['comisionNuevos', 'Comisión por viaje de cliente nuevo', '% flete', 0.5],
    ['operadoresExtra', 'Operadores nuevos por año desde el mes 16', 'operadores', 1],
  ],
};

function inputs(id, grupo) {
  const el = $(id);
  el.innerHTML = CAMPOS[grupo].map(([k, label, u, step]) =>
    `<label for="${grupo}-${k}">${label}<span class="row"><input id="${grupo}-${k}" type="number" inputmode="decimal" min="0" step="${step}" data-g="${grupo}" data-k="${k}"><span class="u">${u}</span></span></label>`).join('');
  syncInputs(grupo);
}
function syncInputs(grupo) {
  CAMPOS[grupo].forEach(([k]) => {
    const i = $(`#${grupo}-${k}`);
    i.value = state[grupo][k];
    if (grupo === 'baked') i.disabled = state.formato === 'fase1' && ['noches', 'asistentes', 'ticketNoche', 'costoNoche'].includes(k);
  });
}
document.addEventListener('input', e => {
  const g = e.target.dataset.g;
  if (!g) return;
  const v = parseFloat(e.target.value);
  state[g][e.target.dataset.k] = isNaN(v) ? 0 : v;
  render();
});

function seg(id, key, onChange) {
  const el = $(id);
  const paint = () => el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === state[key]));
  el.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    state[key] = b.dataset.v;
    if (onChange) onChange();
    paint(); render();
  });
  paint();
}

const table = (head, rows, opts = {}) =>
  `<thead><tr>${head.map((h, i) => `<th${(opts.right ? opts.right.includes(i) : i && !opts.leftAll) ? ' class="r"' : ''}>${h}</th>`).join('')}</tr></thead><tbody>` +
  rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ''}>${r.c.map((c, i) => `<td${(opts.right ? opts.right.includes(i) : i && !opts.leftAll) ? ' class="r"' : ''}>${c}</td>`).join('')}</tr>`).join('') + '</tbody>';

const kpis = items => items.map(([l, v, n, c]) => `<div><small>${l}</small><strong class="${c || ''}">${v}</strong>${n ? `<em>${n}</em>` : ''}</div>`).join('');

// ---------- Gráfica de caja acumulada ----------
function chart(el, series) {
  const W = 680, H = 250, L = 64, R = 16, T = 14, B = 30;
  const all = series.flatMap(s => s.data);
  let lo = Math.min(0, ...all), hi = Math.max(0, ...all);
  if (hi === lo) hi = lo + 1;
  const span = hi - lo;
  const raw = span / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(x => x * mag).find(x => x >= raw);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const n = series[0].data.length;
  const x = i => L + (i / (n - 1)) * (W - L - R);
  const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  let g = '';
  for (let v = lo; v <= hi + step / 2; v += step) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--${Math.abs(v) < step / 2 ? 'muted' : 'soft'})" stroke-width="1"/>`;
    g += `<text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${(v / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 0 })} M</text>`;
  }
  for (let m = 0; m < n; m += 12) g += `<text x="${x(m)}" y="${H - 8}" text-anchor="middle">${m === 0 ? 'Mes 1' : 'Año ' + (m / 12 + 1)}</text>`;
  series.forEach(s => {
    const pts = s.data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    if (s.fill) g += `<polygon points="${x(0)},${y(0)} ${pts} ${x(n - 1)},${y(0)}" fill="${s.color}" opacity=".12"/>`;
    g += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (s.payback) g += `<circle cx="${x(s.payback - 1)}" cy="${y(s.data[s.payback - 1])}" r="5" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/><text x="${x(s.payback - 1)}" y="${y(s.data[s.payback - 1]) - 10}" text-anchor="middle" style="fill:var(--ink)">Recupera · mes ${s.payback}</text>`;
  });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Caja acumulada en millones de pesos">${g}</svg>`;
}

// ---------- Render ----------
function renderBaked() {
  const r = modeloBaked(state.formato, state.baked, state.escenario);
  const margen = r.neto ? r.ebitda / r.neto : 0;
  $('#kBaked').innerHTML = kpis([
    ['Ventas brutas al mes', cop(r.bruto), `${cop(r.bruto / 30)} por día`],
    ['Utilidad operativa (EBITDA) al mes', cop(r.ebitda), pct(margen) + ' de la venta neta', cls(r.ebitda)],
    ['Punto de equilibrio', cop(r.equilibrioBruto), `${cop(r.equilibrioBruto / 30)} en ventas por día`],
    ['Capital total necesario', r.primerMesPositivo ? cop(r.capital) : 'No se sostiene', r.primerMesPositivo ? 'inversión + arranque + colchón' : 'pierde plata en régimen', r.primerMesPositivo ? '' : 'neg'],
  ]);
  const v = $('#vBaked');
  if (!r.primerMesPositivo) {
    v.className = 'verdict bad';
    v.innerHTML = `<b>Con estos supuestos el negocio pierde ${cop(-r.ebitda)} al mes aun funcionando al 100%.</b> Faltan ${cop(r.equilibrioBruto - r.bruto)} de venta mensual para el punto de equilibrio. Sin cambiar volumen, ticket o costos no hay capital que alcance.`;
  } else if (margen < 0.08) {
    v.className = 'verdict warn';
    v.innerHTML = `<b>Cubre costos desde el mes ${r.primerMesPositivo}, pero el margen (${pct(margen)}) es muy delgado.</b> Un mes flojo lo pone en pérdida y la inversión se recupera ${r.payback ? 'en el mes ' + r.payback : 'en más de 5 años'}. Un restaurante sano está entre 10% y 15%.`;
  } else {
    v.className = 'verdict good';
    v.innerHTML = `<b>Negocio sano: ${pct(margen)} de margen operativo</b>, utilidad desde el mes ${r.primerMesPositivo} y recuperación de la inversión ${r.payback ? 'en el mes ' + r.payback : 'en más de 5 años'}. Hay que sostener ${cop(r.bruto / 30)} de venta diaria.`;
  }

  const V = r.variables, F = r.fijos;
  $('#tPyG').innerHTML = table(['Concepto', 'Mes', '% neta'], [
    { c: ['Ventas salón', cop(r.v.salon), ''] },
    { c: ['Ventas domicilio', cop(r.v.dom), ''] },
    ...(r.v.noches ? [{ c: ['Ventas noches de música', cop(r.v.noches), ''] }] : []),
    { cls: 'sub', c: ['Impuesto al consumo (8%)', cop(r.neto - r.bruto), ''] },
    { cls: 'tot', c: ['Venta neta', cop(r.neto), '100%'] },
    { c: ['Materia prima', cop(-V.mp), pct(V.mp / r.neto)] },
    { c: ['Comisión apps de domicilio', cop(-V.apps), pct(V.apps / r.neto)] },
    { c: ['Empaques', cop(-V.empaques), pct(V.empaques / r.neto)] },
    { c: ['Datáfono e ICA', cop(-(V.datafono + V.ica)), pct((V.datafono + V.ica) / r.neto)] },
    { c: [`Nómina (${r.nom.personas} personas)`, cop(-F.nomina), pct(F.nomina / r.neto)] },
    { c: ['Arriendo + administración', cop(-F.arriendo), pct(F.arriendo / r.neto)] },
    { c: ['Servicios públicos', cop(-F.servicios), pct(F.servicios / r.neto)] },
    ...(F.musica ? [{ c: ['Música en vivo + Sayco-Acinpro', cop(-F.musica), pct(F.musica / r.neto)] }] : []),
    { c: ['Marketing', cop(-F.marketing), pct(F.marketing / r.neto)] },
    { c: ['Contador, software, mantenimiento, seguros', cop(-F.admin), pct(F.admin / r.neto)] },
    { cls: 'tot', c: ['Utilidad operativa (EBITDA)', `<span class="${cls(r.ebitda)}">${cop(r.ebitda)}</span>`, pct(r.ebitda / r.neto)] },
  ]);

  const arranque = -r.minOp + 0; // pérdidas acumuladas hasta que el negocio se paga solo
  $('#tCapital').innerHTML = table(['Rubro', 'Valor'], [
    { c: ['Inversión inicial (con 10% de imprevistos)', cop(r.capex)] },
    { c: ['Pérdidas mientras arranca el negocio', r.primerMesPositivo ? cop(arranque) : 'Sin techo'] },
    { c: ['Colchón: 3 meses de costos fijos', cop(r.colchon)] },
    { cls: 'tot', c: ['Capital total', r.primerMesPositivo ? cop(r.capital) : 'No se sostiene'] },
    { cls: 'sub', c: ['Por socio, si son dos', r.primerMesPositivo ? cop(r.capital / 2) : '—'] },
  ]);

  const palanca = (label, cambio) => {
    const s2 = { ...state.baked, ...cambio(state.baked) };
    const r2 = modeloBaked(state.formato, s2, state.escenario);
    return { c: [label, `<span class="${cls(r2.ebitda - r.ebitda)}">${r2.ebitda - r.ebitda >= 0 ? '+' : ''}${cop(r2.ebitda - r.ebitda)}</span>`] };
  };
  $('#tPalancas').innerHTML = table(['Si cambian esto', 'Utilidad al mes'], [
    palanca('La mitad de los domicilios pasan de apps a canal propio', s => ({ pctApps: s.pctApps / 2 })),
    palanca('Ticket 10% más alto (salón y domicilio)', s => ({ ticket: s.ticket * 1.1, ticketDom: s.ticketDom * 1.1 })),
    palanca('Materia prima 2 puntos más barata', s => ({ costoMP: s.costoMP - 2 })),
    palanca('10 domicilios más por día', s => ({ domicilios: s.domicilios + 10 })),
    palanca('Arriendo $2 M más caro', s => ({ arriendo: s.arriendo + 2e6 })),
  ]);

  chart($('#cBaked'), [{ data: r.flujo, color: 'var(--baked)', fill: true, payback: r.payback }]);

  $('#tCapex').innerHTML = table(['Rubro', 'Valor'], [
    ...r.f.capex.map(([n, val]) => ({ c: [n, cop(val)] })),
    { cls: 'sub', c: ['Imprevistos (10%)', cop(r.capexSub * 0.1)] },
    { cls: 'tot', c: [`Total · ${r.f.m2} m², ${r.f.puestos} puestos`, cop(r.capex)] },
  ]);
  $('#tNomina').innerHTML = table(['Cargo', 'Personas', 'Salario base'], [
    ...r.f.staff.map(p => ({ c: [p.rol, p.n, cop(p.salario)] })),
    { cls: 'sub', c: ['Prestaciones y seguridad social (factor 1,389)', '', cop(r.nom.base * 0.389)] },
    { cls: 'sub', c: ['Auxilio de transporte', '', cop(r.nom.aux)] },
    { cls: 'sub', c: ['Recargos nocturnos y dominicales', '', cop(r.nom.recargos)] },
    { cls: 'tot', c: ['Costo total de nómina al mes', r.nom.personas, cop(r.nom.total)] },
  ]);
}

function renderCocinas() {
  const mi = modeloMiami(state.miami), co = modeloColombia(state.col);
  const trm = state.miami.trm;
  $('#kMiami').innerHTML = kpis([
    ['Les queda al mes (en régimen)', usd(mi.neto), '≈ ' + cop(mi.netoCOP), cls(mi.neto)],
    ['Caja que sale del bolsillo', usd(mi.capital), '≈ ' + cop(mi.capital * trm) + ' · recupera: ' + mes(mi.payback)],
  ]);
  $('#tMiami').innerHTML = table(['Embudo mensual', 'Valor'], [
    { c: ['Leads de la pauta', dec(mi.e.leads)] },
    { c: ['Pagan el diseño', dec(mi.e.disenos)] },
    { c: ['Firman obra', dec(mi.e.proyectos)] },
    { c: ['Les queda por cocina (40% de la utilidad)', usd(mi.porProyecto)] },
    { c: ['Ingreso: participación + diseños', usd(mi.ingreso)] },
    { c: [state.miami.pautaSocio ? `Pauta (ustedes ponen el ${100 - state.miami.pautaSocio}%) + herramientas` : 'Pauta + herramientas', usd(-mi.costo)] },
    { cls: 'tot', c: ['Neto al mes', `<span class="${cls(mi.neto)}">${usd(mi.neto)}</span>`] },
    { cls: 'sub', c: ['Obra: la paga el cliente (anticipo y pagos por avance)', usd(0)] },
    { cls: 'sub', c: ['Montaje en efectivo: revisión del contrato con abogado', usd(mi.setup)] },
  ]);
  $('#kCol').innerHTML = kpis([
    ['Les queda al mes (en régimen)', cop(co.neto), '', cls(co.neto)],
    ['Caja que sale del bolsillo', cop(co.capital), 'recupera: ' + mes(co.payback)],
  ]);
  $('#tCol').innerHTML = table(['Embudo mensual', 'Valor'], [
    { c: ['Leads de la pauta', dec(co.e.leads)] },
    { c: ['Pagan visita + diseño', dec(co.e.disenos)] },
    { c: ['Firman obra', dec(co.e.proyectos)] },
    { c: ['Margen por cocina (después de reservar garantía)', cop(co.porProyecto)] },
    { c: ['Ingreso: margen + diseños', cop(co.ingreso)] },
    { c: ['Pauta + fijos', cop(-co.costo)] },
    { cls: 'tot', c: ['Neto al mes', `<span class="${cls(co.neto)}">${cop(co.neto)}</span>`] },
    { cls: 'sub', c: ['Obra: la paga el cliente (60% anticipo, 30% instalación, 10% entrega)', cop(0)] },
    { cls: 'sub', c: ['Montaje en efectivo: contrato modelo con abogado y registro', cop(co.setup)] },
  ]);
  const ap = aporteWeRock(co.e.disenos + mi.e.disenos);
  $('#tAporte').innerHTML = table(['Trabajo de We Rock', 'Valor'], [
    ...ap.unaVez.map(([n, v]) => ({ c: [n + ' <span class="muted">(una vez)</span>', cop(v)] })),
    ...ap.mensual.map(([n, v]) => ({ c: [n + ' <span class="muted">(al mes)</span>', cop(v)] })),
    { cls: 'tot', c: ['Aporte en trabajo, año 1', cop(ap.anio1)] },
  ]);
  const caja = mi.capital * trm + co.capital;
  $('#tCaja').innerHTML = table(['Plata que sale del bolsillo', 'Valor'], [
    { c: ['Pauta Colombia hasta que entran los primeros márgenes', cop(co.capital - co.setup)] },
    { c: ['Pauta Miami hasta que entran las primeras participaciones', cop((mi.capital - mi.setup) * trm)] },
    { c: ['Abogados: contrato con el cliente y con su amigo', cop(co.setup + mi.setup * trm)] },
    { cls: 'tot', c: ['Caja total para arrancar', cop(caja)] },
    { cls: 'sub', c: ['Reserva recomendada: un mes más de pauta en los dos mercados', cop(state.col.ads + mi.pautaPropia * trm)] },
  ]);
  chart($('#cCocinas'), [
    { data: mi.flujo.map(v => v * trm), color: 'var(--wood)', payback: mi.payback },
    { data: co.flujo, color: 'var(--ink)', payback: co.payback },
  ]);
  const juntos = mi.netoCOP + co.neto;
  $('#vCocinas').innerHTML = `<b>Los dos mercados juntos dejan cerca de ${cop(juntos)} al mes en régimen y arrancan con unos ${cop(caja)} de caja</b>, casi todo en pauta. La obra la financian los clientes y el trabajo lo pone We Rock (${cop(ap.anio1)} el primer año, que se recupera con las utilidades). Colombia recupera antes (${mes(co.payback).toLowerCase()}) porque el lead es más barato y el margen se cobra con la instalación. Si en 90 días un mercado no llega a 1 obra firmada al mes, se pasa su pauta al que sí está funcionando.`;
  return { mi, co, juntos, caja };
}

function renderTrip() {
  const s = state.trip, t = modeloPlataforma(s);
  $('#kTrip').innerHTML = kpis([
    ['Capital necesario', cop(t.capital), 'déficit máximo + 3 meses de costos'],
    ['Recupera la inversión', mes(t.payback)],
    ['Al mes solo con SafeTrip', cop(t.st.neto), 'con la meta de viajes nuevos', cls(t.st.neto)],
    ['Al mes en el mes 36', cop(t.regimen), 'con operadores nuevos', cls(t.regimen)],
  ]);
  const v = $('#vTrip');
  v.className = 'verdict ' + (t.st.neto < 0 ? 'bad' : 'warn');
  v.innerHTML = t.st.neto < 0
    ? `<b>Con SafeTrip solo, la plataforma pierde ${cop(-t.st.neto)} al mes.</b> Hay que subir la licencia o los viajes, o bajar la operación, antes de presentarla.`
    : `<b>SafeTrip sola deja ${cop(t.st.neto)} al mes:</b> cubre la plataforma, pero no es el negocio. Cada operador nuevo suma unos ${cop(t.porOperador)} al mes casi sin costo adicional, y por eso el mes 36 llega a ${cop(t.regimen)}. La meta del año 2 es firmar el segundo y el tercer operador.`;
  const viaje = pctv => cop(s.flete * pctv / 100);
  $('#tFuentes').innerHTML = table(['Fuente de ingreso', 'Cómo se cobra', 'Al mes'], [
    { c: ['Implementación', `${cop(s.implementacion)} una vez, 50% al firmar`, '—'] },
    { c: ['Licencia del software', 'Fija al mes: contabilidad, viáticos, GPS, utilidad por carro', cop(t.st.licencia)] },
    { c: ['Fee por viaje (propios y terceros)', `${dec(s.feePlataforma)}% del flete · ${viaje(s.feePlataforma)} por viaje · ${s.viajesActuales} viajes`, cop(t.st.feeActuales)] },
    { c: ['Comisión por clientes que trae el marketing', `${dec(s.comisionNuevos)}% del flete · ${viaje(s.comisionNuevos)} por viaje · ${s.viajesNuevos} viajes en meta`, cop(t.st.comisionNuevos)] },
    { cls: 'sub', c: ['Menos: operación y marketing', '', cop(-t.st.costo)] },
    { cls: 'tot', c: ['Neto con SafeTrip', '', `<span class="${cls(t.st.neto)}">${cop(t.st.neto)}</span>`] },
  ], { right: [2] });
  $('#tAnios').innerHTML = table(['Año', 'Ingreso', 'Costo', 'Resultado'], t.porAnio.map((a, i) => ({
    c: ['Año ' + (i + 1), cop(a.ingreso), cop(a.costo), `<span class="${cls(a.ingreso - a.costo)}">${cop(a.ingreso - a.costo)}</span>`],
  })));
  chart($('#cTrip'), [{ data: t.flujo, color: 'var(--trip)', fill: true, payback: t.payback }]);
  return t;
}

function renderResumen(c, t) {
  const b1 = modeloBaked('completo', BASE.baked, 'base');
  const b2 = modeloBaked('fase1', BAKED_FORMATOS.fase1.defaults, 'base');
  const rows = [
    { c: ['<b>Plataforma de carga</b> + SafeTrip', cop(t.capital), 'Mes 1 (implementación)', `${cop(t.st.neto)} → ${cop(t.regimen)}`, mes(t.payback), 'Medio'] },
    { c: ['<b>Cocinas Colombia</b>', cop(c.co.capital), 'Mes 2–3', cop(c.co.neto), mes(c.co.payback), 'Medio'] },
    { c: ['<b>Cocinas Miami</b>', cop(c.mi.capital * state.miami.trm), 'Mes 3–4', cop(c.mi.netoCOP), mes(c.mi.payback), 'Medio'] },
    { c: ['<b>Baked</b> Fase 1 sin tarima', cop(b2.capital), 'Mes 1 de apertura', `<span class="${cls(b2.ebitda)}">${cop(b2.ebitda)}</span>`, mes(b2.payback), 'Alto'] },
    { c: ['<b>Baked</b> local con tarima', cop(b1.capital), 'Mes 1 de apertura', `<span class="${cls(b1.ebitda)}">${cop(b1.ebitda)}</span>`, mes(b1.payback), 'Muy alto'] },
  ];
  $('#tResumen').innerHTML = table(['Negocio', 'Capital necesario', 'Primer ingreso', 'Utilidad mensual en régimen', 'Recupera inversión', 'Riesgo'], rows);
  $('#vResumen').innerHTML = `<b>La conclusión:</b> las cocinas dejan cerca de ${cop(c.juntos)} al mes arrancando con unos ${cop(c.caja)} de caja (la obra la pagan los clientes), y son la plata de corto plazo. La plataforma de carga pide ${cop(t.capital)} y tarda más (${mes(t.payback).toLowerCase()}), pero es el único de los tres que se puede vender a otras empresas y crecer sin abrir más locales ni contratar más obras. Baked con tarima necesita cerca de ${cop(b1.capital)} y en el escenario base apenas cubre costos. Por eso va de tercero y por fases: primero validar, después Fase 1 y la tarima en el año 2.`;
}

const RUTA = [
  ['Plataforma + SafeTrip', 'b-trip', [[1, 3, 'Firma + MVP'], [4, 15, 'Licencia + comisiones'], [16, 18, 'Operador 2']]],
  ['Cocinas Colombia', 'b-wood', [[1, 2, 'Montaje + pauta'], [3, 18, 'Obras y escalar']]],
  ['Cocinas Miami', 'b-wood', [[1, 2, 'Contrato + montaje'], [3, 5, 'Pauta 90 días'], [6, 18, 'Escalar']]],
  ['Baked', 'b-baked', [[1, 3, 'Marca SIC + modelo'], [4, 7, 'Fase 0: validar'], [8, 9, 'Local'], [10, 18, 'Fase 1 abierta']]],
  ['Decisión tarima', 'b-baked', [[18, 18, '¿?']]],
];
function renderGantt() {
  let h = '<div class="h"></div>' + Array.from({ length: 18 }, (_, i) => `<div class="h">M${i + 1}</div>`).join('');
  RUTA.forEach(([n, c, bars]) => {
    h += `<div class="lbl">${n}</div>`;
    let col = 1;
    bars.forEach(([a, b, t]) => {
      if (a > col) h += `<div class="lane" style="grid-column:span ${a - col}"></div>`;
      h += `<div class="lane" style="grid-column:span ${b - a + 1};padding:0 2px"><div class="bar ${c}" style="width:100%" title="${t}">${t}</div></div>`;
      col = b + 1;
    });
    if (col <= 18) h += `<div class="lane" style="grid-column:span ${19 - col}"></div>`;
  });
  $('#gantt').innerHTML = h;
}

function render() {
  renderBaked();
  const c = renderCocinas();
  const t = renderTrip();
  renderResumen(c, t);
}

seg('#segFormato', 'formato', () => { state.baked = { ...BAKED_FORMATOS[state.formato].defaults }; syncInputs('baked'); });
seg('#segEsc', 'escenario');
inputs('#iBaked', 'baked'); inputs('#iMiami', 'miami'); inputs('#iCol', 'col'); inputs('#iTrip', 'trip');
renderGantt();
render();
