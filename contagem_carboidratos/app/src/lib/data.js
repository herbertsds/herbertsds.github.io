// Data local (não UTC) no formato "YYYY-MM-DD". `Date.toISOString()` sozinho usa UTC — em
// fusos negativos (Brasil, UTC-3) isso vira "amanhã" horas antes da meia-noite local. O truque
// de subtrair o offset antes de chamar toISOString() corrige isso.
export function dataLocalISO(data = new Date()) {
  const offset = data.getTimezoneOffset();
  const local = new Date(data.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}
