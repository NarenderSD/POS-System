import { usePOS } from "./context/pos-context"

export default function Loading() {
  const { customers, orders } = usePOS();

  if (!customers || customers.length === 0) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">No customers found.</div>;
  }

  // Helper to get latest order for a customer
  const getLatestOrder = (customer) => {
    if (!orders) return null;
    return orders.filter(o => o.customerPhone === customer.phone || o.customerEmail === customer.email).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">All Customers</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Email</th>
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
                <tr key={customer.id} className="border-b">
                  <td className="px-4 py-2 border font-semibold">{customer.name}</td>
                  <td className="px-4 py-2 border">{customer.phone}</td>
                  <td className="px-4 py-2 border">{customer.email || '-'}</td>
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
