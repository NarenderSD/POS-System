"use client"

import { useState } from "react"
import { Users, Clock, CheckCircle, AlertCircle, XCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePOS } from "../context/pos-context"
import { cn } from "@/lib/utils"

export default function TableManagement() {
  const { tables, orders, updateTableStatus, cleanTable, reserveTable, language } = usePOS()
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [reservationName, setReservationName] = useState("")
  const [reservationTime, setReservationTime] = useState("")

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 text-green-800"
      case "occupied":
        return "bg-red-100 border-red-300 text-red-800"
      case "reserved":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "cleaning":
        return "bg-blue-100 border-blue-300 text-blue-800"
      case "out-of-order":
        return "bg-gray-100 border-gray-300 text-gray-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4" />
      case "occupied":
        return <Users className="h-4 w-4" />
      case "reserved":
        return <Clock className="h-4 w-4" />
      case "cleaning":
        return <Sparkles className="h-4 w-4" />
      case "out-of-order":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getOrderForTable = (tableNumber: string) => {
    return orders.find((order) => order.tableNumber === tableNumber && order.status !== "completed")
  }

  const handleReserveTable = () => {
    if (selectedTable && reservationName && reservationTime) {
      const reservationDate = new Date(reservationTime)
      reserveTable(selectedTable, reservationName, reservationDate)
      setSelectedTable(null)
      setReservationName("")
      setReservationTime("")
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      available: language === "hi" ? "उपलब्ध" : "Available",
      occupied: language === "hi" ? "व्यस्त" : "Occupied",
      reserved: language === "hi" ? "आरक्षित" : "Reserved",
      cleaning: language === "hi" ? "सफाई" : "Cleaning",
      "out-of-order": language === "hi" ? "खराब" : "Out of Order",
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{language === "hi" ? "टेबल प्रबंधन" : "Table Management"}</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{language === "hi" ? "उपलब्ध" : "Available"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{language === "hi" ? "व्यस्त" : "Occupied"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>{language === "hi" ? "आरक्षित" : "Reserved"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{language === "hi" ? "सफाई" : "Cleaning"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables.map((table) => {
          const currentOrder = getOrderForTable(table.number)
          const isOccupied = table.status === "occupied"

          return (
            <Card
              key={table.id}
              className={cn(
                "relative transition-all duration-300 hover:scale-105 cursor-pointer",
                getTableStatusColor(table.status),
                "border-2",
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{table.number}</span>
                  {getTableStatusIcon(table.status)}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {table.capacity}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(table.status)}
                  </Badge>
                </div>

                {table.customerName && <div className="text-xs font-medium truncate">{table.customerName}</div>}

                {currentOrder && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Order #{currentOrder.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      ₹{currentOrder.total.toFixed(0)} • {currentOrder.items.length} items
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        currentOrder.status === "preparing" && "bg-orange-100 text-orange-700",
                        currentOrder.status === "ready" && "bg-green-100 text-green-700",
                      )}
                    >
                      {currentOrder.status}
                    </Badge>
                  </div>
                )}

                {table.reservationTime && (
                  <div className="text-xs text-muted-foreground">
                    {language === "hi" ? "आरक्षण:" : "Reserved:"}{" "}
                    {table.reservationTime.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}

                <div className="flex space-x-1 mt-2">
                  {table.status === "available" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs bg-transparent"
                          onClick={() => setSelectedTable(table.id)}
                        >
                          {language === "hi" ? "आरक्षित करें" : "Reserve"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {language === "hi" ? "टेबल आरक्षण" : "Reserve Table"} {table.number}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="customerName">{language === "hi" ? "ग्राहक का नाम" : "Customer Name"}</Label>
                            <Input
                              id="customerName"
                              value={reservationName}
                              onChange={(e) => setReservationName(e.target.value)}
                              placeholder={language === "hi" ? "नाम दर्ज करें" : "Enter name"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reservationTime">
                              {language === "hi" ? "आरक्षण समय" : "Reservation Time"}
                            </Label>
                            <Input
                              id="reservationTime"
                              type="datetime-local"
                              value={reservationTime}
                              onChange={(e) => setReservationTime(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleReserveTable} className="w-full">
                            {language === "hi" ? "आरक्षित करें" : "Reserve Table"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {table.status === "cleaning" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs bg-transparent"
                      onClick={() => cleanTable(table.id)}
                    >
                      {language === "hi" ? "साफ हो गया" : "Clean Done"}
                    </Button>
                  )}

                  {table.status === "occupied" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs bg-transparent"
                      onClick={() => updateTableStatus(table.id, "cleaning")}
                    >
                      {language === "hi" ? "सफाई" : "Clean"}
                    </Button>
                  )}

                  {table.status === "out-of-order" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs bg-transparent"
                      onClick={() => updateTableStatus(table.id, "available")}
                    >
                      {language === "hi" ? "ठीक करें" : "Fix"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table Statistics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { status: "available", label: language === "hi" ? "उपलब्ध" : "Available", color: "text-green-600" },
          { status: "occupied", label: language === "hi" ? "व्यस्त" : "Occupied", color: "text-red-600" },
          { status: "reserved", label: language === "hi" ? "आरक्षित" : "Reserved", color: "text-yellow-600" },
          { status: "cleaning", label: language === "hi" ? "सफाई" : "Cleaning", color: "text-blue-600" },
          { status: "out-of-order", label: language === "hi" ? "खराब" : "Out of Order", color: "text-gray-600" },
        ].map((stat) => {
          const count = tables.filter((table) => table.status === stat.status).length
          return (
            <Card key={stat.status}>
              <CardContent className="p-4 text-center">
                <div className={cn("text-2xl font-bold", stat.color)}>{count}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
