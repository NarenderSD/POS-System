"use client"

import { useEffect, useState } from 'react'

export default function CustomerLoyalty({ customerId }) {
  const [customer, setCustomer] = useState(null)

  useEffect(() => {
    if (customerId) {
      fetch(`/api/customers?id=${customerId}`)
        .then(r => r.json())
        .then(data => setCustomer(data))
    }
  }, [customerId])

  if (!customer) return <div>Loading...</div>

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="font-bold text-lg mb-2">Customer Loyalty</h2>
      <div>Loyalty Points: <span className="font-semibold">{customer.loyaltyPoints}</span></div>
      <div>Total Orders: <span className="font-semibold">{customer.totalOrders}</span></div>
      <div>Total Spent: <span className="font-semibold">₹{customer.totalSpent}</span></div>
      <div>Membership: <span className="font-semibold capitalize">{customer.membershipTier}</span></div>
      <div>Last Visit: <span className="font-semibold">{customer.lastVisit}</span></div>
      <div>Preferences: <span className="font-semibold">{customer.preferences}</span></div>
      <div>Allergies: <span className="font-semibold">{customer.allergies}</span></div>
      <div>Favorite Items: <span className="font-semibold">{customer.favoriteItems}</span></div>
    </div>
  )
} 