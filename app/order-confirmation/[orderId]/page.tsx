"use client"

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Printer, ArrowLeft, Clock, ChefHat, Leaf, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePOS } from "../../context/pos-context"
import AnimatedCounter from "../../components/animated-counter"
import { use } from "react"
import { toast } from "@/components/ui/use-toast"
import jsPDF from 'jspdf'

// Add helper for initials at the top-level
function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase()
}

// Accept props for modal/overlay use
export default function OrderConfirmationPage({ orderId: propOrderId, showActions = false, countdown, onBack }: { orderId?: string, showActions?: boolean, countdown?: number, onBack?: () => void } = {}) {
  const router = useRouter()
  const billRef = useRef<HTMLDivElement>(null)
  // Always define hooks at the top
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { orders, language, updateOrderStatus, cleanTable } = usePOS()
  const [isPrinting, setIsPrinting] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendTo, setSendTo] = useState('')
  const [sendType, setSendType] = useState<'whatsapp' | 'email'>('whatsapp')
  const [sending, setSending] = useState(false)

  // Get orderId from prop or URL (client only)
  const [clientOrderId, setClientOrderId] = useState<string | undefined>(propOrderId)
  useEffect(() => {
    if (!propOrderId && typeof window !== 'undefined') {
      setClientOrderId(window.location.pathname.split('/').pop())
    }
  }, [propOrderId])

  // Fetch order data
  useEffect(() => {
    if (clientOrderId) {
      setLoading(true)
      fetch(`/api/orders?id=${clientOrderId}`)
        .then(r => r.json())
        .then(data => setOrder(data))
        .finally(() => setLoading(false))
    }
  }, [clientOrderId])

  // Memoize formatted date (client only)
  const formattedDate = useMemo(() => {
    if (!order?.createdAt) return "-"
    if (typeof window === 'undefined') return "-"
    const createdAt = typeof order?.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt
    if (createdAt && createdAt.toLocaleString) {
      return createdAt.toLocaleString("en-IN")
    }
    return "-"
  }, [order?.createdAt])

  // Waiter details (with phone/shift if available)
  const waiterDetails = useMemo(() => order && (order.waiterName || order.waiterPhone || order.waiterShift)
    ? {
        name: order.waiterName || "-",
        phone: order.waiterPhone || "-",
        shift: order.waiterShift || "-",
        avatar: order.waiterAvatar || null,
      }
    : null, [order])

  // Bill number (sequential)
  const billNumber = useMemo(() => (order?.billNumber || order?.orderNumber || (order?._id ? `N${parseInt(order._id.slice(-6), 16).toString().padStart(6, '0')}` : '-')), [order])

  // Handle print
  const handlePrint = async () => {
    setIsPrinting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (order) {
      updateOrderStatus(order._id, "confirmed")
    }
    window.print()
    setIsPrinting(false)
  }

  // Handle back
  const handleBackToPOS = () => {
    router.push("/")
  }

  // Handle download receipt as PDF (styled, color, like screen, single page, centered)
  const handleDownloadReceipt = async () => {
    if (!order) return
    if (billRef.current) {
      const html2pdf = (await import('html2pdf.js')).default
      // Clone the bill node and clean up overlay/fixed styles for PDF
      const billNode = billRef.current.cloneNode(true) as HTMLElement
      billNode.style.position = 'static'
      billNode.style.left = 'unset'
      billNode.style.top = 'unset'
      billNode.style.width = '800px'
      billNode.style.maxWidth = '800px'
      billNode.style.background = '#fff'
      billNode.style.boxShadow = '0 0 24px 0 #e5e7eb'
      billNode.style.zIndex = '1'
      billNode.style.margin = '0 auto'
      billNode.style.padding = '32px'
      billNode.style.borderRadius = '16px'
      // Remove overlay classes if present
      billNode.classList.remove('fixed', 'inset-0', 'z-[9999]', 'overflow-y-auto', 'order-bill-print')
      billNode.classList.add('order-bill-print') // keep print style
      // Remove any print:hidden elements from the clone
      billNode.querySelectorAll('.print\\:hidden, .print\\:hidden *').forEach(el => el.remove())
      html2pdf().set({
        margin: [8, 0, 8, 0],
        filename: `bill-${billNumber}.pdf`,
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1.1, useCORS: true, backgroundColor: '#fff', windowWidth: 800 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
      }).from(billNode).save()
    }
  }

  // Handle clear table
  const handleClearTable = async () => {
    if (order?.tableNumber) {
      const tableId = Number.parseInt(order.tableNumber.replace("T", ""))
      cleanTable(tableId)
      await updateOrderStatus(order._id, "completed")
      toast({
        title: language === "hi" ? "टेबल साफ़ हो गया" : "Table cleared",
        description: language === "hi" ? "टेबल अब फिर से उपयोग के लिए उपलब्ध है।" : "Table is now available for new orders.",
      })
      router.push("/")
    }
  }

  // Handle send bill
  const handleSendBill = async () => {
    setSending(true)
    await new Promise(res => setTimeout(res, 2000))
    setSending(false)
    setShowSendModal(false)
    toast({ title: 'Bill sent!', description: `Bill sent to ${sendType === 'whatsapp' ? 'WhatsApp' : 'Email'}: ${sendTo}` })
  }

  // Auto-redirect if no order or countdown hits 0
  useEffect(() => {
    if (!order && !loading) {
      router.push("/")
      return
    }
    if (countdown === 0) {
      router.push("/")
    }
  }, [order, loading, router, countdown])

  // Always show action buttons (Back, Download, Print, Send) at the bottom
  const showActionButtons = showActions || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('download') === '1')

  // Countdown state for Back to POS
  const [countdownTimer, setCountdownTimer] = useState(30)
  useEffect(() => {
    if (!showActionButtons) return
    if (countdownTimer <= 0) {
      handleBackToPOS()
      return
    }
    const timer = setTimeout(() => setCountdownTimer(countdownTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdownTimer, showActionButtons])

  // Loading and not found states (no hooks after this)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading bill...</div>
      </div>
    )
  }
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold text-red-600">Order not found.</div>
      </div>
    )
  }

  return (
    <>
      {/* Main visible bill content and action buttons (always visible) */}
      <div ref={billRef} className="order-bill-print fixed inset-0 z-[9999] bg-white flex items-start justify-center w-screen h-screen overflow-y-auto">
        <div className="w-full max-w-xl min-h-[90vh] bg-white rounded-xl shadow-2xl p-0 flex flex-col items-center justify-start overflow-y-auto no-scrollbar py-8">
          {/* Bill content (same as PDF, but with action buttons) */}
          <div className="text-center mb-8 mt-4 w-full">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 mx-auto">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">{language === "hi" ? "ऑर्डर सफल!" : "Order Successful!"}</h1>
            <p className="text-green-600">{language === "hi" ? "आपका ऑर्डर प्राप्त हो गया है" : "Your order has been received"}</p>
          </div>
          <Card className="mb-6 print:shadow-none w-full">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white print:bg-white print:text-black rounded-t-xl">
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold flex items-center">
                    <Leaf className="h-6 w-6 mr-2" />
                    Apna POS
                  </div>
                  <div className="text-sm opacity-90">
                    India's Smartest POS
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">Bill {billNumber}</div>
                  <div className="text-sm opacity-90">{formattedDate}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    {language === "hi" ? "ऑर्डर प्रकार" : "Order Type"}
                  </h3>
                  <Badge variant="outline" className="capitalize">
                    {order.orderType}
                  </Badge>
                </div>
                {order.tableNumber && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                      {language === "hi" ? "टेबल" : "Table"}
                    </h3>
                    <Badge variant="outline">{order.tableNumber}</Badge>
                  </div>
                )}
                {/* Customer Details Section (always show, with fallbacks) */}
                <div className="col-span-2">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    {language === "hi" ? "ग्राहक विवरण" : "Customer Details"}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                      {order.customerAvatar ? (
                        <img src={order.customerAvatar} alt={order.customerName} className="w-8 h-8 rounded-full" />
                      ) : (
                        getInitials(order.customerName)
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{order.customerName || '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customerPhone ? order.customerPhone : '-'}
                        {order.customerEmail ? ` | ${order.customerEmail}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Special Instructions Section (always show if present) */}
                {order.specialInstructions && (
                  <div className="col-span-2 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      {language === "hi" ? "विशेष निर्देश:" : "Special Instructions:"}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">
                      {order.specialInstructions}
                    </div>
                  </div>
                )}
                {/* Waiter Details Section (always show, with fallback) */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    {language === "hi" ? "वेटर" : "Waiter"}
                  </h3>
                  {waiterDetails ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                        {waiterDetails.avatar ? (
                          <img src={waiterDetails.avatar} alt={waiterDetails.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          getInitials(waiterDetails.name)
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{waiterDetails.name}</div>
                        <div className="text-xs text-muted-foreground">{waiterDetails.phone} {waiterDetails.shift && `| ${waiterDetails.shift}`}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
                {order.estimatedTime && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                      {language === "hi" ? "अनुमानित समय" : "Estimated Time"}
                    </h3>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-green-500" />
                      <span className="font-medium">{order.estimatedTime} minutes</span>
                    </div>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold flex items-center">
                  <ChefHat className="h-4 w-4 mr-2" />
                  {language === "hi" ? "ऑर्डर आइटम" : "Order Items"}
                </h3>
                {(order.items || []).length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No items in this order.</div>
                ) : (
                  (order.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Leaf className="h-3 w-3 text-green-500 mr-1" />
                          <span className="font-medium">
                            {language === "hi" && item.nameHindi ? item.nameHindi : item.name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ₹{item.price} × {item.quantity}
                        </div>
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.customizations.map((customization, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {customization}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {item.specialInstructions && (
                          <div className="text-xs text-muted-foreground mt-1">Note: {item.specialInstructions}</div>
                        )}
                      </div>
                      <div className="font-semibold text-green-600">₹{(item.price * item.quantity).toFixed(0)}</div>
                    </div>
                  ))
                )}
              </div>
              <Separator className="my-4" />
              {/* Bill Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{language === "hi" ? "उप-योग" : "Subtotal"}</span>
                  <span>₹{(order.subtotal ?? 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === "hi" ? "सेवा शुल्क (10%)" : "Service Charge (10%)"}</span>
                  <span>₹{(order.serviceCharge ?? 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === "hi" ? "जीएसटी (18%)" : "GST (18%)"}</span>
                  <span>₹{(order.tax ?? 0).toFixed(0)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{language === "hi" ? "छूट" : "Discount"}</span>
                    <span>-₹{(order.discount ?? 0).toFixed(0)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{language === "hi" ? "कुल राशि" : "Total Amount"}</span>
                  <span className="text-green-600">
                    ₹<AnimatedCounter value={Math.round(order.total ?? 0)} />
                  </span>
                </div>
              </div>
              {/* Payment Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{language === "hi" ? "भुगतान विधि" : "Payment Method"}</span>
                  <Badge className="capitalize bg-green-100 text-green-800">{order.paymentMethod || "Cash"}</Badge>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">{language === "hi" ? "भुगतान स्थिति" : "Payment Status"}</span>
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"} className="bg-green-500">
                    {order.paymentStatus === "paid"
                      ? language === "hi"
                        ? "भुगतान हो गया"
                        : "Paid"
                      : language === "hi"
                        ? "लंबित"
                        : "Pending"}
                  </Badge>
                </div>
                {order.loyaltyPointsEarned && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">{language === "hi" ? "लॉयल्टी पॉइंट्स" : "Loyalty Points Earned"}</span>
                    <Badge variant="outline" className="text-green-600">
                      +{order.loyaltyPointsEarned} points
                    </Badge>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p className="flex items-center justify-center mb-2">
                  <Leaf className="h-4 w-4 mr-1 text-green-500" />
                  {language === "hi" ? "धन्यवाद! फिर से आने के लिए" : "Thank you for choosing pure vegetarian!"}
                </p>
                <p className="mt-1">
                  {language === "hi" ? "सहायता के लिए: +91 98765 43210" : "For support: +91 98765 43210"}
                </p>
                <p className="text-xs mt-2 text-green-600">
                  {language === "hi" ? "100% शुद्ध शाकाहारी • स्वच्छ • स्वादिष्ट" : "100% Pure Vegetarian • Clean • Delicious"}
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Built by <a href="https://www.linkedin.com/in/narendersingh1/" className="underline font-bold" target="_blank">Narender Singh</a>
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Action Buttons (always visible) */}
          {showActionButtons && (
            <div className="flex flex-col sm:flex-row gap-4 print:hidden mt-4 w-full">
              <Button onClick={onBack || handleBackToPOS} variant="outline" className="flex-1 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === "hi" ? "POS पर वापस जाएं" : "Back to POS"}
                <span className="ml-2 text-xs text-muted-foreground">({countdownTimer})</span>
              </Button>
              <Button onClick={handleDownloadReceipt} variant="outline" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                {language === "hi" ? "डाउनलोड रसीद" : "Download Receipt"}
              </Button>
              <Button onClick={handlePrint} variant="outline" className="flex-1 bg-transparent" disabled={isPrinting}>
                <Printer className="h-4 w-4 mr-2" />
                {isPrinting ? (language === "hi" ? "प्रिंट हो रहा है..." : "Printing...") : (language === "hi" ? "प्रिंट करें" : "Print")}
              </Button>
              <Button onClick={() => setShowSendModal(true)} variant="outline" className="flex-1 bg-transparent">Send Bill (PDF) on WhatsApp/Mail</Button>
            </div>
          )}
          {/* Auto Redirect Notice */}
          <div className="mt-6 text-center text-sm text-muted-foreground print:hidden">
            <p>
              {language === "hi"
                ? `${countdown} सेकंड में स्वचालित रूप से POS पर वापस जा रहे हैं...`
                : `Automatically returning to POS in ${countdown} seconds...`}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

