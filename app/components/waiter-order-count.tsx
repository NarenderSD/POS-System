import { useEffect, useState } from 'react'

export default function WaiterOrderCount() {
  const [waiters, setWaiters] = useState([])

  useEffect(() => {
    fetch('/api/waiters')
      .then(r => r.json())
      .then(setWaiters)
  }, [])

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="font-bold text-lg mb-2">Waiter Order Count</h2>
      <ul>
        {waiters.map(w => (
          <li key={w._id} className="mb-2">
            <div className="font-semibold">{w.name}</div>
            <div>Total Orders: {w.totalOrders}</div>
          </li>
        ))}
      </ul>
    </div>
  )
} 