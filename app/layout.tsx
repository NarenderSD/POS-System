import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { POSProvider } from "./context/pos-context"
import ClientOnlyToast from './components/ClientOnlyToast'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Apna POS - India's Smartest POS System",
  description: "Professional Point of Sale System for Cafes and Restaurants",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gradient-to-br from-orange-50/30 to-red-50/30">
        <POSProvider>
          {children}
          <ClientOnlyToast />
        </POSProvider>
      </body>
    </html>
  )
}
