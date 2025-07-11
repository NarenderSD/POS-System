import React from "react"
import { usePOS } from "../context/pos-context"

export default function Reports() {
  const { orders, tables } = usePOS()
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 w-full">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Reports / रिपोर्ट्स</h2>
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
            {orders.map(order => (
              <tr key={order._id || order.id} className="border-b">
                <td className="px-3 py-2 border font-semibold">{order.orderNumber}</td>
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