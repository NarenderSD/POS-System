"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  Languages,
  ChefHat,
  BarChart3,
  Clock,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Table,
  Home,
  Package,
  DollarSign,
  BookOpen,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePOS } from "../context/pos-context"
import AnimatedCounter from "./animated-counter"
import { useIsMobile } from "../../hooks/use-mobile"

export default function PremiumHeader({ view, setView }) {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    orders,
    isKitchenView,
    setIsKitchenView,
    isTableView,
    setIsTableView,
    currentStaff,
    notifications,
    markNotificationRead,
    soundEnabled,
    setSoundEnabled,
    setIsAnalyticsView,
    setIsInventoryView,
    setIsStaffView,
    setIsExpenseView,
    setIsRecipeView,
    setIsLoyaltyView,
    isWaiterOrderCountView,
    setIsWaiterOrderCountView,
    setIsReportsView,
    setIsStaffProfileView,
    offline,
  } = usePOS()

  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  const pendingOrders = orders.filter((order) => order.status === "pending").length
  const preparingOrders = orders.filter((order) => order.status === "preparing").length
  const readyOrders = orders.filter((order) => order.status === "ready").length
  const unreadNotifications = notifications.filter((n) => !n.isRead).length

  const isMobile = useIsMobile()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearInterval(timer)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (language === "hi") {
      if (hour < 12) return "सुप्रभात"
      if (hour < 17) return "नमस्ते"
      return "शुभ संध्या"
    } else {
      if (hour < 12) return "Good Morning"
      if (hour < 17) return "Good Afternoon"
      return "Good Evening"
    }
  }

  return (
    <header className={isMobile ? "sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 py-1" : "sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"}>
      <div className={isMobile ? "flex flex-col gap-1" : "flex h-16 items-center justify-between px-6"}>
        <div className={isMobile ? "flex items-center justify-between w-full" : "flex items-center space-x-4"}>
          {/* POS Logo and Name */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Apna POS
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                India's Smartest POS
              </p>
            </div>
          </div>
          {/* Status and Time */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
              <Clock className="h-3 w-3" />
              <span>
                {currentTime.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {/* Settings Icon for Mobile */}
            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {getGreeting()}, {currentStaff?.name || "Admin"}!
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}{theme === "light" ? "Dark Mode" : "Light Mode"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage(language === "en" ? "hi" : "en")}><Languages className="h-4 w-4 mr-2" />{language === "en" ? "हिंदी" : "English"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}{soundEnabled ? "Disable Sound" : "Enable Sound"}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsWaiterOrderCountView(true)}><BarChart3 className="h-4 w-4 mr-2" />{language === "hi" ? "वेटर ऑर्डर काउंट" : "Waiter Order Count"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsAnalyticsView(true)}><BarChart3 className="h-4 w-4 mr-2" />{language === "hi" ? "सेल्स रिपोर्ट" : "Sales Reports"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsInventoryView(true)}><Package className="h-4 w-4 mr-2" />{language === "hi" ? "इन्वेंट्री प्रबंधन" : "Inventory Management"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsStaffView(true)}><User className="h-4 w-4 mr-2" />{language === "hi" ? "स्टाफ प्रबंधन" : "Staff Management"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsExpenseView(true)}><DollarSign className="h-4 w-4 mr-2" />{language === "hi" ? "खर्च ट्रैकर" : "Expense Tracker"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsRecipeView(true)}><BookOpen className="h-4 w-4 mr-2" />{language === "hi" ? "रेसिपी मैनेजर" : "Recipe Manager"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsLoyaltyView(true)}><Users className="h-4 w-4 mr-2" />{language === "hi" ? "ग्राहक लॉयल्टी" : "Customer Loyalty"}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsReportsView(true)}><BarChart3 className="h-4 w-4 mr-2" />{language === "hi" ? "रिपोर्ट" : "Reports"}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsStaffProfileView(true)}><User className="h-4 w-4 mr-2" />{language === "hi" ? "स्टाफ:" : "Staff:"} {currentStaff?.name || "Admin"}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {/* Order Stats and Icons (hide/collapse on mobile) */}
        {!isMobile && (
        <div className="flex items-center space-x-4">
          {/* Order Stats */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                <AnimatedCounter value={pendingOrders} />
              </div>
              <div className="text-xs text-muted-foreground">{language === "hi" ? "लंबित" : "Pending"}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                <AnimatedCounter value={preparingOrders} />
              </div>
              <div className="text-xs text-muted-foreground">{language === "hi" ? "तैयार हो रहा" : "Preparing"}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                <AnimatedCounter value={readyOrders} />
              </div>
              <div className="text-xs text-muted-foreground">{language === "hi" ? "तैयार" : "Ready"}</div>
            </div>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <h4 className="font-medium">{language === "hi" ? "सूचनाएं" : "Notifications"}</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded-lg border cursor-pointer ${
                        notification.isRead ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                      }`}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">{notification.message}</div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            notification.priority === "urgent"
                              ? "border-red-500 text-red-700"
                              : notification.priority === "high"
                                ? "border-orange-500 text-orange-700"
                                : ""
                          }`}
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {notification.createdAt.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      {language === "hi" ? "कोई सूचना नहीं" : "No notifications"}
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* View Toggle Buttons */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={!isKitchenView && !isTableView ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setIsKitchenView(false)
                setIsTableView(false)
                setIsInventoryView(false)
                setIsAnalyticsView(false)
                setIsLoyaltyView(false)
                setIsStaffView(false)
                setIsExpenseView(false)
                setIsRecipeView(false)
                setIsWaiterOrderCountView(false)
                setIsReportsView(false)
                setIsStaffProfileView(false)
              }}
              className="h-8"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
              </div>
        )}
        <div className="flex items-center gap-2">
          <span className={offline ? "bg-red-600 text-white px-2 py-1 rounded text-xs font-bold" : "bg-green-600 text-white px-2 py-1 rounded text-xs font-bold"}>
            {offline ? "Offline" : "Online"}
          </span>
        </div>
      </div>
    </header>
  )
}
