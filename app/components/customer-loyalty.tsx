"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Star, 
  Gift, 
  Crown, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Award,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  MapPin
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePOS } from "../context/pos-context"
import type { Customer } from "../types"

export default function CustomerLoyalty() {
  const { language, customers, addCustomer, updateCustomerLoyalty } = usePOS()
  const [searchQuery, setSearchQuery] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    preferences: [],
    allergies: [],
  })

  // Sample loyalty rewards
  const loyaltyRewards = [
    { tier: "bronze", points: 100, reward: "10% off on next order", discount: 10 },
    { tier: "silver", points: 250, reward: "15% off on next order", discount: 15 },
    { tier: "gold", points: 500, reward: "20% off on next order + free dessert", discount: 20 },
    { tier: "platinum", points: 1000, reward: "25% off on next order + free appetizer", discount: 25 },
  ]

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery) ||
                         customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = tierFilter === "all" || customer.membershipTier === tierFilter
    return matchesSearch && matchesTier
  })

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.totalOrders > 0).length
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
  const averageSpent = customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "bg-orange-100 text-orange-800 border-orange-300"
      case "silver": return "bg-gray-100 text-gray-800 border-gray-300"
      case "gold": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "platinum": return "bg-purple-100 text-purple-800 border-purple-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "bronze": return <Star className="h-4 w-4" />
      case "silver": return <Star className="h-4 w-4" />
      case "gold": return <Crown className="h-4 w-4" />
      case "platinum": return <Award className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      const customer: Omit<Customer, "id"> = {
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email || "",
        loyaltyPoints: 0,
        totalOrders: 0,
        totalSpent: 0,
        lastVisit: new Date(),
        preferences: newCustomer.preferences || [],
        allergies: newCustomer.allergies || [],
        address: newCustomer.address || "",
        birthday: newCustomer.birthday,
        membershipTier: "bronze",
      }
      addCustomer(customer)
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
        address: "",
        preferences: [],
        allergies: [],
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdatePoints = (customerId: string, points: number, spent: number) => {
    updateCustomerLoyalty(customerId, points, spent)
  }

  const getNextReward = (points: number) => {
    const nextReward = loyaltyRewards.find(reward => reward.points > points)
    return nextReward ? { ...nextReward, pointsNeeded: nextReward.points - points } : null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            {language === "hi" ? "ग्राहक लॉयल्टी" : "Customer Loyalty"}
          </h2>
          <p className="text-muted-foreground">
            {language === "hi" ? "ग्राहक प्रबंधन और लॉयल्टी प्रोग्राम" : "Customer management and loyalty program"}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {language === "hi" ? "ग्राहक जोड़ें" : "Add Customer"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === "hi" ? "नया ग्राहक जोड़ें" : "Add New Customer"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === "hi" ? "नाम" : "Name"}</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  placeholder={language === "hi" ? "ग्राहक का नाम" : "Customer name"}
                />
              </div>
              <div>
                <Label>{language === "hi" ? "फोन नंबर" : "Phone Number"}</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label>{language === "hi" ? "ईमेल" : "Email"}</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label>{language === "hi" ? "पता" : "Address"}</Label>
                <Textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  placeholder={language === "hi" ? "ग्राहक का पता" : "Customer address"}
                  rows={2}
                />
              </div>
              <Button onClick={handleAddCustomer} className="w-full">
                {language === "hi" ? "ग्राहक जोड़ें" : "Add Customer"}
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
              {language === "hi" ? "कुल ग्राहक" : "Total Customers"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <div className="text-xs text-muted-foreground">
              {activeCustomers} {language === "hi" ? "सक्रिय" : "active"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "कुल लॉयल्टी पॉइंट्स" : "Total Loyalty Points"}
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoyaltyPoints.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "औसत" : "Avg"}: {Math.round(totalLoyaltyPoints / totalCustomers)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "औसत खर्च" : "Average Spent"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(averageSpent)}</div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "प्रति ग्राहक" : "Per customer"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "प्रीमियम ग्राहक" : "Premium Customers"}
            </CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.membershipTier === "gold" || c.membershipTier === "platinum").length}
            </div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "गोल्ड और प्लैटिनम" : "Gold & Platinum"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "hi" ? "लॉयल्टी रिवॉर्ड्स" : "Loyalty Rewards"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loyaltyRewards.map((reward) => (
              <div key={reward.tier} className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  {getTierIcon(reward.tier)}
                </div>
                <h3 className="font-semibold capitalize">{reward.tier}</h3>
                <p className="text-sm text-muted-foreground">{reward.points} {language === "hi" ? "पॉइंट्स" : "points"}</p>
                <p className="text-xs mt-2">{reward.reward}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === "hi" ? "ग्राहक खोजें..." : "Search customers..."}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={language === "hi" ? "टियर" : "Tier"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "hi" ? "सभी टियर" : "All Tiers"}</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "hi" ? "ग्राहक सूची" : "Customer List"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "hi" ? "ग्राहक" : "Customer"}</TableHead>
                <TableHead>{language === "hi" ? "संपर्क" : "Contact"}</TableHead>
                <TableHead>{language === "hi" ? "टियर" : "Tier"}</TableHead>
                <TableHead>{language === "hi" ? "पॉइंट्स" : "Points"}</TableHead>
                <TableHead>{language === "hi" ? "कुल ऑर्डर" : "Total Orders"}</TableHead>
                <TableHead>{language === "hi" ? "कुल खर्च" : "Total Spent"}</TableHead>
                <TableHead>{language === "hi" ? "अंतिम यात्रा" : "Last Visit"}</TableHead>
                <TableHead>{language === "hi" ? "कार्य" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const nextReward = getNextReward(customer.loyaltyPoints)
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.email && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor(customer.membershipTier)}>
                        <div className="flex items-center">
                          {getTierIcon(customer.membershipTier)}
                          <span className="ml-1 capitalize">{customer.membershipTier}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.loyaltyPoints}</div>
                        {nextReward && (
                          <div className="text-xs text-muted-foreground">
                            {nextReward.pointsNeeded} {language === "hi" ? "और चाहिए" : "more needed"}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {customer.lastVisit.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Add points for demo
                            handleUpdatePoints(customer.id, customer.loyaltyPoints + 50, customer.totalSpent + 500)
                          }}
                        >
                          <Gift className="h-4 w-4" />
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

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "hi" ? "ग्राहक संपादित करें" : "Edit Customer"}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div>
                <Label>{language === "hi" ? "नाम" : "Name"}</Label>
                <Input defaultValue={selectedCustomer.name} />
              </div>
              <div>
                <Label>{language === "hi" ? "फोन" : "Phone"}</Label>
                <Input defaultValue={selectedCustomer.phone} />
              </div>
              <div>
                <Label>{language === "hi" ? "लॉयल्टी पॉइंट्स" : "Loyalty Points"}</Label>
                <Input 
                  type="number" 
                  defaultValue={selectedCustomer.loyaltyPoints}
                  onChange={(e) => {
                    const points = Number(e.target.value)
                    handleUpdatePoints(selectedCustomer.id, points, selectedCustomer.totalSpent)
                  }}
                />
              </div>
              <div>
                <Label>{language === "hi" ? "कुल खर्च" : "Total Spent"}</Label>
                <Input 
                  type="number" 
                  defaultValue={selectedCustomer.totalSpent}
                  onChange={(e) => {
                    const spent = Number(e.target.value)
                    handleUpdatePoints(selectedCustomer.id, selectedCustomer.loyaltyPoints, spent)
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