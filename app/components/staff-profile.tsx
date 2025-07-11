"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const roles = ["admin", "manager", "cashier", "waiter", "kitchen", "cleaner"]
const shifts = ["morning", "evening", "night", "full-day"]

export default function StaffProfile() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editStaff, setEditStaff] = useState<any>(null)
  const [form, setForm] = useState<any>({
    name: "",
    role: "waiter",
    phone: "",
    email: "",
    shift: "morning",
    permissions: [],
    salary: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  async function fetchStaff() {
    setLoading(true)
    const res = await fetch("/api/staff")
    const data = await res.json()
    setStaff(data)
    setLoading(false)
  }

  function handleInput(e: any) {
    const { name, value } = e.target
    setForm((f: any) => ({ ...f, [name]: value }))
  }

  function handleSelect(name: string, value: string) {
    setForm((f: any) => ({ ...f, [name]: value }))
  }

  async function handleAddStaff() {
    if (!form.name || !form.role) return
    await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setIsAddDialogOpen(false)
    setForm({ name: "", role: "waiter", phone: "", email: "", shift: "morning", permissions: [], salary: 0, isActive: true })
    fetchStaff()
  }

  async function handleEditStaff() {
    if (!editStaff || !form.name || !form.role) return
    await fetch("/api/staff", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: editStaff._id, ...form }),
    })
    setIsEditDialogOpen(false)
    setEditStaff(null)
    setForm({ name: "", role: "waiter", phone: "", email: "", shift: "morning", permissions: [], salary: 0, isActive: true })
    fetchStaff()
  }

  function openEditDialog(staff: any) {
    setEditStaff(staff)
    setForm({
      name: staff.name || "",
      role: staff.role || "waiter",
      phone: staff.phone || "",
      email: staff.email || "",
      shift: staff.shift || "morning",
      permissions: staff.permissions || [],
      salary: staff.salary || 0,
      isActive: staff.isActive !== false,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="min-h-screen p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Staff Profile / स्टाफ प्रोफाइल</h2>
      <div className="flex justify-end mb-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({ name: "", role: "waiter", phone: "", email: "", shift: "morning", permissions: [], salary: 0, isActive: true })}>
              + Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Staff Profile</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Label>Name</Label>
              <Input name="name" value={form.name} onChange={handleInput} />
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => handleSelect("role", v)}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
              <Label>Phone</Label>
              <Input name="phone" value={form.phone} onChange={handleInput} />
              <Label>Email</Label>
              <Input name="email" value={form.email} onChange={handleInput} />
              <Label>Shift</Label>
              <Select value={form.shift} onValueChange={v => handleSelect("shift", v)}>
                <SelectTrigger><SelectValue placeholder="Shift" /></SelectTrigger>
                <SelectContent>
                  {shifts.map(shift => <SelectItem key={shift} value={shift}>{shift}</SelectItem>)}
                </SelectContent>
              </Select>
              <Label>Salary</Label>
              <Input name="salary" type="number" value={form.salary} onChange={handleInput} />
              <Button className="w-full mt-2" onClick={handleAddStaff}>Add Staff</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="text-center text-lg font-semibold">Loading staff...</div>
      ) : staff.length === 0 ? (
        <div className="text-center text-lg font-semibold">No staff found.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s: any) => (
                <TableRow key={s._id || s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.role}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.shift}</TableCell>
                  <TableCell>{s.salary ? `₹${s.salary}` : '-'}</TableCell>
                  <TableCell>{s.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(s)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Staff Profile</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Name</Label>
            <Input name="name" value={form.name} onChange={handleInput} />
            <Label>Role</Label>
            <Select value={form.role} onValueChange={v => handleSelect("role", v)}>
              <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
            <Label>Phone</Label>
            <Input name="phone" value={form.phone} onChange={handleInput} />
            <Label>Email</Label>
            <Input name="email" value={form.email} onChange={handleInput} />
            <Label>Shift</Label>
            <Select value={form.shift} onValueChange={v => handleSelect("shift", v)}>
              <SelectTrigger><SelectValue placeholder="Shift" /></SelectTrigger>
              <SelectContent>
                {shifts.map(shift => <SelectItem key={shift} value={shift}>{shift}</SelectItem>)}
              </SelectContent>
            </Select>
            <Label>Salary</Label>
            <Input name="salary" type="number" value={form.salary} onChange={handleInput} />
            <Button className="w-full mt-2" onClick={handleEditStaff}>Update Staff</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 