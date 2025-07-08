"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, ChefHat, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePOS } from "../context/pos-context"
import { cn } from "@/lib/utils"

export default function KitchenDisplay() {
  const { orders, updateOrderStatus, language } = usePOS()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const activeOrders = orders
    .filter((order) => ["pending", "confirmed", "preparing"].includes(order.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const getOrderAge = (createdAt: Date | string) => {
    const dateObj = typeof createdAt === "string" ? new Date(createdAt) : createdAt
    const diffMs = currentTime.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    return diffMins
  }

  const getOrderPriority = (order: any) => {
    const age = getOrderAge(order.createdAt)
    const estimatedTime = order.estimatedTime || 15

    if (age > estimatedTime + 10) return "urgent"
    if (age > estimatedTime) return "high"
    if (age > estimatedTime - 5) return "medium"
    return "low"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500 bg-red-50"
      case "high":
        return "border-orange-500 bg-orange-50"
      case "medium":
        return "border-yellow-500 bg-yellow-50"
      default:
        return "border-green-500 bg-green-50"
    }
  }

  const handleStatusUpdate = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <ChefHat className="h-8 w-8 mr-3 text-green-600" />
          {language === "hi" ? "रसोई डिस्प्ले" : "Kitchen Display"}
        </h1>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>
            {language === "hi" ? "सक्रिय ऑर्डर:" : "Active Orders:"} {activeOrders.length}
          </span>
          <span>{currentTime.toLocaleTimeString("en-IN")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeOrders.map((order) => {
          const priority = getOrderPriority(order)
          const age = getOrderAge(order.createdAt)

          return (
            <Card
              key={order._id}
              className={cn(
                "border-2 transition-all duration-300",
                getPriorityColor(priority),
                priority === "urgent" && "animate-pulse",
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">#{order.orderNumber}</span>
                    {order.tableNumber && <Badge variant="outline">{order.tableNumber}</Badge>}
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <Timer className="h-4 w-4" />
                    <span
                      className={cn(
                        "font-medium",
                        age > (order.estimatedTime || 15) ? "text-red-600" : "text-green-600",
                      )}
                    >
                      {age}m
                    </span>
                  </div>
                </CardTitle>

                <div className="flex items-center justify-between text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      order.status === "pending" && "bg-yellow-100 text-yellow-800",
                      order.status === "confirmed" && "bg-blue-100 text-blue-800",
                      order.status === "preparing" && "bg-orange-100 text-orange-800",
                    )}
                  >
                    {order.status}
                  </Badge>
                  <span className="text-muted-foreground">
                    {order.orderType} • {order.items.length} items
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Order Items */}
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {item.quantity}x {language === "hi" && item.nameHindi ? item.nameHindi : item.name}
                        </div>
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="text-xs text-muted-foreground">{item.customizations.join(", ")}</div>
                        )}
                        {item.spiceLevel && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.spiceLevel} spice
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{item.preparationTime}m</div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="p-2 bg-yellow-100 rounded-md">
                    <div className="text-xs font-medium text-yellow-800 mb-1">
                      {language === "hi" ? "विशेष निर्देश:" : "Special Instructions:"}
                    </div>
                    <div className="text-xs text-yellow-700">{order.specialInstructions}</div>
                  </div>
                )}

                {/* Customer Info */}
                {order.customerName && (
                  <div className="text-xs text-muted-foreground">
                    {language === "hi" ? "ग्राहक:" : "Customer:"} {order.customerName}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order._id, "confirmed")}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      {language === "hi" ? "स्वीकार करें" : "Accept"}
                    </Button>
                  )}

                  {order.status === "confirmed" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order._id, "preparing")}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      {language === "hi" ? "शुरू करें" : "Start"}
                    </Button>
                  )}

                  {order.status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order._id, "ready")}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {language === "hi" ? "तैयार" : "Ready"}
                    </Button>
                  )}
                </div>

                {/* Priority Indicator */}
                {priority === "urgent" && (
                  <div className="flex items-center justify-center p-2 bg-red-100 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-xs font-medium text-red-600">{language === "hi" ? "तत्काल!" : "URGENT!"}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {activeOrders.length === 0 && (
        <div className="text-center py-16">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {language === "hi" ? "कोई सक्रिय ऑर्डर नहीं" : "No Active Orders"}
          </h3>
          <p className="text-gray-500">{language === "hi" ? "नए ऑर्डर का इंतजार कर रहे हैं" : "Waiting for new orders"}</p>
        </div>
      )}
    </div>
  )
}
