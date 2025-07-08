"use client"

import { useState } from "react"
import PremiumHeader from "./components/premium-header"
import PremiumCategorySidebar from "./components/premium-category-sidebar"
import PremiumProductGrid from "./components/premium-product-grid"
import PremiumCartSidebar from "./components/premium-cart-sidebar"
import EnhancedTableManagement from "./components/enhanced-table-management"
import KitchenDisplay from "./components/kitchen-display"
import { Button } from "@/components/ui/button"
import { Home, Table, ChefHat, Package, Users, BarChart3, DollarSign, BookOpen, Plus } from "lucide-react"
import Link from "next/link"
import InventoryManagement from "./components/inventory-management"
import StaffManagement from "./components/staff-management"
import Reports from "./components/reports"
import ExpenseTracker from "./components/expense-tracker"
import RecipeManager from "./components/recipe-manager"
import CustomerLoyalty from "./components/customer-loyalty"
import AdminProducts from "./admin/products/page"
import WaiterOrderCount from "./components/waiter-order-count"
import SalesAnalytics from "./components/sales-analytics"
import StaffProfile from "./components/staff-profile"

export default function PremiumPOSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [view, setView] = useState("home") // "home" | "table" | "kitchen" | "inventory" | "staff" | "reports" | "expense" | "recipe" | "loyalty" | "productAdd" | "waiterOrderCount" | "salesAnalytics" | "staffProfile"

  let mainContent = (
    <div className="flex-1 overflow-auto">
      <PremiumProductGrid category={selectedCategory} searchQuery={searchQuery} />
      </div>
    )
  if (view === "table") mainContent = <EnhancedTableManagement />
  else if (view === "kitchen") mainContent = <KitchenDisplay />
  else if (view === "inventory") mainContent = <InventoryManagement />
  else if (view === "staff") mainContent = <StaffManagement />
  else if (view === "reports") mainContent = <Reports />
  else if (view === "expense") mainContent = <ExpenseTracker />
  else if (view === "recipe") mainContent = <RecipeManager />
  else if (view === "loyalty") mainContent = <CustomerLoyalty />
  else if (view === "productAdd") mainContent = <AdminProducts />
  else if (view === "waiterOrderCount") mainContent = <WaiterOrderCount />
  else if (view === "salesAnalytics") mainContent = <SalesAnalytics />
  else if (view === "staffProfile") mainContent = <StaffProfile />

  return (
    <div className="flex h-screen bg-background">
      {/* Category Sidebar only on Home */}
      {view === "home" && <PremiumCategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />}
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* PremiumHeader (untouched) */}
        <PremiumHeader />
        {/* Navigation Icons Row (below header, right-aligned) */}
        <div className="flex justify-end items-center gap-2 p-2 border-b bg-background/95">
          <Button variant={view === "home" ? "default" : "ghost"} size="icon" onClick={() => setView("home")} title="Home">
            <Home className="h-5 w-5" />
          </Button>
          <Button variant={view === "table" ? "default" : "ghost"} size="icon" onClick={() => setView("table")} title="Table Management">
            <Table className="h-5 w-5" />
          </Button>
          <Button variant={view === "kitchen" ? "default" : "ghost"} size="icon" onClick={() => setView("kitchen")} title="Kitchen">
            <ChefHat className="h-5 w-5" />
          </Button>
          <Button variant={view === "inventory" ? "default" : "ghost"} size="icon" onClick={() => setView("inventory")} title="Inventory">
            <Package className="h-5 w-5" />
          </Button>
          <Button variant={view === "productAdd" ? "default" : "ghost"} size="icon" onClick={() => setView("productAdd")} title="Add Product">
            <Plus className="h-5 w-5" />
          </Button>
          <Button variant={view === "staff" ? "default" : "ghost"} size="icon" onClick={() => setView("staff")} title="Staff">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant={view === "reports" ? "default" : "ghost"} size="icon" onClick={() => setView("reports")} title="Reports">
            <BarChart3 className="h-5 w-5" />
          </Button>
          <Button variant={view === "expense" ? "default" : "ghost"} size="icon" onClick={() => setView("expense")} title="Expense Tracker">
            <DollarSign className="h-5 w-5" />
          </Button>
          <Button variant={view === "recipe" ? "default" : "ghost"} size="icon" onClick={() => setView("recipe")} title="Recipe Manager">
            <BookOpen className="h-5 w-5" />
          </Button>
          <Button variant={view === "loyalty" ? "default" : "ghost"} size="icon" onClick={() => setView("loyalty")} title="Customer Loyalty">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant={view === "waiterOrderCount" ? "default" : "ghost"} size="icon" onClick={() => setView("waiterOrderCount")} title="Waiter Order Counter">
            <BarChart3 className="h-5 w-5" />
          </Button>
          <Button variant={view === "salesAnalytics" ? "default" : "ghost"} size="icon" onClick={() => setView("salesAnalytics")} title="Sales Analytics">
            <BarChart3 className="h-5 w-5" />
          </Button>
          <Button variant={view === "staffProfile" ? "default" : "ghost"} size="icon" onClick={() => setView("staffProfile")} title="Staff Profile">
            <Users className="h-5 w-5" />
              </Button>
            </div>
        {/* Main Content Area (full width below header and icon row) */}
        {view === "home" ? (
          <div className="flex-1 flex flex-col">
            {mainContent}
              </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-auto">
            {mainContent}
          </div>
        )}
        </div>
      {view === "home" && <PremiumCartSidebar />}
    </div>
  )
}
