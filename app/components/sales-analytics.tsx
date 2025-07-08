"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePOS } from "../context/pos-context"
import { Chart } from "@/components/ui/chart"
import type { SalesReport } from "../types"

export default function SalesAnalytics() {
  const { orders, language } = usePOS()
  const [timeRange, setTimeRange] = useState("7d")

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    const now = new Date()
    let days = 7
    if (timeRange === "30d") days = 30
    if (timeRange === "90d") days = 90
    return orders.filter(order => {
      const created = new Date(order.createdAt)
      return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) < days
    })
  }, [orders, timeRange])

  // Aggregate sales data by day
  const salesData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const data: any[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - i)
      const dayOrders = filteredOrders.filter(order => {
        const d = new Date(order.createdAt)
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
      })
      const totalSales = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      const totalOrders = dayOrders.length
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
      // Top selling items
      const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {}
      dayOrders.forEach(order => {
        order.items.forEach(item => {
          if (!itemMap[item.product || item.name]) {
            itemMap[item.product || item.name] = { name: item.name, quantity: 0, revenue: 0 }
          }
          itemMap[item.product || item.name].quantity += item.quantity
          itemMap[item.product || item.name].revenue += item.price * item.quantity
        })
      })
      const topSellingItems = Object.entries(itemMap)
        .map(([productId, v]) => ({ productId, ...v }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3)
      // Hourly breakdown
      const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
        const hourOrders = dayOrders.filter(order => new Date(order.createdAt).getHours() === hour)
        return {
          hour,
          sales: hourOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          orders: hourOrders.length,
        }
      })
      // Payment method breakdown
      const paymentMap: Record<string, { amount: number; count: number }> = {}
      dayOrders.forEach(order => {
        const method = order.paymentMethod || "cash"
        if (!paymentMap[method]) paymentMap[method] = { amount: 0, count: 0 }
        paymentMap[method].amount += order.total || 0
        paymentMap[method].count += 1
      })
      const paymentMethodBreakdown = Object.entries(paymentMap).map(([method, v]) => ({ method, ...v }))
      data.push({
        date,
        totalSales,
        totalOrders,
        averageOrderValue: avgOrderValue,
        topSellingItems,
        hourlyBreakdown,
        paymentMethodBreakdown,
      })
    }
    return data
  }, [filteredOrders, timeRange])

  // Calculate summary statistics
  const totalSales = salesData.reduce((sum, day) => sum + day.totalSales, 0)
  const totalOrders = salesData.reduce((sum, day) => sum + day.totalOrders, 0)
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
  const previousPeriodSales = salesData.slice(0, Math.floor(salesData.length / 2)).reduce((sum, day) => sum + day.totalSales, 0)
  const currentPeriodSales = salesData.slice(Math.floor(salesData.length / 2)).reduce((sum, day) => sum + day.totalSales, 0)
  const growthRate = previousPeriodSales > 0 ? ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100 : 0

  // Chart data
  const chartData = {
    labels: salesData.map(day => day.date.toLocaleDateString()),
    datasets: [
      {
        label: language === "hi" ? "दैनिक बिक्री" : "Daily Sales",
        data: salesData.map(day => day.totalSales),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: language === "hi" ? "ऑर्डर की संख्या" : "Number of Orders",
        data: salesData.map(day => day.totalOrders),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: language === "hi" ? "बिक्री (₹)" : "Sales (₹)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: language === "hi" ? "ऑर्डर की संख्या" : "Number of Orders",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const pieChartData = {
    labels: salesData[0]?.paymentMethodBreakdown.map(p => p.method.toUpperCase()) || [],
    datasets: [
      {
        data: salesData[0]?.paymentMethodBreakdown.map(p => p.amount) || [],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
      },
    ],
  }

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Date,Total Sales,Total Orders,Average Order Value\n" +
      salesData.map(day =>
        `${day.date.toLocaleDateString()},${day.totalSales},${day.totalOrders},${day.averageOrderValue}`
      ).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sales-report-${timeRange}.csv`)
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
            {language === "hi" ? "बिक्री विश्लेषण" : "Sales Analytics"}
          </h2>
          <p className="text-muted-foreground">
            {language === "hi" ? "बिक्री प्रदर्शन और रुझान विश्लेषण" : "Sales performance and trend analysis"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{language === "hi" ? "7 दिन" : "7 Days"}</SelectItem>
              <SelectItem value="30d">{language === "hi" ? "30 दिन" : "30 Days"}</SelectItem>
              <SelectItem value="90d">{language === "hi" ? "90 दिन" : "90 Days"}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            {language === "hi" ? "एक्सपोर्ट" : "Export"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "कुल बिक्री" : "Total Sales"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {growthRate > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(growthRate).toFixed(1)}% {language === "hi" ? "पिछले अवधि से" : "vs last period"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "कुल ऑर्डर" : "Total Orders"}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "औसत दैनिक" : "Avg daily"}: {Math.round(totalOrders / salesData.length)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "औसत ऑर्डर मूल्य" : "Average Order Value"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(averageOrderValue)}</div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "प्रति ग्राहक" : "Per customer"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "सर्वश्रेष्ठ दिन" : "Best Day"}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData.length > 0 ? 
                salesData.reduce((max, day) => day.totalSales > max.totalSales ? day : max).date.toLocaleDateString() 
                : "-"
              }
            </div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "सबसे अधिक बिक्री" : "Highest sales"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{language === "hi" ? "बिक्री रुझान" : "Sales Trend"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart data={chartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === "hi" ? "भुगतान विधि" : "Payment Methods"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart type="pie" data={pieChartData} options={pieChartOptions} />
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "hi" ? "सर्वश्रेष्ठ बिकने वाले आइटम" : "Top Selling Items"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "hi" ? "रैंक" : "Rank"}</TableHead>
                <TableHead>{language === "hi" ? "आइटम" : "Item"}</TableHead>
                <TableHead>{language === "hi" ? "बिक्री की संख्या" : "Units Sold"}</TableHead>
                <TableHead>{language === "hi" ? "राजस्व" : "Revenue"}</TableHead>
                <TableHead>{language === "hi" ? "औसत मूल्य" : "Avg Price"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData[0]?.topSellingItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {index === 0 ? "Butter Chicken" :
                     index === 1 ? "Paneer Butter Masala" :
                     "Biryani"}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.revenue.toLocaleString()}</TableCell>
                  <TableCell>₹{Math.round(item.revenue / item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hourly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "hi" ? "घंटेवार बिक्री" : "Hourly Sales Breakdown"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {salesData[0]?.hourlyBreakdown.map((hour, index) => (
              <div key={index} className="text-center p-2 border rounded">
                <div className="text-xs font-medium">{hour.hour}:00</div>
                <div className="text-sm font-bold">₹{hour.sales.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{hour.orders} {language === "hi" ? "ऑर्डर" : "orders"}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 