import { POSProvider } from '@/context/pos-context'
import SalesHistory from '@/pages/sales-history'

export default function SalesHistoryExample() {
  return (
    <POSProvider>
      <SalesHistory />
    </POSProvider>
  )
}
