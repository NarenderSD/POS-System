import React from "react"
import { usePOS } from "../context/pos-context"
import { useState } from "react"
import OrderConfirmationPage from "../order-confirmation/[orderId]/page"

export default function Reports() {
  const { orders, tables } = usePOS()
  const [search, setSearch] = useState("")
  const [showBill, setShowBill] = useState(false)
  const [foundOrderId, setFoundOrderId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleSearch = () => {
    setError("")
    const bill = orders.find(o => o.billNumber === search.trim())
    if (bill) {
      setFoundOrderId(bill._id)
      setShowBill(true)
    } else {
      setFoundOrderId(null)
      setShowBill(false)
      setError("Bill not found")
    }
  }
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 w-full">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Reports / रिपोर्ट्स</h2>
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search Bill Number (e.g. N000001)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold"
        >
          Search Bill
        </button>
        {error && <span className="text-red-500 ml-2 text-sm">{error}</span>}
      </div>
      {showBill && foundOrderId && (
        <div className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-4 relative">
            <button onClick={() => setShowBill(false)} className="absolute top-2 right-2 text-lg font-bold">×</button>
            <OrderConfirmationPage orderId={foundOrderId} showActions />
          </div>
        </div>
      )}
      <p className="text-lg text-muted-foreground mb-6">All your sales, staff, and analytics reports will appear here.<br/>सभी बिक्री, स्टाफ और एनालिटिक्स रिपोर्ट्स यहाँ दिखेंगी।</p>
      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-3 py-2 border">Order #</th>
              <th className="px-3 py-2 border">Table</th>
              <th className="px-3 py-2 border">Total</th>
              <th className="px-3 py-2 border">Status</th>
              <th className="px-3 py-2 border">Payment</th>
              <th className="px-3 py-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(order => order.status === 'completed' && order.paymentStatus === 'paid').map(order => (
              <tr key={order._id || order.id} className="border-b">
                <td className="px-3 py-2 border font-semibold">{order.billNumber || order.orderNumber}</td>
                <td className="px-3 py-2 border">{order.tableNumber}</td>
                <td className="px-3 py-2 border">₹{order.total?.toFixed(0)}</td>
                <td className="px-3 py-2 border">{order.status}</td>
                <td className="px-3 py-2 border">{order.paymentStatus}</td>
                <td className="px-3 py-2 border">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 