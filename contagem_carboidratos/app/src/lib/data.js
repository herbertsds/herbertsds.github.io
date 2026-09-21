// Data local (não UTC) no formato "YYYY-MM-DD". `Date.toISOString()` sozinho usa UTC — em
// fusos negativos (Brasil, UTC-3) isso vira "amanhã" horas antes da meia-noite local. O truque
// de subtrair o offset antes de chamar toISOString() corrige isso.
export function dataLocalISO(data = new Date()) {
  const offset = data.getTimezoneOffset();
  const local = new Date(data.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

// Soma (ou subtrai, com delta negativo) dias a uma data "YYYY-MM-DD", sem depender de fuso —
// monta a data com ano/mês/dia explícitos (meio-dia local, embora a hora não importe aqui) em
// vez de fazer aritmética em cima de um Date já existente.
export function somarDias(dataISO, delta) {
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia + delta);
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
