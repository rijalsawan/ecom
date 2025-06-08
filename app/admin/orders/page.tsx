// Create app/admin/orders/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { Eye, Download, Search } from 'lucide-react'

interface OrderItem {
    id: number
    name: string
    price: number
    quantity: number
}

interface Order {
    id: number
    name: string
    email: string
    total: number
    status: string
    createdAt: string
    items: OrderItem[]
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/allOrders')
            const data = await response.json()
            setOrders(data)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-2">Manage customer orders and track sales</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by customer name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Orders ({filteredOrders.length})
                    </h2>
                </div>
                
                {filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Order ID</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Customer</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Items</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Total</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Date</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6 font-medium">#{order.id}</td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <div className="font-medium text-gray-900">{order.name}</div>
                                                <div className="text-sm text-gray-600">{order.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-900">
                                            ${order.total.toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                order.status === 'COMPLETED' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : order.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter criteria' 
                                : 'Orders will appear here once customers make purchases'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}