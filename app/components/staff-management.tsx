"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Award, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Star,
  Phone,
  Mail,
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
import type { Staff } from "../types"

interface Attendance {
  id: string
  staffId: string
  date: Date
  checkIn: Date
  checkOut?: Date
  status: "present" | "absent" | "late" | "half-day"
  hoursWorked?: number
}

export default function StaffManagement() {
  const { language, staff, setStaff, setCurrentStaff } = usePOS()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [shiftFilter, setShiftFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    name: "",
    role: "waiter",
    phone: "",
    email: "",
    shift: "morning",
    permissions: [],
    salary: 0,
  })

  // Generate sample attendance data
  useEffect(() => {
    const generateAttendance = () => {
      const today = new Date()
      const attendanceData: Attendance[] = []
      
      staff.forEach(member => {
        for (let i = 0; i < 7; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          
          const isPresent = Math.random() > 0.1 // 90% attendance rate
          if (isPresent) {
            const checkIn = new Date(date)
            checkIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))
            
            const checkOut = new Date(date)
            checkOut.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60))
            
            const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
            
            attendanceData.push({
              id: `${member.id}-${date.toISOString()}`,
              staffId: member.id,
              date,
              checkIn,
              checkOut,
              status: checkIn.getHours() > 9 ? "late" : "present",
              hoursWorked,
            })
          } else {
            attendanceData.push({
              id: `${member.id}-${date.toISOString()}`,
              staffId: member.id,
              date,
              checkIn: new Date(date),
              status: "absent",
            })
          }
        }
      })
      
      setAttendance(attendanceData)
    }
    
    generateAttendance()
  }, [staff])

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.phone?.includes(searchQuery) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesShift = shiftFilter === "all" || member.shift === shiftFilter
    return matchesSearch && matchesRole && matchesShift
  })

  const totalStaff = staff.length
  const activeStaff = staff.filter(s => s.isActive).length
  const totalSalary = staff.reduce((sum, s) => sum + (s.salary || 0), 0)
  const averageRating = staff.length > 0 ? staff.reduce((sum, s) => sum + (s.performance?.rating || 0), 0) / staff.length : 0

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 border-red-300"
      case "manager": return "bg-blue-100 text-blue-800 border-blue-300"
      case "cashier": return "bg-green-100 text-green-800 border-green-300"
      case "waiter": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "kitchen": return "bg-purple-100 text-purple-800 border-purple-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "morning": return "bg-blue-100 text-blue-800"
      case "evening": return "bg-orange-100 text-orange-800"
      case "night": return "bg-purple-100 text-purple-800"
      case "full-day": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Add Staff (API + Waiter sync)
  const handleAddStaff = async () => {
    if (newStaff.name && newStaff.role) {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      })
      const created = await res.json()
      // If role is waiter, create in /api/waiters too
      if (newStaff.role === 'waiter') {
        await fetch('/api/waiters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
        name: newStaff.name,
            phone: newStaff.phone,
            staffId: created._id,
        isActive: true,
          }),
        })
      }
      setIsAddDialogOpen(false)
      setNewStaff({
        name: "",
        role: "waiter",
        phone: "",
        email: "",
        shift: "morning",
        permissions: [],
        salary: 0,
      })
      // Refetch staff and waiters
      fetch('/api/staff').then(r => r.json()).then(setStaff)
      // Optionally: trigger a global refetch for waiters if needed
    }
  }

  // Update Staff (API + Waiter sync)
  const handleUpdateStaff = async (id: string, data: Partial<Staff>) => {
    await fetch('/api/staff', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id, ...data }),
    })
    // If role is waiter, update in /api/waiters too
    if (data.role === 'waiter' || (data.role === undefined && staff.find(s => s.id === id)?.role === 'waiter')) {
      await fetch('/api/waiters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: id, ...data }),
      })
    }
    // Refetch staff and waiters
    fetch('/api/staff').then(r => r.json()).then(setStaff)
    // Optionally: trigger a global refetch for waiters if needed
  }

  // Delete Staff (API + Waiter sync)
  const handleDeleteStaff = async (id: string) => {
    await fetch('/api/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    // Also delete from /api/waiters if role is waiter
    const staffMember = staff.find(s => s.id === id)
    if (staffMember?.role === 'waiter') {
      await fetch('/api/waiters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: id }),
      })
    }
    // Refetch staff and waiters
    fetch('/api/staff').then(r => r.json()).then(setStaff)
    // Optionally: trigger a global refetch for waiters if needed
  }

  const getAttendanceForStaff = (staffId: string) => {
    return attendance.filter(a => a.staffId === staffId)
  }

  const getAttendanceRate = (staffId: string) => {
    const staffAttendance = getAttendanceForStaff(staffId)
    const presentDays = staffAttendance.filter(a => a.status === "present" || a.status === "late").length
    return staffAttendance.length > 0 ? (presentDays / staffAttendance.length) * 100 : 0
  }

  const getAverageHours = (staffId: string) => {
    const staffAttendance = getAttendanceForStaff(staffId)
    const workedDays = staffAttendance.filter(a => a.hoursWorked).map(a => a.hoursWorked!)
    return workedDays.length > 0 ? workedDays.reduce((sum, hours) => sum + hours, 0) / workedDays.length : 0
  }

  const roles = ["admin", "manager", "cashier", "waiter", "kitchen", "cleaner"]
  const shifts = ["morning", "evening", "night", "full-day"]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            {language === "hi" ? "स्टाफ प्रबंधन" : "Staff Management"}
          </h2>
          <p className="text-muted-foreground">
            {language === "hi" ? "कर्मचारी प्रबंधन और उपस्थिति ट्रैकिंग" : "Employee management and attendance tracking"}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {language === "hi" ? "स्टाफ जोड़ें" : "Add Staff"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === "hi" ? "नया स्टाफ जोड़ें" : "Add New Staff"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === "hi" ? "नाम" : "Name"}</Label>
                <Input
                  value={newStaff.name || ""}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  placeholder={language === "hi" ? "स्टाफ का नाम" : "Staff name"}
                />
              </div>
              <div>
                <Label>{language === "hi" ? "भूमिका" : "Role"}</Label>
                <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value as Staff["role"]})}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "hi" ? "भूमिका चुनें" : "Select role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === "hi" ? "फोन नंबर" : "Phone Number"}</Label>
                <Input
                  value={newStaff.phone || ""}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label>{language === "hi" ? "ईमेल" : "Email"}</Label>
                <Input
                  type="email"
                  value={newStaff.email || ""}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  placeholder="staff@restaurant.com"
                />
              </div>
              <div>
                <Label>{language === "hi" ? "शिफ्ट" : "Shift"}</Label>
                <Select value={newStaff.shift} onValueChange={(value) => setNewStaff({...newStaff, shift: value as Staff["shift"]})}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "hi" ? "शिफ्ट चुनें" : "Select shift"} />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map(shift => (
                      <SelectItem key={shift} value={shift}>
                        {shift.charAt(0).toUpperCase() + shift.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === "hi" ? "वेतन" : "Salary"}</Label>
                <Input
                  type="number"
                  value={newStaff.salary !== undefined ? newStaff.salary : ""}
                  onChange={(e) => setNewStaff({...newStaff, salary: Number(e.target.value)})}
                  placeholder="₹"
                />
              </div>
              <Button onClick={handleAddStaff} className="w-full">
                {language === "hi" ? "स्टाफ जोड़ें" : "Add Staff"}
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
              {language === "hi" ? "कुल स्टाफ" : "Total Staff"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <div className="text-xs text-muted-foreground">
              {activeStaff} {language === "hi" ? "सक्रिय" : "active"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "कुल वेतन" : "Total Salary"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSalary.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "मासिक" : "Monthly"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "औसत रेटिंग" : "Average Rating"}
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "5 में से" : "out of 5"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "hi" ? "उपस्थिति दर" : "Attendance Rate"}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(staff.reduce((sum, s) => sum + getAttendanceRate(s.id), 0) / staff.length)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {language === "hi" ? "इस सप्ताह" : "This week"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === "hi" ? "स्टाफ खोजें..." : "Search staff..."}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={language === "hi" ? "भूमिका" : "Role"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "hi" ? "सभी भूमिकाएं" : "All Roles"}</SelectItem>
            {roles.map(role => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={shiftFilter} onValueChange={setShiftFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={language === "hi" ? "शिफ्ट" : "Shift"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "hi" ? "सभी शिफ्ट" : "All Shifts"}</SelectItem>
            {shifts.map(shift => (
              <SelectItem key={shift} value={shift}>
                {shift.charAt(0).toUpperCase() + shift.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "hi" ? "स्टाफ सूची" : "Staff List"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "hi" ? "स्टाफ" : "Staff"}</TableHead>
                <TableHead>{language === "hi" ? "संपर्क" : "Contact"}</TableHead>
                <TableHead>{language === "hi" ? "भूमिका" : "Role"}</TableHead>
                <TableHead>{language === "hi" ? "शिफ्ट" : "Shift"}</TableHead>
                <TableHead>{language === "hi" ? "उपस्थिति" : "Attendance"}</TableHead>
                <TableHead>{language === "hi" ? "प्रदर्शन" : "Performance"}</TableHead>
                <TableHead>{language === "hi" ? "वेतन" : "Salary"}</TableHead>
                <TableHead>{language === "hi" ? "कार्य" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => {
                const attendanceRate = getAttendanceRate(member.id)
                const avgHours = getAverageHours(member.id)
                return (
                  <TableRow key={member._id || member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.isActive ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {language === "hi" ? "सक्रिय" : "Active"}
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              {language === "hi" ? "निष्क्रिय" : "Inactive"}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {member.phone}
                        </div>
                        {member.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getShiftColor(member.shift)}>
                        {member.shift.charAt(0).toUpperCase() + member.shift.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attendanceRate.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">
                          {avgHours.toFixed(1)}h {language === "hi" ? "औसत" : "avg"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          {member.performance?.rating.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.performance?.ordersServed || 0} {language === "hi" ? "ऑर्डर" : "orders"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>₹{member.salary?.toLocaleString() || "0"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStaff(member)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Mark attendance for demo
                            const today = new Date()
                            const newAttendance: Attendance = {
                              id: `${member.id}-${today.toISOString()}`,
                              staffId: member.id,
                              date: today,
                              checkIn: new Date(),
                              status: "present",
                              hoursWorked: 8,
                            }
                            setAttendance([...attendance, newAttendance])
                          }}
                        >
                          <Clock className="h-4 w-4" />
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

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "hi" ? "स्टाफ संपादित करें" : "Edit Staff"}</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div>
                <Label>{language === "hi" ? "नाम" : "Name"}</Label>
                <Input defaultValue={selectedStaff.name} />
              </div>
              <div>
                <Label>{language === "hi" ? "फोन" : "Phone"}</Label>
                <Input defaultValue={selectedStaff.phone} />
              </div>
              <div>
                <Label>{language === "hi" ? "वेतन" : "Salary"}</Label>
                <Input 
                  type="number" 
                  defaultValue={selectedStaff.salary}
                />
              </div>
              <div>
                <Label>{language === "hi" ? "रेटिंग" : "Rating"}</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue={selectedStaff.performance?.rating}
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