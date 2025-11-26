import { POSProvider } from '@/context/pos-context'
import AddProduct from '@/pages/add-product'

export default function AddProductExample() {
  return (
    <POSProvider>
      <AddProduct />
    </POSProvider>
  )
}
