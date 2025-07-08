import { usePOS } from "../context/pos-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, User } from "lucide-react"

export default function WaiterOrderCount() {
  const { staff, orders, language } = usePOS()
  const waiters = staff.filter((s) => s.role === "waiter")

  // Count orders per waiter
  const waiterOrderCounts = waiters.map((waiter) => ({
    ...waiter,
    orderCount: orders.filter((o) => o.waiterAssigned === waiter.id || o.waiterName === waiter.name).length,
  }))

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          <CardTitle className="text-xl font-bold">
            {language === "hi" ? "वेटर ऑर्डर काउंट" : "Waiter Order Count"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waiterOrderCounts.map((waiter) => (
              <Card key={waiter.id} className="flex items-center gap-4 p-4">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold text-lg">{waiter.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === "hi" ? "कुल ऑर्डर:" : "Total Orders:"} <span className="font-bold text-green-700">{waiter.orderCount}</span>
                  </div>
                </div>
              </Card>
            ))}
            {waiterOrderCounts.length === 0 && (
              <div className="text-center text-muted-foreground col-span-full py-8">
                {language === "hi" ? "कोई वेटर नहीं मिला" : "No waiters found"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 