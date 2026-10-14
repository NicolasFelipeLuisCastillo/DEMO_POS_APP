import { create } from 'zustand'

// Store simple para toasts — solo vive en memoria
const useToastStore = create((set) => ({
  toasts: [],
  push: (text, type = 'info') => {
    const id = Date.now() + Math.random()
    set(s => ({ toasts: [...s.toasts, { id, text, type }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 2200)
  }
}))

// Hook para que cualquier componente pueda mostrar un toast
export function useToast() {
  const push = useToastStore(s => s.push)
  return (text, type) => push(text, type || 'info')
}

const styles = {
  success: 'bg-emerald-600 text-white',
  error:   'bg-rose-600 text-white',
  info:    'bg-ink-800 text-white'
}

const icons = {
  success: '✓',
  error:   '!',
  info:    'i'
}

export default function Toast() {
  const toasts = useToastStore(s => s.toasts)
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-up px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 ${styles[t.type] || styles.info}`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 grid place-items-center text-xs font-extrabold">
            {icons[t.type] || 'i'}
          </span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}
