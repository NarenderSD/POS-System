"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { CartItem, Product, Order, Table, Staff, Customer, Notification } from "../types"

interface POSContextType {
  // Cart Management
  cart: CartItem[]
  addToCart: (product: Product, customizations?: string[], specialInstructions?: string) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  itemCount: number

  // Order Management
  orders: Order[]
  orderCounter: number
  createOrder: (orderData: Partial<Order>) => string
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  cancelOrder: (orderId: string, reason: string) => void

  // Table Management
  tables: Table[]
  updateTableStatus: (tableId: number, status: Table["status"]) => void
  assignTableToOrder: (tableId: number, orderId: string) => void
  cleanTable: (tableId: number) => void
  reserveTable: (tableId: number, customerName: string, time: Date) => void

  // Customer Management
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, "id">) => void
  updateCustomerLoyalty: (customerId: string, points: number, spent: number) => void

  // Staff Management
  staff: Staff[]
  setStaff: (staff: Staff[]) => void
  currentStaff?: Staff
  setCurrentStaff: (staff: Staff) => void
  assignWaiter: (orderId: string, waiterId: string) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => void
  markNotificationRead: (notificationId: string) => void
  clearAllNotifications: () => void

  // Settings
  currentTable?: string
  setCurrentTable: (tableNumber: string) => void
  orderType: "dine-in" | "takeaway" | "delivery"
  setOrderType: (type: "dine-in" | "takeaway" | "delivery") => void

  // UI State
  isKitchenView: boolean
  setIsKitchenView: (value: boolean) => void
  isTableView: boolean
  setIsTableView: (value: boolean) => void
  isInventoryView: boolean
  setIsInventoryView: (value: boolean) => void
  isAnalyticsView: boolean
  setIsAnalyticsView: (value: boolean) => void
  isLoyaltyView: boolean
  setIsLoyaltyView: (value: boolean) => void
  isStaffView: boolean
  setIsStaffView: (value: boolean) => void
  isExpenseView: boolean
  setIsExpenseView: (value: boolean) => void
  isRecipeView: boolean
  setIsRecipeView: (value: boolean) => void
  isWaiterOrderCountView: boolean
  setIsWaiterOrderCountView: (value: boolean) => void
  isReportsView: boolean
  setIsReportsView: (value: boolean) => void
  isStaffProfileView: boolean
  setIsStaffProfileView: (value: boolean) => void
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  language: "en" | "hi"
  setLanguage: (lang: "en" | "hi") => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void

  // Business Settings
  serviceChargeRate: number
  setServiceChargeRate: (rate: number) => void
  taxRate: number
  setTaxRate: (rate: number) => void
  loyaltyPointsRate: number
  setLoyaltyPointsRate: (rate: number) => void
}

const POSContext = createContext<POSContextType | undefined>(undefined)

