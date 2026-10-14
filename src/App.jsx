import Suma from './screens/Suma.jsx'
import Toast from './components/Toast.jsx'

export default function App() {
  return (
    <div className="h-full flex flex-col bg-ink-50 text-ink-900">
      <Suma />
      <Toast />
    </div>
  )
}
