"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePOS } from "../context/pos-context"
import { toast } from "react-toastify"

export default function PremiumProductGrid({ category, searchQuery }: { category: string; searchQuery: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const { addToCart } = usePOS()

  useEffect(() => {
    setLoading(true)
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) => {
    const matchCat = category === "all" || p.category === category
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchSearch
  })

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {loading && <div className="col-span-full text-center">Loading...</div>}
      {!loading && filtered.length === 0 && <div className="col-span-full text-center">No products found.</div>}
      {filtered.map((product) => (
        <Card key={product._id} className="hover:shadow-lg transition cursor-pointer flex flex-col group" onClick={() => { addToCart({ ...product, id: product._id }); toast.success(`${product.name} added to cart`) }}>
          <div className="relative">
            <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-t" />
              <Button
              className="absolute inset-x-0 bottom-0 mx-auto mb-2 w-32 opacity-0 group-hover:opacity-100 transition bg-green-600 text-white"
              onClick={e => { e.stopPropagation(); addToCart({ ...product, id: product._id }); toast.success(`${product.name} added to cart`) }}
                  >
              Add to Cart
                  </Button>
          </div>
          <CardContent className="flex-1 flex flex-col justify-between p-3">
            <div>
              <div className="font-semibold text-base truncate">{product.name}</div>
              <div className="text-green-700 font-bold text-lg mt-1">₹{product.price}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
