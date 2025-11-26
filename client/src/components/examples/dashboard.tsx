import { POSProvider } from '@/context/pos-context'
import Dashboard from '@/pages/dashboard'

export default function DashboardExample() {
  return (
    <POSProvider>
      <Dashboard />
    </POSProvider>
  )
}
