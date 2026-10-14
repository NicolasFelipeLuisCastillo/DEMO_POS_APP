import { useState, useRef, useEffect } from 'react'
import { money } from '../lib/format'
import { useToast } from '../components/Toast.jsx'

// Calculadora de suma con pagos Nequi / Efectivo.
// Escribe un número → Enter → se suma al total.
// Click Nequi → registra el total como pago digital.
// Click Efectivo → pide con cuánto paga, muestra vueltas, confirma.

export default function Suma() {
  const [value, setValue] = useState('')
  const [total, setTotal] = useState(0)
  const [entries, setEntries] = useState([])
  const [pagos, setPagos] = useState([]) // [{ id, total, type, change, entries, time }]
  const [historialAbierto, setHistorialAbierto] = useState(true)

  // Sub-estado de pago
  const [modoPago, setModoPago] = useState(null) // 'nequi' | 'efectivo' | null
  const [cashRecibido, setCashRecibido] = useState('')
  const cashInputRef = useRef(null)

  const inputRef = useRef(null)
  const toast = useToast()

  const add = () => {
    const n = Number(value)
    if (!n || n <= 0) return
    setTotal(t => t + n)
    setEntries(prev => [...prev, n])
    setValue('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const removeAt = (idx) => {
    setEntries(prev => {
      const removed = prev[idx]
      setTotal(t => t - removed)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const undo = () => {
    if (entries.length === 0) return
    const last = entries[entries.length - 1]
    setTotal(t => t - last)
    setEntries(prev => prev.slice(0, -1))
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const reset = () => {
    setTotal(0)
    setEntries([])
    setValue('')
    setModoPago(null)
    setCashRecibido('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // Click Nequi: registra directo
  const pagarConNequi = () => {
    if (total <= 0) return
    setPagos(prev => [
      {
        id: Date.now(),
        total,
        type: 'nequi',
        cashReceived: null,
        change: 0,
        entries: [...entries],
        time: new Date().toISOString()
      },
      ...prev
    ])
    toast(`Pago Nequi de ${money(total)} registrado`, 'success')
    reset()
  }

  // Click Efectivo: mostrar input
  const iniciarEfectivo = () => {
    if (total <= 0) return
    setModoPago('efectivo')
    setCashRecibido('')
    setTimeout(() => cashInputRef.current?.focus(), 50)
  }

  // Confirmar efectivo
  const confirmarEfectivo = () => {
    const cash = Number(cashRecibido)
    if (!cash || cash < total) return
    setPagos(prev => [
      {
        id: Date.now(),
        total,
        type: 'efectivo',
        cashReceived: cash,
        change: cash - total,
        entries: [...entries],
        time: new Date().toISOString()
      },
      ...prev
    ])
    toast(`Pago efectivo · vueltas ${money(cash - total)}`, 'success')
    reset()
  }

  const cancelarEfectivo = () => {
    setModoPago(null)
    setCashRecibido('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const eliminarPago = (id) => {
    setPagos(prev => prev.filter(p => p.id !== id))
  }

  // Cálculos para efectivo
  const cashNum = Number(cashRecibido) || 0
  const change = cashNum - total
  const cashSuficiente = cashNum >= total && total > 0

  // Quick-pick de denominaciones
  const quickPicks = [10000, 20000, 50000, 100000]
  const addQuick = (v) => setCashRecibido(String((Number(cashRecibido) || 0) + v))
  const setExacto = () => setCashRecibido(String(total))

  const totalAcumulado = pagos.reduce((acc, p) => acc + p.total, 0)
  const totalEfectivo = pagos.filter(p => p.type === 'efectivo').reduce((acc, p) => acc + p.total, 0)
  const totalNequi = pagos.filter(p => p.type === 'nequi').reduce((acc, p) => acc + p.total, 0)

  // Cerrar efectivo con Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && modoPago === 'efectivo') {
        cancelarEfectivo()
      }
      if (e.key === 'Enter' && modoPago === 'efectivo') {
        e.preventDefault()
        confirmarEfectivo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modoPago, cashRecibido, total])

  return (
    <div className="h-full flex flex-col bg-ink-50">
      {/* Header simple */}
      <div className="shrink-0 bg-white border-b border-ink-200 px-4 py-3 flex items-center justify-between safe-top">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold">Suma</h1>
          <p className="text-[11px] text-ink-500">Escribe un número, Enter, cobra con Nequi o efectivo</p>
        </div>
      </div>

      {/* Centro: total + lista de precios + input + botones */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* TOTAL GRANDE */}
          <div className="text-center mb-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">
              {modoPago === 'efectivo' ? 'Total a cobrar' : 'Suma actual'}
            </div>
            <div
              key={total}
              className="text-5xl sm:text-6xl font-extrabold tabular-nums text-amber-700 bump"
            >
              {money(total)}
            </div>
          </div>

          {/* LISTA DE MONTOS INGRESADOS */}
          {entries.length > 0 && modoPago !== 'efectivo' && (
            <div className="mb-4 bg-white rounded-2xl border-2 border-amber-200 p-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  Montos sumados ({entries.length})
                </div>
                <button
                  onClick={reset}
                  className="text-[10px] text-ink-500 hover:text-rose-600 font-semibold active-press"
                >
                  ✕ Limpiar todos
                </button>
              </div>
              <ul className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                {entries.map((n, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-rose-50 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-ink-400 w-5 text-right shrink-0">
                        #{i + 1}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-ink-900 truncate">
                        {money(n)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAt(i)}
                      className="w-6 h-6 rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-100 grid place-items-center text-xs active-press opacity-50 group-hover:opacity-100"
                      title="Quitar este monto"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 pt-2 border-t border-amber-200 flex items-baseline justify-between px-1">
                <span className="text-[10px] font-bold uppercase text-amber-800">Suma</span>
                <span className="text-sm font-extrabold tabular-nums text-amber-700">
                  {money(total)}
                </span>
              </div>
            </div>
          )}

          {/* INPUT PRINCIPAL — solo si NO está en modo efectivo */}
          {modoPago !== 'efectivo' && (
            <>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-ink-400">$</span>
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="numeric"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      add()
                    }
                  }}
                  placeholder="0"
                  autoFocus
                  className="w-full h-16 sm:h-20 pl-12 pr-4 rounded-2xl border-2 border-ink-200 focus:border-amber-500 outline-none text-3xl sm:text-4xl font-extrabold tabular-nums bg-white text-center shadow-sm"
                />
              </div>

              <button
                onClick={add}
                disabled={!value || Number(value) <= 0}
                className="btn-xl w-full bg-ink-100 hover:bg-ink-200 text-ink-700 active-press disabled:opacity-30 mb-2"
              >
                Sumar ↑
              </button>

              {/* DOS BOTONES DE PAGO */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={pagarConNequi}
                  disabled={total <= 0}
                  className="btn-xl bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-md active-press disabled:from-ink-300 disabled:to-ink-300 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xl">📱</span>
                    <span className="text-sm">Nequi</span>
                  </div>
                </button>
                <button
                  onClick={iniciarEfectivo}
                  disabled={total <= 0}
                  className="btn-xl bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-md active-press disabled:from-ink-300 disabled:to-ink-300 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xl">💵</span>
                    <span className="text-sm">Efectivo</span>
                  </div>
                </button>
              </div>

              {/* Deshacer */}
              <button
                onClick={undo}
                disabled={entries.length === 0}
                className="btn-xl w-full bg-ink-100 hover:bg-ink-200 text-ink-700 active-press disabled:opacity-30"
              >
                ↶ Deshacer último
              </button>
            </>
          )}

          {/* MODO EFECTIVO */}
          {modoPago === 'efectivo' && (
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-300 p-4 pop-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💵</span>
                  <div>
                    <div className="text-sm font-extrabold text-emerald-900">Pago en efectivo</div>
                    <div className="text-[11px] text-emerald-700">¿Con cuánto paga?</div>
                  </div>
                </div>
                <button
                  onClick={cancelarEfectivo}
                  className="text-[11px] text-emerald-700 hover:text-rose-600 font-semibold active-press"
                >
                  ✕ Cancelar
                </button>
              </div>

              {/* Lista de montos resumida */}
              <div className="text-[10px] text-emerald-800 mb-2 max-h-16 overflow-y-auto scrollbar-thin">
                {entries.map((n, i) => (
                  <span key={i} className="mr-1">{money(n)}{i < entries.length - 1 ? ' +' : ''}</span>
                ))}
              </div>

              {/* Input efectivo recibido */}
              <div className="relative mb-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-ink-400">$</span>
                <input
                  ref={cashInputRef}
                  type="number"
                  inputMode="numeric"
                  value={cashRecibido}
                  onChange={e => setCashRecibido(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      confirmarEfectivo()
                    }
                  }}
                  placeholder="0"
                  className="w-full h-14 pl-9 pr-3 rounded-xl border-2 border-emerald-300 focus:border-emerald-500 outline-none text-2xl font-extrabold tabular-nums bg-white text-center"
                />
              </div>

              {/* Quick-pick */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {quickPicks.map(v => (
                  <button
                    key={v}
                    onClick={() => addQuick(v)}
                    className="py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-xs font-semibold tabular-nums active-press"
                  >
                    +{money(v).replace('$ ', '')}
                  </button>
                ))}
              </div>
              <button
                onClick={setExacto}
                className="w-full py-2 mb-3 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-xs font-semibold active-press"
              >
                Exacto
              </button>

              {/* Cambio */}
              {cashNum > 0 && (
                <div className={`p-3 rounded-xl border-2 mb-3 bump ${
                  cashSuficiente
                    ? 'bg-emerald-100 border-emerald-400'
                    : 'bg-rose-50 border-rose-300'
                }`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    cashSuficiente ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {cashSuficiente ? 'Vueltas a devolver' : 'Falta'}
                  </div>
                  <div className={`text-3xl font-extrabold tabular-nums ${
                    cashSuficiente ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {money(Math.abs(change))}
                  </div>
                </div>
              )}

              <button
                onClick={confirmarEfectivo}
                disabled={!cashSuficiente}
                className="btn-xl w-full bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-md active-press disabled:from-ink-300 disabled:to-ink-300 disabled:cursor-not-allowed"
              >
                ✓ Confirmar pago
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historial de pagos registrados (colapsable) */}
      {pagos.length > 0 && (
        <div className="shrink-0 bg-white border-t-2 border-amber-300 safe-bottom">
          <button
            onClick={() => setHistorialAbierto(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-ink-50 active-press transition"
          >
            <div className="flex items-center gap-2">
              <span
                className="text-ink-500 text-sm transition-transform inline-block"
                style={{ transform: historialAbierto ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              >
                ▼
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-700">
                Pagos ({pagos.length})
              </span>
              <div className="hidden sm:flex items-center gap-2 text-[10px]">
                <span className="text-pink-600">📱 {money(totalNequi)}</span>
                <span className="text-emerald-600">💵 {money(totalEfectivo)}</span>
              </div>
              {!historialAbierto && (
                <span className="text-[10px] text-ink-400">· toca para desplegar</span>
              )}
            </div>
            <div className="text-sm font-extrabold tabular-nums text-emerald-700">
              {money(totalAcumulado)}
            </div>
          </button>

          {historialAbierto && (
            <div className="px-4 pb-3 max-h-64 overflow-y-auto slide-up">
              <ul className="space-y-2">
                {pagos.map(p => {
                  const breakdown = p.entries.map(n => money(n)).join(' + ')
                  const isNequi = p.type === 'nequi'
                  return (
                    <li
                      key={p.id}
                      className={`p-3 rounded-xl border flex items-start gap-3 ${
                        isNequi
                          ? 'border-pink-200 bg-pink-50/50'
                          : 'border-emerald-200 bg-emerald-50/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg text-white grid place-items-center text-base shrink-0 ${
                        isNequi ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-emerald-500'
                      }`}>
                        {isNequi ? '📱' : '✓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <div className={`text-base font-extrabold tabular-nums ${
                              isNequi ? 'text-pink-700' : 'text-emerald-700'
                            }`}>
                              {money(p.total)}
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${
                              isNequi ? 'text-pink-600' : 'text-emerald-600'
                            }`}>
                              {isNequi ? 'Nequi' : 'Efectivo'}
                            </span>
                          </div>
                          <button
                            onClick={() => eliminarPago(p.id)}
                            className="text-[11px] text-ink-400 hover:text-rose-600 font-semibold active-press"
                          >
                            ✕
                          </button>
                        </div>
                        {!isNequi && p.change > 0 && (
                          <div className="text-[11px] text-emerald-700 font-semibold">
                            Vueltas: {money(p.change)} (recibió {money(p.cashReceived)})
                          </div>
                        )}
                        <div className="text-[11px] text-ink-500 truncate" title={breakdown}>
                          {breakdown}
                        </div>
                        <div className="text-[10px] text-ink-400 mt-0.5 tabular-nums">
                          {new Date(p.time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
