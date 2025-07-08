export interface Product {
  id: number
  name: string
  nameHindi?: string
  price: number
  image: string
  category: string
  description?: string
  isVeg: boolean
  spiceLevel?: "mild" | "medium" | "hot"
  preparationTime?: number
  available: boolean
  tags?: string[]
  ingredients?: string[]
  calories?: number
  allergens?: string[]
  nutritionInfo?: {
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
}

export interface CartItem extends Product {
  quantity: number
  customizations?: string[]
  specialInstructions?: string
  addedAt: Date
}

export interface Table {
  id: number
  number: string
  capacity: number
  status: "available" | "occupied" | "reserved" | "cleaning" | "out-of-order"
  currentOrder?: string
  waiterAssigned?: string
  lastCleaned?: Date
  reservationTime?: Date
  customerName?: string
  customerPhone?: string
  location: "indoor" | "outdoor" | "private"
  features?: string[]
}

export interface Order {
  _id?: string // MongoDB
  id?: string // Legacy/local
  orderNumber: number
  tableNumber?: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  serviceCharge: number
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled"
  paymentMethod?: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  orderType: "dine-in" | "takeaway" | "delivery"
  createdAt: Date | string
  updatedAt: Date | string
  estimatedTime?: number
  actualTime?: number
  waiterAssigned?: string
  waiterName?: string
  specialInstructions?: string
  discountReason?: string
  loyaltyPointsEarned?: number
  loyaltyPointsUsed?: number
  rating?: number
  feedback?: string
}

export interface Staff {
  id: string
  name: string
  role: "admin" | "manager" | "cashier" | "kitchen" | "waiter" | "cleaner"
  isActive: boolean
  phone?: string
  email?: string
  shift: "morning" | "evening" | "night" | "full-day"
  permissions: string[]
  avatar?: string
  joiningDate: Date
  salary?: number
  performance?: {
    ordersServed: number
    rating: number
    tips: number
  }
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  loyaltyPoints: number
  totalOrders: number
  totalSpent: number
  lastVisit: Date
  preferences?: string[]
  allergies?: string[]
  favoriteItems?: number[]
  address?: string
  birthday?: Date
  membershipTier: "bronze" | "silver" | "gold" | "platinum"
}

export interface Notification {
  id: string
  type: "order" | "payment" | "kitchen" | "table" | "system" | "staff"
  title: string
  message: string
  priority: "low" | "medium" | "high" | "urgent"
  isRead: boolean
  createdAt: Date
  orderId?: string
  tableId?: number
  staffId?: string
  actionRequired?: boolean
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  costPerUnit: number
  supplier?: string
  lastRestocked: Date
  expiryDate?: Date
}

export interface SalesReport {
  date: Date
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topSellingItems: { productId: number; quantity: number; revenue: number }[]
  hourlyBreakdown: { hour: number; sales: number; orders: number }[]
  paymentMethodBreakdown: { method: string; amount: number; count: number }[]
}
