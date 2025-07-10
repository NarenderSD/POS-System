"use client"

import { useState, useEffect } from "react"
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePOS } from "../context/pos-context"
import type { InventoryItem } from "../types"

export default function InventoryManagement() {
  const { language } = usePOS()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: "",
    costPerUnit: 0,
    supplier: "",
  })

  // Load sample inventory data
  useEffect(() => {
    fetch('/api/inventory').then(r => r.json()).then(setInventory)
  }, [])

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock)
  const outOfStockItems = inventory.filter(item => item.currentStock === 0)
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0)

  const handleAddItem = () => {
    if (newItem.name && newItem.category && newItem.unit) {
      const item: InventoryItem = {
        id: Date.now().toString(),
        name: newItem.name!,
        category: newItem.category!,
        currentStock: newItem.currentStock || 0,
        minStock: newItem.minStock || 0,
        maxStock: newItem.maxStock || 0,
        unit: newItem.unit!,
        costPerUnit: newItem.costPerUnit || 0,
        supplier: newItem.supplier,
        lastRestocked: new Date(),
        expiryDate: newItem.expiryDate,
      }
      setInventory([...inventory, item])
      setNewItem({
        name: "",
        category: "",
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unit: "",
        costPerUnit: 0,
        supplier: "",
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateStock = (itemId: string, newStock: number) => {
    setInventory(inventory.map(item => 
      item.id === itemId 
        ? { ...item, currentStock: newStock, lastRestocked: new Date() }
        : item
    ))
  }

  const handleDeleteItem = (itemId: string) => {
    setInventory(inventory.filter(item => item.id !== itemId))
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return "out-of-stock"
    if (item.currentStock <= item.minStock) return "low-stock"
    if (item.currentStock >= item.maxStock * 0.8) return "high-stock"
    return "normal"
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "out-of-stock": return "bg-red-100 text-red-800 border-red-300"
      case "low-stock": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "high-stock": return "bg-green-100 text-green-800 border-green-300"
      default: return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  const categories = ["grains", "dairy", "vegetables", "oils", "spices", "meat", "beverages", "packaged"]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            {language === "hi" ? "इन्वेंटरी प्रबंधन" : "Inventory Management"}
          </h2>
          <p className="text-muted-foreground">
            {language === "hi" ? "स्टॉक ट्रैकिंग और आपूर्ति प्रबंधन" : "Stock tracking and supply management"}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {language === "hi" ? "आइटम जोड़ें" : "Add Item"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === "hi" ? "नया आइटम जोड़ें" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === "hi" ? "नाम" : "Name"}</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder={language === "hi" ? "आइटम का नाम" : "Item name"}
                />
              </div>
              <div>
                <Label>{language === "hi" ? "श्रेणी" : "Category"}</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "hi" ? "श्रेणी चुनें" : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === "hi" ? "वर्तमान स्टॉक" : "Current Stock"}</Label>
                  <Input
                    type="number"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({...newItem, currentStock: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>{language === "hi" ? "इकाई" : "Unit"}</Label>
                  <Input
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    placeholder="kg, liters, pcs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === "hi" ? "न्यूनतम स्टॉक" : "Min Stock"}</Label>
                  <Input
                    type="number"
                    value={newItem.minStock}
                    onChange={(e) => setNewItem({...newItem, minStock: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>{language === "hi" ? "अधिकतम स्टॉक" : "Max Stock"}</Label>
                  <Input
                    type="number"
                    value={newItem.maxStock}
                    onChange={(e) => setNewItem({...newItem, maxStock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label>{language === "hi" ? "प्रति इकाई लागत" : "Cost Per Unit"}</Label>
                <Input
                  type="number"
                  value={newItem.costPerUnit}
                  onChange={(e) => setNewItem({...newItem, costPerUnit: Number(e.target.value)})}
                  placeholder="₹"
                />
              </div>
              <div>
                <Label>{language === "hi" ? "आपूर्तिकर्ता" : "Supplier"}</Label>
                <Input
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                  placeholder={language === "hi" ? "आपूर्तिकर्ता का नाम" : "Supplier name"}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full">
                {language === "hi" ? "जोड़ें" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "कुल आइटम" : "Total Items"}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "कम स्टॉक" : "Low Stock"}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "स्टॉक खत्म" : "Out of Stock"}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "कुल मूल्य" : "Total Value"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInventoryValue.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === "hi" ? "आइटम या आपूर्तिकर्ता खोजें..." : "Search items or suppliers..."}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={language === "hi" ? "श्रेणी" : "Category"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "hi" ? "सभी श्रेणियां" : "All Categories"}</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "hi" ? "इन्वेंटरी सूची" : "Inventory List"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "hi" ? "आइटम" : "Item"}</TableHead>
                <TableHead>{language === "hi" ? "श्रेणी" : "Category"}</TableHead>
                <TableHead>{language === "hi" ? "स्टॉक" : "Stock"}</TableHead>
                <TableHead>{language === "hi" ? "स्थिति" : "Status"}</TableHead>
                <TableHead>{language === "hi" ? "लागत" : "Cost"}</TableHead>
                <TableHead>{language === "hi" ? "आपूर्तिकर्ता" : "Supplier"}</TableHead>
                <TableHead>{language === "hi" ? "अंतिम अपडेट" : "Last Updated"}</TableHead>
                <TableHead>{language === "hi" ? "कार्य" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const status = getStockStatus(item)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{item.currentStock} {item.unit}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status === "out-of-stock" ? "bg-red-500" :
                              status === "low-stock" ? "bg-yellow-500" :
                              "bg-green-500"
                            }`}
                            style={{ width: `${(item.currentStock / item.maxStock) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStockStatusColor(status)}>
                        {status === "out-of-stock" ? (language === "hi" ? "खत्म" : "Out") :
                         status === "low-stock" ? (language === "hi" ? "कम" : "Low") :
                         status === "high-stock" ? (language === "hi" ? "अधिक" : "High") :
                         language === "hi" ? "सामान्य" : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{item.costPerUnit}/{item.unit}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      {item.lastRestocked.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "hi" ? "स्टॉक अपडेट करें" : "Update Stock"}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label>{selectedItem.name}</Label>
                <div className="text-sm text-muted-foreground">
                  {language === "hi" ? "वर्तमान स्टॉक" : "Current Stock"}: {selectedItem.currentStock} {selectedItem.unit}
                </div>
              </div>
              <div>
                <Label>{language === "hi" ? "नया स्टॉक" : "New Stock"}</Label>
                <Input
                  type="number"
                  defaultValue={selectedItem.currentStock}
                  onChange={(e) => {
                    const newStock = Number(e.target.value)
                    handleUpdateStock(selectedItem.id, newStock)
                  }}
                />
              </div>
              <Button 
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full"
              >
                {language === "hi" ? "अपडेट करें" : "Update"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 