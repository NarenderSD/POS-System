"use client"

import { useState, useEffect } from "react"
import { 
  DollarSign, 
  TrendingDown, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
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
import { Chart } from "@/components/ui/chart"

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: Date
  description?: string
  paymentMethod: string
  status: "paid" | "pending" | "overdue"
  vendor?: string
  receipt?: string
}

interface Budget {
  category: string
  amount: number
  spent: number
  remaining: number
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    title: "",
    amount: 0,
    category: "",
    paymentMethod: "cash",
    status: "paid",
  })

  const categories = [
    "ingredients", "utilities", "rent", "salary", "equipment", 
    "marketing", "maintenance", "insurance", "licenses", "other"
  ]

  const paymentMethods = ["cash", "card", "bank_transfer", "upi", "cheque"]

  // Initialize sample data
  useEffect(() => {
    const sampleExpenses: Expense[] = [
      {
        id: "1",
        title: "Vegetables Purchase",
        amount: 5000,
        category: "ingredients",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: "Fresh vegetables for the week",
        paymentMethod: "cash",
        status: "paid",
        vendor: "Local Market",
      },
      {
        id: "2",
        title: "Electricity Bill",
        amount: 8000,
        category: "utilities",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: "Monthly electricity bill",
        paymentMethod: "bank_transfer",
        status: "paid",
        vendor: "State Electricity Board",
      },
      {
        id: "3",
        title: "Kitchen Equipment Repair",
        amount: 15000,
        category: "maintenance",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        description: "Oven and refrigerator repair",
        paymentMethod: "card",
        status: "pending",
        vendor: "Tech Solutions",
      },
      {
        id: "4",
        title: "Staff Salary - March",
        amount: 45000,
        category: "salary",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        description: "Monthly salary for all staff",
        paymentMethod: "bank_transfer",
        status: "paid",
        vendor: "Staff Payments",
      },
      {
        id: "5",
        title: "Restaurant License Renewal",
        amount: 12000,
        category: "licenses",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        description: "Annual license renewal",
        paymentMethod: "upi",
        status: "overdue",
        vendor: "Municipal Corporation",
      },
    ]

    const sampleBudgets: Budget[] = [
      { category: "ingredients", amount: 50000, spent: 25000, remaining: 25000 },
      { category: "utilities", amount: 15000, spent: 12000, remaining: 3000 },
      { category: "salary", amount: 100000, spent: 45000, remaining: 55000 },
      { category: "maintenance", amount: 20000, spent: 15000, remaining: 5000 },
      { category: "marketing", amount: 10000, spent: 5000, remaining: 5000 },
    ]

    setExpenses(sampleExpenses)
    setBudgets(sampleBudgets)
  }, [])

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const paidExpenses = expenses.filter(exp => exp.status === "paid").reduce((sum, exp) => sum + exp.amount, 0)
  const pendingExpenses = expenses.filter(exp => exp.status === "pending").reduce((sum, exp) => sum + exp.amount, 0)
  const overdueExpenses = expenses.filter(exp => exp.status === "overdue").reduce((sum, exp) => sum + exp.amount, 0)

  const handleAddExpense = () => {
    if (newExpense.title && newExpense.amount && newExpense.category) {
      const expense: Expense = {
        id: Date.now().toString(),
        title: newExpense.title,
        amount: newExpense.amount,
        category: newExpense.category,
        date: new Date(),
        description: newExpense.description,
        paymentMethod: newExpense.paymentMethod || "cash",
        status: newExpense.status || "paid",
        vendor: newExpense.vendor,
      }
      setExpenses([...expenses, expense])
      setNewExpense({
        title: "",
        amount: 0,
        category: "",
        paymentMethod: "cash",
        status: "paid",
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id))
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      ingredients: "bg-green-100 text-green-800 border-green-300",
      utilities: "bg-blue-100 text-blue-800 border-blue-300",
      rent: "bg-purple-100 text-purple-800 border-purple-300",
      salary: "bg-orange-100 text-orange-800 border-orange-300",
      equipment: "bg-gray-100 text-gray-800 border-gray-300",
      marketing: "bg-pink-100 text-pink-800 border-pink-300",
      maintenance: "bg-yellow-100 text-yellow-800 border-yellow-300",
      insurance: "bg-indigo-100 text-indigo-800 border-indigo-300",
      licenses: "bg-red-100 text-red-800 border-red-300",
      other: "bg-gray-100 text-gray-800 border-gray-300",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Chart data for expense breakdown
  const expenseChartData = {
    labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        label: "Expenses by Category",
        data: categories.map(cat => 
          expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0)
        ),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(107, 114, 128, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Title,Category,Amount,Status,Payment Method\n" +
      expenses.map(exp => 
        `${exp.date.toLocaleDateString()},${exp.title},${exp.category},${exp.amount},${exp.status},${exp.paymentMethod}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "expenses-report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Expense Tracker
          </h2>
          <p className="text-muted-foreground">
            Track and manage restaurant expenses and budgets
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                    placeholder="Expense title"
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                    placeholder="₹"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                <div>
                  <Label>Payment Method</Label>
                  <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({...newExpense, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>
                          {method.replace("_", " ").charAt(0).toUpperCase() + method.replace("_", " ").slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Input
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder="Expense description"
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidExpenses.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {totalExpenses > 0 ? Math.round((paidExpenses / totalExpenses) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{pendingExpenses.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Awaiting payment</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{overdueExpenses.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Past due date</div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.amount) * 100
              const isOverBudget = budget.spent > budget.amount
              return (
                <div key={budget.category} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold capitalize">{budget.category}</h3>
                    <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget:</span>
                      <span>₹{budget.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spent:</span>
                      <span>₹{budget.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Remaining:</span>
                      <span className={isOverBudget ? "text-red-600" : "text-green-600"}>
                        ₹{budget.remaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isOverBudget ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expense Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart type="pie" data={expenseChartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {expense.date.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(expense.category)}>
                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(expense.status)}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {expense.paymentMethod.replace("_", " ").charAt(0).toUpperCase() + 
                     expense.paymentMethod.replace("_", " ").slice(1)}
                  </TableCell>
                  <TableCell>{expense.vendor || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedExpense(expense)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input defaultValue={selectedExpense.title} />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" defaultValue={selectedExpense.amount} />
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue={selectedExpense.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full"
              >
                Update
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 