"use client"

import { useEffect, useState } from 'react'

export default function CustomerLoyalty() {
  const [customers, setCustomers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [custRes, orderRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/orders'),
      ])
      const [custData, orderData] = await Promise.all([
        custRes.json(),
        orderRes.json(),
      ])
      setCustomers(custData)
      setOrders(orderData)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">Loading...</div>;
  }
  if (!customers || customers.length === 0) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">No customers found.</div>;
  }

  // Helper to get latest order for a customer
  const getLatestOrder = (customer: any) => {
    if (!orders) return null;
    return orders
      .filter((o: any) => (o.customerPhone && o.customerPhone === customer.phone) || (o.customerEmail && o.customerEmail === customer.email))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">All Customers Loyalty & Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Loyalty Points</th>
              <th className="px-4 py-2 border">Membership</th>
              <th className="px-4 py-2 border">Total Orders</th>
              <th className="px-4 py-2 border">Total Spent</th>
              <th className="px-4 py-2 border">Last Visit</th>
              <th className="px-4 py-2 border">Order #</th>
              <th className="px-4 py-2 border">Order Time</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const latestOrder = getLatestOrder(customer);
              return (
                <tr key={customer._id || customer.id} className="border-b">
                  <td className="px-4 py-2 border font-semibold">{customer.name}</td>
                  <td className="px-4 py-2 border">{customer.phone}</td>
                  <td className="px-4 py-2 border">{customer.email || '-'}</td>
                  <td className="px-4 py-2 border">{customer.loyaltyPoints}</td>
                  <td className="px-4 py-2 border">{customer.membershipTier}</td>
                  <td className="px-4 py-2 border">{customer.totalOrders}</td>
                  <td className="px-4 py-2 border">₹{customer.totalSpent}</td>
                  <td className="px-4 py-2 border">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleString("en-IN") : '-'}</td>
                  <td className="px-4 py-2 border">{latestOrder ? latestOrder.billNumber : '-'}</td>
                  <td className="px-4 py-2 border">{latestOrder ? new Date(latestOrder.createdAt).toLocaleString("en-IN") : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 