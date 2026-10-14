// Formateador de pesos colombianos
const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
export const money = (n) => fmt.format(Math.round(n || 0))

export function nowTime() {
  const d = new Date()
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
