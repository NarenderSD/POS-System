"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Users,
  MapPin,
  Bike,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePOS } from "../context/pos-context"
import AnimatedCounter from "./animated-counter"
import WaiterAssignment from "./waiter-assignment"
import { useIsMobile } from "../../hooks/use-mobile"
import OrderConfirmationPage from '../order-confirmation/[orderId]/page'

export default function PremiumCartSidebar() {
  const router = useRouter()
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    itemCount,
    orderType,
    setOrderType,
    currentTable,
    setCurrentTable,
    createOrder,
    language,
    tables,
    serviceChargeRate,
    taxRate,
  } = usePOS()

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [selectedWaiter, setSelectedWaiter] = useState("")
  const [selectedWaiterName, setSelectedWaiterName] = useState("")
  const [customer, setCustomer] = useState(null)
  const [showBill, setShowBill] = useState(false)
  const [billOrderId, setBillOrderId] = useState<string | null>(null)
  const [billCountdown, setBillCountdown] = useState(30)

  // Fetch customer info when phone/email changes
  useEffect(() => {
    if (customerPhone || customerEmail) {
      fetch(`/api/customers?phone=${customerPhone}&email=${customerEmail}`)
        .then(r => r.json())
        .then(data => setCustomer(data))
    }
  }, [customerPhone, customerEmail])

  const serviceCharge = cartTotal * serviceChargeRate
  const tax = (cartTotal + serviceCharge) * taxRate
  const grandTotal = cartTotal + serviceCharge + tax

  const availableTables = tables.filter((table) => table.status === "available")

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const orderId = await createOrder({
      customerId: customer?._id,
      customerName: customer?.name || customerName,
      customerPhone: customer?.phone || customerPhone,
      customerEmail: customer?.email || customerEmail,
      paymentMethod,
      specialInstructions: specialInstructions.trim(),
      waiterAssigned: selectedWaiter,
      waiterName: selectedWaiterName,
    });
    setBillOrderId(orderId)
    setShowBill(true)
    setBillCountdown(30)
    // Reset all customer fields after order placed
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setSpecialInstructions("");
    setSelectedWaiter("");
    setSelectedWaiterName("");
    // Start countdown for auto-redirect
    const timer = setInterval(() => {
      setBillCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowBill(false)
          router.push("/")
        }
        return prev - 1
      })
    }, 1000)
  };

  const handleWaiterAssign = (waiterId: string, waiterName: string) => {
    setSelectedWaiter(waiterId)
    setSelectedWaiterName(waiterName)
  }

  const orderTypeOptions = [
    { value: "dine-in", label: "Dine In", labelHindi: "डाइन इन", icon: Users },
    { value: "takeaway", label: "Takeaway", labelHindi: "टेकअवे", icon: MapPin },
    { value: "delivery", label: "Delivery", labelHindi: "डिलीवरी", icon: Bike },
  ]

  const paymentOptions = [
    { value: "cash", label: "Cash", labelHindi: "नकद", icon: Banknote },
    { value: "card", label: "Card", labelHindi: "कार्ड", icon: CreditCard },
    { value: "upi", label: "UPI", labelHindi: "यूपीआई", icon: Smartphone },
  ]

  const isDineIn = orderType === "dine-in"
  const isReadyToOrder = cart.length > 0 && (!isDineIn || (currentTable && customerName.trim() && selectedWaiter))
  const isMobile = useIsMobile()

  useEffect(() => {
    if (showBill && billCountdown <= 0) {
      setShowBill(false)
      router.push('/')
    }
  }, [showBill, billCountdown])

  return (
    <div className={isMobile ? "relative h-full flex flex-col" : "flex w-96 lg:w-[28rem] flex-col border-l bg-background/95 backdrop-blur-sm dark:bg-background/95"}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <h2 className="flex items-center text-base sm:text-lg font-semibold text-green-800 dark:text-green-300">
          <ShoppingCart className="mr-2 h-5 w-5" />
          {language === "hi" ? "कार्ट" : "Cart"}
        </h2>
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <AnimatedCounter value={itemCount} suffix={language === "hi" ? " आइटम" : " items"} />
        </Badge>
      </div>

      {/* Compact Order Controls Row */}
      <div className="flex items-center gap-2 border-b p-2 bg-background/80">
        {/* Order Type Segmented Control */}
        <div className="flex gap-1">
            {orderTypeOptions.map((option) => {
              const Icon = option.icon
              return (
              <Button
                key={option.value}
                variant={orderType === option.value ? "default" : "ghost"}
                size="icon"
                className={`rounded-full p-2 ${orderType === option.value ? "bg-green-100 text-green-700 border-green-500" : "border-gray-200"}`}
                title={language === "hi" ? option.labelHindi : option.label}
                onClick={() => setOrderType(option.value)}
              >
                <Icon className="h-5 w-5" />
              </Button>
              )
            })}
          </div>
        {/* Table Dropdown (only for Dine In) */}
        {orderType === "dine-in" && (
              <Select value={currentTable || ""} onValueChange={setCurrentTable}>
            <SelectTrigger className="w-32 text-xs ml-2">
              <MapPin className="h-4 w-4 mr-1 inline" />
              <SelectValue placeholder={language === "hi" ? "टेबल" : "Table"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                <SelectItem key={table._id || table.id || table.number} value={table.number} className="text-xs">
                  {table.number} - {table.capacity} {language === "hi" ? "सीटें" : "seats"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        )}
        {/* Waiter Assignment Dialog (always visible for Dine In) */}
        {orderType === "dine-in" && (
          <div className="ml-2">
            <WaiterAssignment onAssign={handleWaiterAssign} selectedWaiter={selectedWaiter} setSelectedWaiter={setSelectedWaiter} />
              {selectedWaiterName && (
              <span className="ml-1 text-xs text-green-700 font-medium">{selectedWaiterName}</span>
              )}
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className={isMobile ? "flex-1 overflow-y-auto p-2 sm:p-4 custom-scrollbar pb-40" : "flex-1 overflow-auto p-2 sm:p-4 custom-scrollbar"}>
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="font-medium text-lg mb-2">
              {language === "hi" ? "आपका कार्ट खाली है" : "Your cart is empty"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "hi" ? "शुरू करने के लिए आइटम जोड़ें" : "Add items to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex gap-3 p-3 rounded-lg border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <h3 className="font-medium line-clamp-1 text-sm">
                      {language === "hi" && item.nameHindi ? item.nameHindi : item.name}
                    </h3>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">₹{item.price} each</p>

                  {item.customizations && item.customizations.length > 0 && (
                    <div className="mt-1">
                      {item.customizations.map((customization, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs mr-1">
                          {customization}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Customer Details */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">{language === "hi" ? "ग्राहक विवरण" : "Customer Details"}</h4>
              <Input
                placeholder={language === "hi" ? "ग्राहक का नाम" : "Customer Name"}
                value={customerName || ""}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                placeholder={language === "hi" ? "फोन नंबर" : "Phone Number"}
                value={customerPhone || ""}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <Input
                placeholder={language === "hi" ? "ईमेल (वैकल्पिक)" : "Email (Optional)"}
                value={customerEmail || ""}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
              <Textarea
                placeholder={language === "hi" ? "विशेष निर्देश" : "Special Instructions"}
                value={specialInstructions || ""}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={2}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">{language === "hi" ? "भुगतान विधि" : "Payment Method"}</h4>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`payment-${option.value}`} />
                      <Label htmlFor={`payment-${option.value}`} className="flex items-center cursor-pointer">
                        <Icon className="h-4 w-4 mr-2" />
                        {language === "hi" ? option.labelHindi : option.label}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Section */}
      {cart.length > 0 && (
        <div className={isMobile ? "fixed bottom-0 left-0 w-full z-50 border-t p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950" : "border-t p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"}>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span>{language === "hi" ? "उप-योग" : "Subtotal"}</span>
              <span>₹{cartTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{language === "hi" ? "सेवा शुल्क (10%)" : "Service Charge (10%)"}</span>
              <span>₹{serviceCharge.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{language === "hi" ? "जीएसटी (18%)" : "GST (18%)"}</span>
              <span>₹{tax.toFixed(0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>{language === "hi" ? "कुल" : "Total"}</span>
              <span className="text-green-600 dark:text-green-400">
                ₹<AnimatedCounter value={Math.round(grandTotal)} />
              </span>
            </div>
          </div>
          {customer && (
            <div className="mb-2">
              <div>Loyalty Points: <span className="font-semibold">{customer.loyaltyPoints}</span></div>
              <div>Membership: <span className="font-semibold capitalize">{customer.membershipTier}</span></div>
            </div>
          )}
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3"
            size="lg"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            {language === "hi" ? "ऑर्डर करें" : "Place Order"}
          </Button>
          {orderType === "dine-in" && !currentTable && (
            <p className="text-xs text-red-500 mt-2 text-center">
              {language === "hi" ? "कृपया टेबल चुनें" : "Please select a table"}
            </p>
          )}
        </div>
      )}
      {/* Bill overlay/modal */}
      {showBill && billOrderId && (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center w-screen h-screen">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-0 flex flex-col items-center justify-center">
            <OrderConfirmationPage orderId={billOrderId} showActions countdown={billCountdown} onBack={() => { setShowBill(false); router.push("/") }} />
          </div>
        </div>
      )}
    </div>
  )
}
