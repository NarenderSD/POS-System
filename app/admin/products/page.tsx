"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const categories = [
  "main-course",
  "starters",
  "breads",
  "rice",
  "desserts",
  "beverages",
  "soups",
  "salads",
]

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    category: "main-course",
    description: "",
    isVeg: true,
    available: true,
  })
  const [imagePreview, setImagePreview] = useState<string>("")

  async function fetchProducts() {
    setLoading(true)
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  function handleInput(e: any) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function handleImage(e: any) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((f) => ({ ...f, image: reader.result as string }))
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function openAdd() {
    setEditProduct(null)
    setForm({
      name: "",
      price: "",
      image: "",
      category: "main-course",
      description: "",
      isVeg: true,
      available: true,
    })
    setImagePreview("")
    setShowDialog(true)
  }

  function openEdit(product: any) {
    setEditProduct(product)
    setForm({
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description || "",
      isVeg: product.isVeg,
      available: product.available,
    })
    setImagePreview(product.image)
    setShowDialog(true)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    try {
      const method = editProduct ? "PUT" : "POST"
      const body = editProduct ? { ...form, _id: editProduct._id } : form
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to save product")
      toast.success(editProduct ? "Product updated" : "Product added")
      setShowDialog(false)
      fetchProducts()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(product: any) {
    if (!window.confirm("Delete this product?")) return
    setLoading(true)
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: product._id }),
      })
      if (!res.ok) throw new Error("Failed to delete product")
      toast.success("Product deleted")
      fetchProducts()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={openAdd}>Add Product</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Veg</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>₹{product.price}</TableCell>
              <TableCell>
                <Badge>{product.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={product.isVeg ? "default" : "destructive"}>{product.isVeg ? "Yes" : "No"}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={product.available ? "default" : "destructive"}>{product.available ? "Yes" : "No"}</Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(product)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input name="name" value={form.name} onChange={handleInput} required />
            </div>
            <div>
              <Label>Price</Label>
              <Input name="price" type="number" value={form.price} onChange={handleInput} required />
            </div>
            <div>
              <Label>Category</Label>
              <select
                name="category"
                value={form.category}
                onChange={handleInput}
                className="w-full border rounded px-2 py-1"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Image</Label>
              <Input name="image" type="file" accept="image/*" onChange={handleImage} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded mt-2" />
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleInput} rows={2} />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Switch checked={form.isVeg} onCheckedChange={(v) => setForm((f) => ({ ...f, isVeg: v }))} />
                <span className="ml-2">Veg</span>
              </div>
              <div className="flex items-center">
                <Switch checked={form.available} onCheckedChange={(v) => setForm((f) => ({ ...f, available: v }))} />
                <span className="ml-2">Available</span>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {editProduct ? "Update" : "Add"} Product
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 