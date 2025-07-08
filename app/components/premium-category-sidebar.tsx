"use client"

import { Coffee, Utensils, Wheat, IceCream, ChefHat, LayoutGrid, Leaf, Pizza, Sandwich, Soup } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { usePOS } from "../context/pos-context"
import { useEffect, useState } from "react"

interface CategorySidebarProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function PremiumCategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  const { language } = usePOS()
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((products) => {
        setProducts(products)
        const unique = Array.from(new Set(products.map((p: any) => p.category)))
        setCategories([
          { id: "all", name: "All Items", nameHindi: "सभी आइटम" },
          ...unique.map((cat: string) => ({ id: cat, name: cat, nameHindi: cat }))
        ])
      })
  }, [])

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return products.length
    return products.filter((p: any) => p.category === categoryId).length
  }

  const totalAvailable = products.filter((p: any) => p.available !== false).length

  return (
    <div className="w-48 border-r bg-background/50 backdrop-blur-sm p-4 space-y-3 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-green-600" />
          {language === "hi" ? "श्रेणियां" : "Categories"}
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
        <p className="text-xs text-muted-foreground mt-2">
          {language === "hi" ? "100% शुद्ध शाकाहारी" : "100% Pure Vegetarian"}
        </p>
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const Icon = LayoutGrid // Default icon, can be made dynamic
          const count = getCategoryCount(category.id)
          const isSelected = selectedCategory === category.id

          return (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto p-3 transition-all duration-300 hover:scale-105",
                isSelected
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg dark:from-green-950 dark:to-emerald-950 dark:border-green-700"
                  : "hover:bg-muted/50",
              )}
              onClick={() => onSelectCategory(category.id)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div
                  className={cn(
                    "p-2 rounded-lg text-white transition-transform duration-300",
                    "bg-gradient-to-br from-purple-500 to-pink-500", // Default color
                    isSelected && "scale-110",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div
                    className={cn(
                      "font-medium transition-colors duration-300 text-sm",
                      isSelected ? "text-green-700 dark:text-green-300" : "text-foreground",
                    )}
                  >
                    {language === "hi" ? category.nameHindi : category.name}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs transition-colors duration-300",
                        isSelected && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                      )}
                    >
                      {count} {language === "hi" ? "आइटम" : "items"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
        <h3 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center">
          <Leaf className="h-4 w-4 mr-2" />
          {language === "hi" ? "आज का सारांश" : "Today's Summary"}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">{language === "hi" ? "कुल आइटम:" : "Total Items:"}</span>
            <span className="font-medium">{products.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">{language === "hi" ? "उपलब्ध:" : "Available:"}</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {totalAvailable}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">Pure Veg:</span>
            <span className="font-medium text-green-600 dark:text-green-400">100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
