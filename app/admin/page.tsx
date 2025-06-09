// Create app/admin/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

interface DashboardStats {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
}

interface Order {
    id: string
    name: string
    email: string
    total: number
    status: string
    createdAt: string
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0
    })
    const [recentOrders, setRecentOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const productsRes = await fetch('/api/listProducts')
            const products = await productsRes.json()
            
            const ordersRes = await fetch('/api/allOrders')
            const orders = await ordersRes.json()

            setStats({
                totalProducts: products.length || 0,
                totalOrders: orders.length || 0,
                totalRevenue: orders.reduce((sum: number, order: Order) => sum + order.total, 0) || 0,
                totalCustomers: new Set(orders.map((order: Order) => order.email)).size || 0
            })

            setRecentOrders(orders.slice(0, 5))
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Page Header */}
                <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Welcome back! Here is whats happening with your store.</p>
                </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Customers</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Orders</h2>
                </div>
                <div className="p-4 sm:p-6">
                    {recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr>
                                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-sm">Order ID</th>
                                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-sm">Customer</th>
                                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-sm">Total</th>
                                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-sm">Status</th>
                                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 text-sm">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-100">
                                            <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-sm">#{order.id}</td>
                                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm truncate max-w-[150px] sm:max-w-none">{order.name}</td>
                                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm">${order.total}</td>
                                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm whitespace-nowrap">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center py-8 text-sm sm:text-base">No orders yet</p>
                    )}
                </div>
            </div>
        </div>
        </div>
    )
}