export function POSProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [orderCounter, setOrderCounter] = useState(1001)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentTable, setCurrentTable] = useState<string>()
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">("dine-in")
  const [currentStaff, setCurrentStaff] = useState<Staff>()
  const [isKitchenView, setIsKitchenViewRaw] = useState(false)
  const [isTableView, setIsTableViewRaw] = useState(false)
  const [isInventoryView, setIsInventoryViewRaw] = useState(false)
  const [isAnalyticsView, setIsAnalyticsViewRaw] = useState(false)
  const [isLoyaltyView, setIsLoyaltyViewRaw] = useState(false)
  const [isStaffView, setIsStaffViewRaw] = useState(false)
  const [isExpenseView, setIsExpenseViewRaw] = useState(false)
  const [isRecipeView, setIsRecipeViewRaw] = useState(false)
  const [isWaiterOrderCountView, setIsWaiterOrderCountViewRaw] = useState(false)
  const [isReportsView, setIsReportsViewRaw] = useState(false)
  const [isStaffProfileView, setIsStaffProfileViewRaw] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [serviceChargeRate, setServiceChargeRate] = useState(0.1) // 10%
  const [taxRate, setTaxRate] = useState(0.18) // 18% GST
  const [loyaltyPointsRate, setLoyaltyPointsRate] = useState(0.01) // 1% of bill amount

  // Only one feature view can be active at a time
  const setFeatureView = (view: string) => {
    setIsKitchenViewRaw(view === "kitchen")
    setIsTableViewRaw(view === "table")
    setIsInventoryViewRaw(view === "inventory")
    setIsAnalyticsViewRaw(view === "analytics")
    setIsLoyaltyViewRaw(view === "loyalty")
    setIsStaffViewRaw(view === "staff")
    setIsExpenseViewRaw(view === "expense")
    setIsRecipeViewRaw(view === "recipe")
    setIsWaiterOrderCountViewRaw(view === "waiterOrderCount")
    setIsReportsViewRaw(view === "reports")
    setIsStaffProfileViewRaw(view === "staffProfile")
  }

  const setIsKitchenView = (val: boolean) => setFeatureView(val ? "kitchen" : "none")
  const setIsTableView = (val: boolean) => setFeatureView(val ? "table" : "none")
  const setIsInventoryView = (val: boolean) => setFeatureView(val ? "inventory" : "none")
  const setIsAnalyticsView = (val: boolean) => setFeatureView(val ? "analytics" : "none")
  const setIsLoyaltyView = (val: boolean) => setFeatureView(val ? "loyalty" : "none")
  const setIsStaffView = (val: boolean) => setFeatureView(val ? "staff" : "none")
  const setIsExpenseView = (val: boolean) => setFeatureView(val ? "expense" : "none")
  const setIsRecipeView = (val: boolean) => setFeatureView(val ? "recipe" : "none")
  const setIsWaiterOrderCountView = (val: boolean) => setFeatureView(val ? "waiterOrderCount" : "none")
  const setIsReportsView = (val: boolean) => setFeatureView(val ? "reports" : "none")
  const setIsStaffProfileView = (val: boolean) => setFeatureView(val ? "staffProfile" : "none")

  // Initialize tables (20 tables for a medium restaurant)
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      number: `T${(i + 1).toString().padStart(2, "0")}`,
      capacity: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
      status: "available",
      lastCleaned: new Date(),
    })),
  )

  // Initialize staff
  const [staff, setStaff] = useState<Staff[]>(() => {
    const savedStaff = typeof window !== 'undefined' ? localStorage.getItem("satvik-pos-staff") : null;
    if (savedStaff) {
      try {
        return JSON.parse(savedStaff)
      } catch {
        // fallback to default
      }
    }
    return [
    {
      id: "staff-1",
      name: "Rajesh Kumar",
      role: "manager",
      isActive: true,
      phone: "+91 98765 43210",
      shift: "morning",
      permissions: ["all"],
    },
    {
      id: "staff-2",
      name: "Priya Sharma",
      role: "cashier",
      isActive: true,
      phone: "+91 98765 43211",
      shift: "morning",
      permissions: ["orders", "payments"],
    },
    {
      id: "staff-3",
      name: "Amit Singh",
      role: "waiter",
      isActive: true,
      phone: "+91 98765 43212",
      shift: "morning",
      permissions: ["orders", "tables"],
    },
    {
      id: "staff-4",
      name: "Sunita Devi",
      role: "kitchen",
      isActive: true,
      phone: "+91 98765 43213",
      shift: "morning",
      permissions: ["kitchen"],
    },
    ]
  })

  // Persist staff to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("satvik-pos-staff", JSON.stringify(staff))
    }
  }, [staff])

  // Load data from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("satvik-pos-cart")
    const savedTables = localStorage.getItem("satvik-pos-tables")
    const savedCustomers = localStorage.getItem("satvik-pos-customers")
    const savedSettings = localStorage.getItem("satvik-pos-settings")

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart:", error)
      }
    }

    if (savedTables) {
      try {
        const parsedTables = JSON.parse(savedTables)
        setTables(
          parsedTables.map((table: any) => ({
            ...table,
            lastCleaned: table.lastCleaned ? new Date(table.lastCleaned) : new Date(),
            reservationTime: table.reservationTime ? new Date(table.reservationTime) : undefined,
          })),
        )
      } catch (error) {
        console.error("Failed to parse tables:", error)
      }
    }

    if (savedCustomers) {
      try {
        const parsedCustomers = JSON.parse(savedCustomers)
        setCustomers(
          parsedCustomers.map((customer: any) => ({
            ...customer,
            lastVisit: new Date(customer.lastVisit),
          })),
        )
      } catch (error) {
        console.error("Failed to parse customers:", error)
      }
    }

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setTheme(settings.theme || "light")
        setLanguage(settings.language || "en")
        setSoundEnabled(settings.soundEnabled !== false)
        setServiceChargeRate(settings.serviceChargeRate || 0.1)
        setTaxRate(settings.taxRate || 0.18)
        setLoyaltyPointsRate(settings.loyaltyPointsRate || 0.01)
        setOrderCounter(settings.orderCounter || 1001)
      } catch (error) {
        console.error("Failed to parse settings:", error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("satvik-pos-cart", JSON.stringify(cart))
  }, [cart])

  // Fetch orders from API
  const fetchOrders = async () => {
    const res = await fetch("/api/orders")
    if (!res.ok) throw new Error("Failed to fetch orders")
    const data = await res.json()
    // Parse createdAt and updatedAt as Date objects
    const parsed = data.map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
    }))
    setOrders(parsed)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
      // If you have a fetchTables function, call it here as well
      // fetchTables()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Remove localStorage for orders
  // useEffect(() => {
  //   localStorage.setItem("satvik-pos-orders", JSON.stringify(orders))
  // }, [orders])

  // In createOrder and updateOrderStatus, call fetchOrders after mutation
  function playNotificationSound() {
    if (typeof window !== "undefined") {
      const audio = new Audio("/notification.mp3")
      audio.play()
    }
  }

  const createOrder = async (orderData: Partial<Order>): Promise<string> => {
    const subtotal = cartTotal
    const serviceCharge = subtotal * serviceChargeRate
    const tax = (subtotal + serviceCharge) * taxRate
    const total = subtotal + serviceCharge + tax

    // Check for existing pending order for table (merge/append logic)
    let existingOrder = null
    if (orderType === "dine-in" && currentTable) {
      existingOrder = orders.find(
        (o) => o.tableNumber === currentTable && o.status !== "completed" && o.status !== "cancelled"
      )
    }

    const orderPayload: any = {
      tableNumber: currentTable,
      items: [...cart].map((item) => ({
        product: item._id, // Use MongoDB _id for product reference
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations,
        specialInstructions: item.specialInstructions,
        nameHindi: item.nameHindi,
      })),
      subtotal,
      tax,
      serviceCharge,
      total,
      status: "pending",
      paymentStatus: "pending",
      orderType,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...orderData,
      waiterAssigned: orderData.waiterAssigned || undefined,
      waiterName: orderData.waiterName || undefined,
      customerName: orderData.customerName || undefined,
      customerPhone: orderData.customerPhone || undefined,
      customerEmail: orderData.customerEmail || undefined,
    }

    let orderRes
    if (existingOrder) {
      // Merge/append items to existing order
      const mergedItems = [...existingOrder.items]
      for (const newItem of orderPayload.items) {
        const idx = mergedItems.findIndex((i: any) => i.product === newItem.product)
        if (idx > -1) {
          mergedItems[idx].quantity += newItem.quantity
        } else {
          mergedItems.push(newItem)
        }
      }
      const updatePayload = {
        ...existingOrder,
        items: mergedItems,
        subtotal: existingOrder.subtotal + subtotal,
        tax: existingOrder.tax + tax,
        serviceCharge: existingOrder.serviceCharge + serviceCharge,
        total: existingOrder.total + total,
        updatedAt: new Date(),
      }
      orderRes = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatePayload, _id: existingOrder._id }),
      })
    } else {
      orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })
    }
    if (!orderRes.ok) throw new Error("Order failed")
    const order = await orderRes.json()
    setOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)])
    await fetchOrders()

    // Update table status if dine-in
    if (orderType === "dine-in" && currentTable) {
      const tableId = Number.parseInt(currentTable.replace("T", ""))
      updateTableStatus(tableId, "occupied")
      assignTableToOrder(tableId, order._id)
    }

    // Add notification
    addNotification({
      type: "order",
      title: "New Order",
      message: `Order created for ${orderType}`,
      priority: "medium",
      orderId: order._id,
    })

    playNotificationSound()
    clearCart()
    return order._id
  }

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    const order = orders.find((o) => o._id === orderId)
    if (!order) return
    const updateRes = await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...order, status, updatedAt: new Date(), _id: orderId }),
    })
    if (!updateRes.ok) throw new Error("Order update failed")
    const updatedOrder = await updateRes.json()
    setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)))
    await fetchOrders()

    // Add notification for status changes
      addNotification({
        type: "order",
        title: "Order Status Updated",
      message: `Order #${updatedOrder._id} is now ${status}`,
        priority: status === "ready" ? "high" : "medium",
        orderId,
      })
      if (status === "ready" || status === "completed") {
        playNotificationSound()
    }
  }

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId
          ? {
              ...order,
              status: "cancelled" as Order["status"],
              updatedAt: new Date(),
              specialInstructions: `${order.specialInstructions || ""}\nCancellation Reason: ${reason}`,
            }
          : order,
      ),
    )

    // Free up table if it was dine-in
    const order = orders.find((o) => o._id === orderId)
    if (order && order.orderType === "dine-in" && order.tableNumber) {
      const tableId = Number.parseInt(order.tableNumber.replace("T", ""))
      updateTableStatus(tableId, "cleaning")
    }
  }

  const updateTableStatus = (tableId: number, status: Table["status"]) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status,
              lastCleaned: status === "available" ? new Date() : table.lastCleaned,
              currentOrder: status === "available" ? undefined : table.currentOrder,
              customerName: status === "available" ? undefined : table.customerName,
            }
          : table,
      ),
    )
  }

  const assignTableToOrder = (tableId: number, orderId: string) => {
    setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, currentOrder: orderId } : table)))
  }

  const cleanTable = (tableId: number) => {
    updateTableStatus(tableId, "available")
  }

  const reserveTable = (tableId: number, customerName: string, time: Date) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status: "reserved",
              customerName,
              reservationTime: time,
            }
          : table,
      ),
    )
  }

  const addCustomer = (customerData: Omit<Customer, "id">) => {
    const newCustomer: Customer = {
      id: `CUST-${Date.now()}`,
      ...customerData,
    }
    setCustomers((prev) => [newCustomer, ...prev])
  }

  const updateCustomerLoyalty = (customerId: string, points: number, spent: number) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              loyaltyPoints: customer.loyaltyPoints + points,
              totalSpent: customer.totalSpent + spent,
              totalOrders: customer.totalOrders + 1,
              lastVisit: new Date(),
            }
          : customer,
      ),
    )
  }

  const assignWaiter = (orderId: string, waiterId: string) => {
    setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, waiterAssigned: waiterId } : order)))
  }

  const addNotification = (notificationData: Omit<Notification, "id" | "createdAt" | "isRead">) => {
    const newNotification: Notification = {
      id: `NOTIF-${Date.now()}`,
      createdAt: new Date(),
      isRead: false,
      ...notificationData,
    }
    setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]) // Keep only last 50 notifications
  }

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0)

  const addToCart = (product: Product, customizations?: string[], specialInstructions?: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && JSON.stringify(item.customizations) === JSON.stringify(customizations),
      )
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && JSON.stringify(item.customizations) === JSON.stringify(customizations)
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          customizations,
          specialInstructions,
        },
      ]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <POSContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        orders,
        orderCounter,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        tables,
        updateTableStatus,
        assignTableToOrder,
        cleanTable,
        reserveTable,
        customers,
        addCustomer,
        updateCustomerLoyalty,
        staff,
        setStaff,
        currentStaff,
        setCurrentStaff,
        assignWaiter,
        notifications,
        addNotification,
        markNotificationRead,
        clearAllNotifications,
        currentTable,
        setCurrentTable,
        orderType,
        setOrderType,
        isKitchenView,
        setIsKitchenView,
        isTableView,
        setIsTableView,
        isInventoryView,
        setIsInventoryView,
        isAnalyticsView,
        setIsAnalyticsView,
        isLoyaltyView,
        setIsLoyaltyView,
        isStaffView,
        setIsStaffView,
        isExpenseView,
        setIsExpenseView,
        isRecipeView,
        setIsRecipeView,
        isWaiterOrderCountView,
        setIsWaiterOrderCountView,
        isReportsView,
        setIsReportsView,
        isStaffProfileView,
        setIsStaffProfileView,
        theme,
        setTheme,
        language,
        setLanguage,
        soundEnabled,
        setSoundEnabled,
        serviceChargeRate,
        setServiceChargeRate,
        taxRate,
        setTaxRate,
        loyaltyPointsRate,
        setLoyaltyPointsRate,
      }}
    >
      {children}
    </POSContext.Provider>
  )
}

export function usePOS() {
  const context = useContext(POSContext)
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider")
  }
  return context
}
