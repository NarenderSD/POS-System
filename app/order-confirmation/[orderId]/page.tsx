"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Printer, ArrowLeft, Clock, ChefHat, Leaf, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePOS } from "../../context/pos-context"
import AnimatedCounter from "../../components/animated-counter"
import { use } from "react"

interface OrderConfirmationPageProps {
  params: {
    orderId: string
  }
}

export default function OrderConfirmationPage({ params }: { params: any }) {
  const unwrappedParams = use(params)
  const orderId = unwrappedParams.orderId
  const router = useRouter()
  const { orders, language, updateOrderStatus } = usePOS()
  const [countdown, setCountdown] = useState(30)
  const [isPrinting, setIsPrinting] = useState(false)

  const order = orders.find((o) => o._id === orderId)

  useEffect(() => {
    if (!order) {
      router.push("/")
      return
    }

    if (countdown <= 0) {
      router.push("/")
      return
    }

    // Auto redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [order, router])

  useEffect(() => {
    if (countdown === 0) {
      router.push("/")
    }
  }, [countdown, router])

  const handlePrint = async () => {
    setIsPrinting(true)

    // Simulate printing process
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update order status to confirmed after printing
    if (order) {
      updateOrderStatus(order._id, "confirmed")
    }

    window.print()
    setIsPrinting(false)
  }

  const handleBackToPOS = () => {
    router.push("/")
  }

  const handleDownloadReceipt = () => {
    // Create a simple text receipt
    if (!order) return

    const receiptText = `
Apna POS - India's Smartest POS
================================
Order #${order.orderNumber}
Date: ${order.createdAt.toLocaleString("en-IN")}
Table: ${order.tableNumber || "N/A"}
Type: ${order.orderType}
Customer: ${order.customerName || "Walk-in"}

ITEMS:
${order.items.map((item) => `${item.quantity}x ${item.name} - ₹${(item.price * item.quantity).toFixed(0)}`).join("\n")}

BILL SUMMARY:
Subtotal: ₹${order.subtotal.toFixed(0)}
Service Charge: ₹${order.serviceCharge.toFixed(0)}
GST (18%): ₹${order.tax.toFixed(0)}
Total: ₹${order.total.toFixed(0)}

Payment: ${order.paymentMethod || "Cash"}
Status: ${order.paymentStatus}

Thank you for dining with us!
For support: +91 98765 43210
================================
    `

    const blob = new Blob([receiptText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${order.orderNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!order) {
    return null
  }

  const receiptNumber = order.orderNumber
  const date = order.createdAt.toLocaleString("en-IN")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            {language === "hi" ? "ऑर्डर सफल!" : "Order Successful!"}
          </h1>
          <p className="text-green-600">
            {language === "hi" ? "आपका ऑर्डर प्राप्त हो गया है" : "Your order has been received"}
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6 print:shadow-none">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white print:bg-white print:text-black">
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
                <div className="text-lg font-bold">#{receiptNumber}</div>
                <div className="text-sm opacity-90">{date}</div>
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
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">{language === "hi" ? "नाम:" : "Name:"}</span> {order.customerName || (language === "hi" ? "-" : "-")}
                  </div>
                  <div>
                    <span className="font-medium">{language === "hi" ? "फोन:" : "Phone:"}</span> {order.customerPhone || (language === "hi" ? "-" : "-")}
                  </div>
                  <div>
                    <span className="font-medium">{language === "hi" ? "ईमेल:" : "Email:"}</span> {order.customerEmail || (language === "hi" ? "-" : "-")}
                  </div>
                  {order.address && (
                    <div>
                      <span className="font-medium">{language === "hi" ? "पता:" : "Address:"}</span> {order.address}
                    </div>
                  )}
                </div>
              </div>
              {/* Waiter Details Section (always show, with fallback) */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                  {language === "hi" ? "वेटर" : "Waiter"}
                </h3>
                <p className="font-medium">{order.waiterName || (language === "hi" ? "-" : "-")}</p>
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
              {order.items.map((item, index) => (
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
              ))}
            </div>

            <Separator className="my-4" />

            {/* Bill Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{language === "hi" ? "उप-योग" : "Subtotal"}</span>
                <span>₹{order.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "hi" ? "सेवा शुल्क (10%)" : "Service Charge (10%)"}</span>
                <span>₹{order.serviceCharge.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "hi" ? "जीएसटी (18%)" : "GST (18%)"}</span>
                <span>₹{order.tax.toFixed(0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{language === "hi" ? "छूट" : "Discount"}</span>
                  <span>-₹{order.discount.toFixed(0)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{language === "hi" ? "कुल राशि" : "Total Amount"}</span>
                <span className="text-green-600">
                  ₹<AnimatedCounter value={Math.round(order.total)} />
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
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <Button onClick={handleBackToPOS} variant="outline" className="flex-1 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "hi" ? "POS पर वापस जाएं" : "Back to POS"}
          </Button>

          <Button onClick={handlePrint} variant="outline" className="flex-1 bg-transparent" disabled={isPrinting}>
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting
              ? language === "hi"
                ? "प्रिंट हो रहा..."
                : "Printing..."
              : language === "hi"
                ? "रसीद प्रिंट करें"
                : "Print Receipt"}
          </Button>

          <Button onClick={handleDownloadReceipt} variant="outline" className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            {language === "hi" ? "डाउनलोड करें" : "Download"}
          </Button>
        </div>

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
  )
}
