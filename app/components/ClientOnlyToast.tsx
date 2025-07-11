"use client"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
export default function ClientOnlyToast() {
  return (
    <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
  )
} 