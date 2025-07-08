"use client"

import { useState } from "react"
import { User, Users, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePOS } from "../context/pos-context"

interface WaiterAssignmentProps {
  orderId?: string
  tableId?: number
  onAssign?: (waiterId: string, waiterName: string) => void
  selectedWaiter?: string
  setSelectedWaiter?: (id: string) => void
}

export default function WaiterAssignment({ orderId, tableId, onAssign, selectedWaiter: propSelectedWaiter, setSelectedWaiter: propSetSelectedWaiter }: WaiterAssignmentProps) {
  const { staff, assignWaiter, language } = usePOS()
  const [isOpen, setIsOpen] = useState(false)
  const [internalSelectedWaiter, setInternalSelectedWaiter] = useState<string>("")
  const selectedWaiter = propSelectedWaiter !== undefined ? propSelectedWaiter : internalSelectedWaiter
  const setSelectedWaiter = propSetSelectedWaiter !== undefined ? propSetSelectedWaiter : setInternalSelectedWaiter

  const availableWaiters = staff.filter((member) => member.role === "waiter" && member.isActive)

  const handleAssign = () => {
    const waiter = availableWaiters.find((w) => w.id === selectedWaiter)
    if (selectedWaiter && waiter) {
      if (orderId) {
        assignWaiter(orderId, selectedWaiter)
      }
      if (onAssign) {
        onAssign(selectedWaiter, waiter.name)
      }
      setIsOpen(false)
      setSelectedWaiter("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
          <User className="h-4 w-4" />
          <span>{language === "hi" ? "वेटर असाइन करें" : "Assign Waiter"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{language === "hi" ? "वेटर चुनें" : "Select Waiter"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {availableWaiters.map((waiter) => (
            <Card
              key={waiter.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedWaiter === waiter.id
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() => setSelectedWaiter(waiter.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={waiter.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {waiter.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{waiter.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {waiter.shift}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      {waiter.performance && (
                        <>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{waiter.performance.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{waiter.performance.ordersServed} orders</span>
                          </div>
                        </>
                      )}
                    </div>

                    {waiter.phone && <div className="text-xs text-muted-foreground mt-1">{waiter.phone}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {availableWaiters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{language === "hi" ? "कोई वेटर उपलब्ध नहीं" : "No waiters available"}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
            {language === "hi" ? "रद्द करें" : "Cancel"}
          </Button>
          <Button onClick={handleAssign} disabled={!selectedWaiter} className="flex-1 bg-green-600 hover:bg-green-700">
            {language === "hi" ? "असाइन करें" : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
