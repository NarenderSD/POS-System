"use client"

import { useState, useEffect } from "react"
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
  const { tables, addTable, orders, updateTableStatus, cleanTable, reserveTable, language } = usePOS()
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [reservationName, setReservationName] = useState("")
  const [reservationTime, setReservationTime] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTable, setNewTable] = useState({ number: "", capacity: 4 })

  // Refresh tables after add (if needed)
  useEffect(() => {}, [tables])

  const handleAddTable = async (e: any) => {
    e.preventDefault()
    if (!newTable.number || !newTable.capacity) return
    await addTable({ number: newTable.number, capacity: Number(newTable.capacity), status: "available" })
    setShowAddDialog(false)
    setNewTable({ number: "", capacity: 4 })
  }

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

  // Fix getOrderForTable to only return an order if it is not completed, cancelled, or paid
  const getOrderForTable = (tableNumber: string) => {
    return orders.find((order) => order.tableNumber === tableNumber && !['completed', 'cancelled', 'paid'].includes(order.status) && order.paymentStatus !== 'paid')
  }

  // Fix getTableStatus to only show 'available' if there is no active order and no reservation/cleaning/out-of-order
  const getTableStatus = (table: any) => {
    const currentOrder = getOrderForTable(table.number)
    if (currentOrder) {
      return 'occupied'
    }
    if (table.status === 'reserved') return 'reserved'
    if (table.status === 'cleaning') return 'cleaning'
    if (table.status === 'out-of-order') return 'out-of-order'
    return 'available'
  }

  // Remove local finalizeBill and use context finalizeBillForTable
  const { finalizeBillForTable } = usePOS()

  // Reserve logic: only the selected table is reserved
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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-2">{language === "hi" ? "टेबल प्रबंधन" : "Table Management"}</h2>
        <Button onClick={() => setShowAddDialog(true)}>{language === "hi" ? "टेबल जोड़ें" : "Add Table"}</Button>
      </div>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{language === "hi" ? "नई टेबल जोड़ें" : "Add New Table"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTable} className="space-y-4">
            <div>
              <Label>Table Number</Label>
              <Input value={newTable.number} onChange={e => setNewTable({ ...newTable, number: e.target.value })} required />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input type="number" value={newTable.capacity} onChange={e => setNewTable({ ...newTable, capacity: e.target.value })} required min={1} />
            </div>
            <Button type="submit" className="w-full">{language === "hi" ? "जोड़ें" : "Add"}</Button>
          </form>
        </DialogContent>
      </Dialog>
      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="text-6xl mb-4">🍽️</div>
          <div className="text-lg font-semibold mb-2">{language === "hi" ? "कोई टेबल नहीं मिली" : "No tables found"}</div>
          <div className="text-muted-foreground mb-4">{language === "hi" ? "कृपया टेबल जोड़ें या फ़िल्टर बदलें।" : "Please add tables or change filters."}</div>
          <Button size="lg" onClick={() => setShowAddDialog(true)}>{language === "hi" ? "टेबल जोड़ें" : "Add Table"}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tables.map((table) => {
            const currentOrder = getOrderForTable(table.number)
            const status = currentOrder ? 'occupied' : getTableStatus(table)
            const isOccupied = status === "occupied"

            return (
              <Card
                key={table.id}
                className={cn(
                  "relative transition-all duration-300 hover:scale-105 cursor-pointer",
                  getTableStatusColor(status),
                  "border-2",
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{table.number}</span>
                    {getTableStatusIcon(status)}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {table.capacity}
                    </span>
                    {status === 'available' && <Badge variant="outline" className="text-xs">{getStatusText(status)}</Badge>}
                    {status === 'occupied' && <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">{getStatusText(status)}</Badge>}
                    {status === 'reserved' && <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">{getStatusText(status)}</Badge>}
                    {status === 'cleaning' && <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">{getStatusText(status)}</Badge>}
                    {status === 'out-of-order' && <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">{getStatusText(status)}</Badge>}
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
                          currentOrder.status === "confirmed" && "bg-blue-100 text-blue-700",
                          currentOrder.paymentStatus === "paid" && "bg-green-200 text-green-900"
                        )}
                      >
                        {currentOrder.paymentStatus === "paid" ? "paid" : currentOrder.status}
                      </Badge>
                    </div>
                  )}

                  {table.reservationTime && (
                    <div className="text-xs text-muted-foreground">
                      {language === "hi" ? "आरक्षण:" : "Reserved:"} {table.reservationTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}

                  {/* Only show customer details input for available tables, not occupied */}
                  {status === "available" && (
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

                  {status === "cleaning" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs bg-transparent"
                      onClick={() => cleanTable(table.id)}
                    >
                      {language === "hi" ? "साफ हो गया" : "Clean Done"}
                    </Button>
                  )}

                  {status === "occupied" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs bg-transparent"
                      onClick={() => updateTableStatus(table.id, "cleaning")}
                    >
                      {language === "hi" ? "सफाई" : "Clean"}
                    </Button>
                  )}

                  {status === "out-of-order" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs bg-transparent"
                      onClick={() => updateTableStatus(table.id, "available")}
                    >
                      {language === "hi" ? "ठीक करें" : "Fix"}
                    </Button>
                  )}

                  {isOccupied && (
                    <Button size="sm" variant="success" className="flex-1 text-xs" onClick={() => finalizeBillForTable(table._id || table.id)}>
                      {language === "hi" ? "फाइनल बिल/खाली करें" : "Finalize Bill / Clear"}
                    </Button>
                  )}
                  {status !== "cleaning" && (
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => updateTableStatus(table.id, "cleaning")}>
                      {language === "hi" ? "सफाई पर सेट करें" : "Set to Cleaning"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Table Statistics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { status: "available", label: language === "hi" ? "उपलब्ध" : "Available", color: "text-green-600" },
          { status: "occupied", label: language === "hi" ? "व्यस्त" : "Occupied", color: "text-red-600" },
          { status: "reserved", label: language === "hi" ? "आरक्षित" : "Reserved", color: "text-yellow-600" },
          { status: "cleaning", label: language === "hi" ? "सफाई" : "Cleaning", color: "text-blue-600" },
          { status: "out-of-order", label: language === "hi" ? "खराब" : "Out of Order", color: "text-gray-600" },
        ].map((stat) => {
          const count = tables.filter((table) => getTableStatus(table) === stat.status).length
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
