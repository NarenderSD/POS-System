"use client"
import {
  Users,
  Clock,
  Phone,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePOS } from "../context/pos-context"
import type { Table } from "../types"
import WaiterAssignment from "./waiter-assignment"
import { useEffect, useState } from 'react'

interface TableDetailsModalProps {
  table: Table | null
  isOpen: boolean
  onClose: () => void
}

export default function TableDetailsModal({ table, isOpen, onClose }: TableDetailsModalProps) {
  const { orders, staff, updateTableStatus, updateOrderStatus, updateTable, finalizeBillForTable, language } = usePOS()

  if (!table) return null

  const currentOrder = orders.find(
    (order) => order.tableNumber === table.number && !["completed", "cancelled"].includes(order.status),
  )

  const assignedWaiter = staff.find((s) => s.id === table.waiterAssigned)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "occupied":
        return <Users className="h-5 w-5 text-red-500" />
      case "reserved":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "cleaning":
        return <Sparkles className="h-5 w-5 text-blue-500" />
      case "out-of-order":
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "occupied":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "reserved":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "cleaning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "out-of-order":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
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

  const handleWaiterAssign = (waiterId: string, waiterName: string) => {
    // Update table with assigned waiter
    // This would typically be handled by the context
    console.log(`Assigned waiter ${waiterName} to table ${table.number}`)
  }

  const handleFinalizeBill = async () => {
    await finalizeBillForTable(table.id)
    onClose()
  }

  const handleDownloadBill = () => {
    // Download the current order for this table
    if (!currentOrder) return
    // Open the bill overlay or print for this order
    window.open(`/order-confirmation/${currentOrder._id}?download=1`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(table.status)}
              <span className="text-2xl font-bold">{table.number}</span>
            </div>
            <Badge className={getStatusColor(table.status)}>{getStatusText(table.status)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Table Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{language === "hi" ? "टेबल जानकारी" : "Table Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{language === "hi" ? "क्षमता:" : "Capacity:"}</span>
                  <span className="font-medium">{table.capacity} guests</span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{language === "hi" ? "स्थान:" : "Location:"}</span>
                  <span className="font-medium capitalize">{table.location}</span>
                </div>

                {table.lastCleaned && (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {language === "hi" ? "अंतिम सफाई:" : "Last Cleaned:"}
                    </span>
                    <span className="font-medium">
                      {table.lastCleaned.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                {table.features && table.features.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">
                      {language === "hi" ? "विशेषताएं:" : "Features:"}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {table.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {(table.customerName || table.customerPhone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "hi" ? "ग्राहक जानकारी" : "Customer Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {table.customerName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{language === "hi" ? "नाम:" : "Name:"}</span>
                    <span className="font-medium">{table.customerName}</span>
                  </div>
                )}

                {table.customerPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{language === "hi" ? "फोन:" : "Phone:"}</span>
                    <span className="font-medium">{table.customerPhone}</span>
                  </div>
                )}

                {table.reservationTime && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {language === "hi" ? "आरक्षण समय:" : "Reservation Time:"}
                    </span>
                    <span className="font-medium">
                      {table.reservationTime.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assigned Waiter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{language === "hi" ? "असाइन किया गया वेटर" : "Assigned Waiter"}</span>
                <WaiterAssignment tableId={table.id} onAssign={handleWaiterAssign} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedWaiter ? (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={assignedWaiter.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {assignedWaiter.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{assignedWaiter.name}</div>
                    <div className="text-sm text-muted-foreground">{assignedWaiter.phone}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{language === "hi" ? "कोई वेटर असाइन नहीं किया गया" : "No waiter assigned"}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Order */}
          {currentOrder && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{language === "hi" ? "वर्तमान ऑर्डर" : "Current Order"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Order #{currentOrder.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {currentOrder.createdAt.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      currentOrder.status === "preparing"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                        : currentOrder.status === "ready"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : ""
                    }
                  >
                    {currentOrder.status}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{language === "hi" ? "आइटम:" : "Items:"}</h4>
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>
                        {item.quantity}x {language === "hi" && item.nameHindi ? item.nameHindi : item.name}
                      </span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between items-center font-medium">
                  <span>{language === "hi" ? "कुल:" : "Total:"}</span>
                  <span className="text-green-600">₹{currentOrder.total.toFixed(0)}</span>
                </div>

                {currentOrder.specialInstructions && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      {language === "hi" ? "विशेष निर्देश:" : "Special Instructions:"}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">
                      {currentOrder.specialInstructions}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {table.status === "available" && (
              <Button onClick={() => updateTableStatus(table.id, "reserved")} className="flex-1" variant="outline">
                {language === "hi" ? "आरक्षित करें" : "Reserve"}
              </Button>
            )}

            {table.status === "occupied" && (
              <Button onClick={() => updateTableStatus(table.id, "cleaning")} className="flex-1" variant="outline">
                {language === "hi" ? "सफाई के लिए भेजें" : "Send for Cleaning"}
              </Button>
            )}

            {table.status === "cleaning" && (
              <Button
                onClick={() => updateTableStatus(table.id, "available")}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {language === "hi" ? "सफाई पूर्ण" : "Cleaning Complete"}
              </Button>
            )}

            {table.status === "out-of-order" && (
              <Button
                onClick={() => updateTableStatus(table.id, "available")}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {language === "hi" ? "ठीक करें" : "Mark as Fixed"}
              </Button>
            )}

            <Button onClick={handleFinalizeBill} className="w-full mt-4" variant="success">Finalize Bill (Paid)</Button>
            <Button onClick={handleDownloadBill} className="w-full mt-2" variant="outline">Download Bill</Button>

            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              {language === "hi" ? "बंद करें" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
