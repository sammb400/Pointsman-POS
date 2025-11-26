import { POSProvider } from '@/context/pos-context'
import Shop from '@/pages/shop'

export default function ShopExample() {
  return (
    <POSProvider>
      <Shop />
    </POSProvider>
  )
}
