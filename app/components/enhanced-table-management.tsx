"use client"

import { useState } from "react"
import { Users, Clock, CheckCircle, AlertTriangle, XCircle, Sparkles, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePOS } from "../context/pos-context"
import { cn } from "@/lib/utils"
import TableDetailsModal from "./table-details-modal"
import type { Table } from "../types"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function EnhancedTableManagement() {
  const { tables, orders, language } = usePOS()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTable, setNewTable] = useState({ number: '', capacity: '', location: '', customerName: '', customerPhone: '', customerEmail: '' })
  const { addTable } = usePOS()

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
      case "occupied":
        return "bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-300"
      case "reserved":
        return "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300"
      case "cleaning":
        return "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300"
      case "out-of-order":
        return "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getOrderForTable = (tableNumber: string) => {
    return orders.find(
      (order) => order.tableNumber === tableNumber && !["completed", "cancelled"].includes(order.status),
    )
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

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    setIsModalOpen(true)
  }

  const handleAddTable = async (e: any) => {
    e.preventDefault()
    await addTable({ number: newTable.number, capacity: Number(newTable.capacity), status: 'available', location: newTable.location, customerName: newTable.customerName, customerPhone: newTable.customerPhone, customerEmail: newTable.customerEmail })
    setShowAddDialog(false)
    setNewTable({ number: '', capacity: '', location: '', customerName: '', customerPhone: '', customerEmail: '' })
  }

  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (table.customerName && table.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || table.status === statusFilter
    const matchesLocation = locationFilter === "all" || table.location === locationFilter

    return matchesSearch && matchesStatus && matchesLocation
  })

  const tableStats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
    outOfOrder: tables.filter((t) => t.status === "out-of-order").length,
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{language === "hi" ? "टेबल प्रबंधन" : "Table Management"}</h2>
          <p className="text-muted-foreground">
            {language === "hi" ? "रेस्टोरेंट टेबल्स को ट्रैक और मैनेज करें" : "Track and manage restaurant tables"}
          </p>
        </div>
        <Button size="lg" className="mt-2 md:mt-0" onClick={() => setShowAddDialog(true)}>
          {language === "hi" ? "टेबल जोड़ें" : "Add Table"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: "total", label: language === "hi" ? "कुल" : "Total", value: tableStats.total, color: "text-blue-600" },
          {
            key: "available",
            label: language === "hi" ? "उपलब्ध" : "Available",
            value: tableStats.available,
            color: "text-green-600",
          },
          {
            key: "occupied",
            label: language === "hi" ? "व्यस्त" : "Occupied",
            value: tableStats.occupied,
            color: "text-red-600",
          },
          {
            key: "reserved",
            label: language === "hi" ? "आरक्षित" : "Reserved",
            value: tableStats.reserved,
            color: "text-yellow-600",
          },
          {
            key: "cleaning",
            label: language === "hi" ? "सफाई" : "Cleaning",
            value: tableStats.cleaning,
            color: "text-blue-600",
          },
          {
            key: "outOfOrder",
            label: language === "hi" ? "खराब" : "Out of Order",
            value: tableStats.outOfOrder,
            color: "text-gray-600",
          },
        ].map((stat) => (
          <Card key={stat.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-16">
          <span className="text-3xl mb-2">🍽️</span>
          <div className="text-lg font-semibold text-muted-foreground">
            {language === "hi"
              ? "कोई टेबल नहीं मिली। कृपया टेबल जोड़ें या फ़िल्टर बदलें।"
              : "No tables found. Please add tables or change filters."}
          </div>
          <Button size="lg" className="mt-6" onClick={() => setShowAddDialog(true)}>
            {language === "hi" ? "टेबल जोड़ें" : "Add Table"}
          </Button>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {filteredTables.map((table) => {
          const currentOrder = getOrderForTable(table.number)
          const isOccupied = table.status === "occupied"

          return (
            <Card
              key={table._id || table.id || table.number}
              className={cn(
                "relative transition-all duration-300 hover:scale-105 cursor-pointer border-2",
                getTableStatusColor(table.status),
                "hover:shadow-lg",
              )}
              onClick={() => handleTableClick(table)}
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

                {table.location && <div className="text-xs text-muted-foreground capitalize">📍 {table.location}</div>}

                {table.customerName && <div className="text-xs font-medium truncate">👤 {table.customerName}</div>}

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
                        currentOrder.status === "preparing" &&
                          "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
                        currentOrder.status === "ready" &&
                          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                      )}
                    >
                      {currentOrder.status}
                    </Badge>
                  </div>
                )}

                {table.reservationTime && (
                  <div className="text-xs text-muted-foreground">
                    🕒{" "}
                    {table.reservationTime.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}

                {table.waiterAssigned && <div className="text-xs text-muted-foreground">👨‍💼 Waiter assigned</div>}
              </CardContent>
            </Card>
          )
        })}
      </div>
      )}

      {filteredTables.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">{language === "hi" ? "कोई टेबल नहीं मिली" : "No tables found"}</h3>
          <p className="text-muted-foreground">
            {language === "hi" ? "अपनी खोज या फिल्टर को समायोजित करें" : "Try adjusting your search or filters"}
          </p>
        </div>
      )}

      {/* Table Details Modal */}
      <TableDetailsModal
        table={selectedTable}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTable(null)
        }}
      />

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
            <div>
              <Label>Location</Label>
              <Input value={newTable.location || ''} onChange={e => setNewTable({ ...newTable, location: e.target.value })} />
            </div>
            <div>
              <Label>Customer Name</Label>
              <Input value={newTable.customerName || ''} onChange={e => setNewTable({ ...newTable, customerName: e.target.value })} />
            </div>
            <div>
              <Label>Customer Phone</Label>
              <Input value={newTable.customerPhone || ''} onChange={e => setNewTable({ ...newTable, customerPhone: e.target.value })} />
            </div>
            <div>
              <Label>Customer Email</Label>
              <Input value={newTable.customerEmail || ''} onChange={e => setNewTable({ ...newTable, customerEmail: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">{language === "hi" ? "जोड़ें" : "Add"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg bg-green-600 text-white hover:bg-green-700"
        size="icon"
        style={{ width: 56, height: 56 }}
        onClick={() => setShowAddDialog(true)}
      >
        +
        <span className="sr-only">{language === "hi" ? "टेबल जोड़ें" : "Add Table"}</span>
      </Button>
    </div>
  )
}
