"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { CartItem, Product, Order, Table, Staff, Customer, Notification } from "../types"
import { toast } from "@/components/ui/use-toast"

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
  finalizeBillForTable: (tableId: string) => void

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
  offline: boolean
  setOffline: (offline: boolean) => void
  pendingOrders: Order[]
  setPendingOrders: (orders: Order[]) => void
  addTable: (data: Omit<Table, "id">) => void
  updateTable: (id: string, data: Partial<Table>) => void
  deleteTable: (id: string) => void
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
  const [offline, setOffline] = useState(false)
  const [pendingOrders, setPendingOrders] = useState([])
  const [tables, setTables] = useState<Table[]>([])
  const [staff, setStaff] = useState<Staff[]>([])

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

  // Fetch all data from API on mount
  useEffect(() => {
    fetch('/api/tables').then(r => r.json()).then(setTables)
    fetch('/api/staff').then(r => r.json()).then(setStaff)
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
    fetch('/api/orders').then(r => r.json()).then(setOrders)
  }, [])

  // On mount, load pendingOrders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pendingOrders')
    if (saved) setPendingOrders(JSON.parse(saved))
  }, [])

  // Try to sync pending orders when online
  useEffect(() => {
    if (!offline && pendingOrders.length > 0) {
      (async () => {
        for (const order of pendingOrders) {
          try {
            await fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) })
          } catch {}
        }
        setPendingOrders([])
        localStorage.removeItem('pendingOrders')
        toast({ title: 'Orders synced', description: 'Offline orders have been uploaded.' })
      })()
    }
  }, [offline, pendingOrders])

  // Detect offline/online
  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Persist currentStaff/waiter in localStorage
  useEffect(() => {
    const savedStaff = localStorage.getItem('currentStaff')
    if (savedStaff) setCurrentStaff(JSON.parse(savedStaff))
  }, [])
  useEffect(() => {
    if (currentStaff) localStorage.setItem('currentStaff', JSON.stringify(currentStaff))
  }, [currentStaff])

  // In POSProvider, add logic to initialize and increment orderCounter from localStorage
  useEffect(() => {
    const savedOrderCounter = localStorage.getItem('orderCounter')
    if (savedOrderCounter) setOrderCounter(Number(savedOrderCounter))
  }, [])

  // CRUD operations for tables
  const addTable = async (data: Omit<Table, "id">) => {
    // Always create a truly blank table
    const blankData = {
      ...data,
      customerName: undefined,
      customerPhone: undefined,
      reservationTime: undefined,
      waiterAssigned: undefined,
      currentOrder: undefined,
      status: "available",
    }
    const res = await fetch('/api/tables', { method: 'POST', body: JSON.stringify(blankData) })
    const table = await res.json()
    // Force refresh from backend to avoid any stale or duplicate state
    const freshRes = await fetch('/api/tables')
    const freshTables = await freshRes.json()
    setTables(freshTables)
  }
  const updateTable = async (id: string, data: Partial<Table>) => {
    const res = await fetch('/api/tables', { method: 'PUT', body: JSON.stringify({ _id: id, ...data }) })
    if (!res.ok) throw new Error('Table update failed')
    const updated = await res.json()
    setTables(tables => tables.map(t => t._id === id ? updated : t))
    return updated
  }
  const deleteTable = async (id: string) => {
    await fetch('/api/tables', { method: 'DELETE', body: JSON.stringify({ id }) })
    setTables(tables => tables.filter(t => t._id !== id))
  }

  // CRUD operations for staff
  const addStaff = async (data: Omit<Staff, "id">) => {
    const res = await fetch('/api/staff', { method: 'POST', body: JSON.stringify(data) })
    const newStaff = await res.json()
    setStaff(staff => [...staff, newStaff])
  }
  const updateStaff = async (id: string, data: Partial<Staff>) => {
    const res = await fetch('/api/staff', { method: 'PUT', body: JSON.stringify({ _id: id, ...data }) })
    const updated = await res.json()
    setStaff(staff => staff.map(s => s._id === id ? updated : s))
  }
  const deleteStaff = async (id: string) => {
    await fetch('/api/staff', { method: 'DELETE', body: JSON.stringify({ id }) })
    setStaff(staff => staff.filter(s => s._id !== id))
  }

  // CRUD operations for customers
  const addCustomer = async (data: Omit<Customer, "id">) => {
    const res = await fetch('/api/customers', { method: 'POST', body: JSON.stringify(data) })
    const newCustomer = await res.json()
    setCustomers(customers => [...customers, newCustomer])
  }
  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    const res = await fetch('/api/customers', { method: 'PUT', body: JSON.stringify({ _id: id, ...data }) })
    const updated = await res.json()
    setCustomers(customers => customers.map(c => c._id === id ? updated : c))
  }
  const deleteCustomer = async (id: string) => {
    await fetch('/api/customers', { method: 'DELETE', body: JSON.stringify({ id }) })
    setCustomers(customers => customers.filter(c => c._id !== id))
  }

  // CRUD operations for orders
  const addOrder = async (orderData: Partial<Order>) => {
    if (offline) {
      setPendingOrders(prev => {
        const updated = [...prev, orderData]
        localStorage.setItem('pendingOrders', JSON.stringify(updated))
        toast({ title: 'Offline Mode', description: 'Order saved locally. Will sync when online.' })
        return updated
      })
      return 'offline-local-order'
    }
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

    // Generate sequential order number
    const nextOrderNumber = orderCounter
    setOrderCounter(nextOrderNumber + 1)
    localStorage.setItem('orderCounter', (nextOrderNumber + 1).toString())

    // Before assigning new order, blank the table's customer/order info
    if (orderType === "dine-in" && currentTable) {
      const table = tables.find(t => t.number === currentTable)
      if (table) {
        await updateTable(table._id, {
          customerName: orderData.customerName || undefined,
          customerPhone: orderData.customerPhone || undefined,
          reservationTime: undefined,
          waiterAssigned: orderData.waiterAssigned || currentStaff?._id || undefined,
          currentOrder: undefined,
          status: "occupied",
        })
      }
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
      orderNumber: nextOrderNumber,
      ...orderData,
      waiterAssigned: orderData.waiterAssigned || currentStaff?._id || undefined,
      waiterName: orderData.waiterName || currentStaff?.name || undefined,
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
    return order._id
  }

  const updateOrderStatus = async (orderId: string, update: Partial<Order>) => {
    const order = orders.find((o) => o._id === orderId)
    if (!order) throw new Error('Order not found')
    const updatePayload = {
      ...order,
      ...update,
      updatedAt: new Date(),
      _id: orderId,
    }
    const updateRes = await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    })
    if (!updateRes.ok) throw new Error("Order update failed")
    const updatedOrder = await updateRes.json()
    setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)))
    return updatedOrder
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
  }

  // Table management: always use real-time data
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
              reservationTime: status === "available" ? undefined : table.reservationTime,
              waiterAssigned: status === "available" ? undefined : table.waiterAssigned,
            }
          : table,
      ),
    )
  }

  // When an order is created or updated, set the table status to 'occupied' if it has an active order, otherwise 'available'
  const assignTableToOrder = (tableId: number, orderId: string) => {
    setTables((prev) => prev.map((table) =>
      table.id === tableId
        ? {
            ...table,
            currentOrder: orderId,
            status: "occupied",
          }
        : table
    ))
  }

  const cleanTable = (tableId: number) => {
    updateTableStatus(tableId, "available")
  }

  // Fix reserveTable so it only sets the selected table to reserved, not all tables
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

  // Add finalizeBillForTable: sets order to completed/paid, clears table, archives order
  const finalizeBillForTable = async (tableId: string) => {
    const table = tables.find(t => t._id === tableId)
    if (!table) {
      toast({ title: 'Error', description: 'Table not found.' })
      return
    }
    let order = table.currentOrder ? orders.find(o => o._id === table.currentOrder) : null
    // Always mark order as completed/paid, regardless of current status
    if (order) {
      try {
        setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: 'completed', paymentStatus: 'paid' } : o))
        const res = await updateOrderStatus(order._id, { status: 'completed', paymentStatus: 'paid' })
        console.log('Order status completed+paid response:', res)
      } catch (err) {
        console.error('Order update error:', err)
        toast({ title: 'Order Update Error', description: String(err) })
        if (typeof window !== 'undefined') window.location.reload()
        return
      }
    }
    // Fallback: If any order for this table is in 'ready', forcibly blank the table
    const stuckReadyOrder = orders.find(o => o.tableNumber === table.number && o.status === 'ready')
    if (stuckReadyOrder) {
      try {
        await updateOrderStatus(stuckReadyOrder._id, { status: 'completed', paymentStatus: 'paid' })
      } catch {}
    }
    // Always blank the table in state
    setTables(prev => prev.map(t => (t._id === tableId) ? {
      ...t,
      status: 'available',
      currentOrder: null,
      customerName: undefined,
      customerPhone: undefined,
      reservationTime: undefined,
      waiterAssigned: undefined,
    } : t))
    try {
      const updateRes = await updateTable(table._id, {
        status: "available",
        currentOrder: null,
        customerName: undefined,
        customerPhone: undefined,
        reservationTime: undefined,
        waiterAssigned: undefined,
      })
      console.log('Table update response:', updateRes)
      // Force fetch the updated table and orders from backend
      const res = await fetch(`/api/tables`)
      const freshTables = await res.json()
      setTables(freshTables)
      const ordersRes = await fetch('/api/orders')
      const freshOrders = await ordersRes.json()
      setOrders(freshOrders)
      toast({ title: 'Table Cleared', description: 'Table is now available for new customer.' })
    } catch (err) {
      console.error('Table update error:', err)
      toast({ title: 'Table Update Error', description: String(err) })
      if (typeof window !== 'undefined') window.location.reload()
      return
    }
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
    <POSContext.Provider value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        orders,
        orderCounter,
      createOrder: addOrder,
        updateOrderStatus,
        cancelOrder,
        tables,
        updateTableStatus,
        assignTableToOrder,
        cleanTable,
        reserveTable,
        finalizeBillForTable,
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
      offline,
      setOffline,
      pendingOrders,
      setPendingOrders,
      addTable,
      updateTable,
      deleteTable,
    }}>
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
