'use client'
import React, { useEffect, useState } from 'react'
import { CheckCircle, Package, Calendar, CreditCard } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

const Page = () => {
  const [orderItems, setOrderItems] = useState<CartItem[]>([])
  const [orderTotal, setOrderTotal] = useState(0)
  const [orderDate] = useState(new Date().toLocaleDateString())

  useEffect(() => {
    try {
      const cart = localStorage.getItem('cart')
      
      if (cart) {
        const items = JSON.parse(cart)
        
        // Ensure items is an array
        const cartItems = Array.isArray(items) ? items : []
        
        // Validate and format items
        const validItems = cartItems.filter(item => 
          item && 
          typeof item === 'object' && 
          item.id && 
          item.name && 
          typeof item.price === 'number' &&
          typeof item.quantity === 'number'
        )
        
        setOrderItems(validItems)
        
        const total = validItems.reduce((sum: number, item: CartItem) => 
          sum + (item.price * item.quantity), 0
        )
        setOrderTotal(total)
        
        // Clear cart after successful payment
        localStorage.removeItem('cart')
      }
    } catch (error) {
      console.error('Error parsing cart data:', error)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Order Summary</h2>
          </div>

          {/* Order Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold">{orderDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold">Stripe</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {orderItems.length > 0 ? (
              orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No order items found
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-800">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">${orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default Page