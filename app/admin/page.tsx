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
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6 lg:space-y-8">
                {/* Page Header */}
                <div className="text-center sm:text-left px-1">
                    <h1 className="text-lg max-sm:text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base max-sm:text-xs">Welcome back! Here is whats happening with your store.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-sm:gap-3 sm:gap-4 lg:gap-6">
                    <div className="bg-white p-2 max-sm:p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-xs max-sm:text-xs sm:text-sm font-medium text-gray-600 truncate">Total Products</p>
                                <p className="text-lg max-sm:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                            </div>
                            <div className="w-8 h-8 max-sm:w-10 max-sm:h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                <Package className="w-4 h-4 max-sm:w-5 max-sm:h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-2 max-sm:p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-xs max-sm:text-xs sm:text-sm font-medium text-gray-600 truncate">Total Orders</p>
                                <p className="text-lg max-sm:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                            </div>
                            <div className="w-8 h-8 max-sm:w-10 max-sm:h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                <ShoppingCart className="w-4 h-4 max-sm:w-5 max-sm:h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-2 max-sm:p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-xs max-sm:text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
                                <p className="text-lg max-sm:text-base sm:text-2xl md:text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="w-8 h-8 max-sm:w-10 max-sm:h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                <TrendingUp className="w-4 h-4 max-sm:w-5 max-sm:h-5 sm:w-6 sm:h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-2 max-sm:p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-xs max-sm:text-xs sm:text-sm font-medium text-gray-600 truncate">Total Customers</p>
                                <p className="text-lg max-sm:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                            </div>
                            <div className="w-8 h-8 max-sm:w-10 max-sm:h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                <Users className="w-4 h-4 max-sm:w-5 max-sm:h-5 sm:w-6 sm:h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                    <div className="p-3 max-sm:p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-base max-sm:text-lg sm:text-xl font-semibold text-gray-900">Recent Orders</h2>
                    </div>
                    <div className="p-3 max-sm:p-4 sm:p-6">
                        {recentOrders.length > 0 ? (
                            <div className="max-sm:space-y-3 sm:overflow-x-auto">
                                {/* Mobile Card Layout */}
                                <div className="max-sm:block sm:hidden space-y-3">
                                    {recentOrders.map((order) => (
                                        <div key={order.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-sm">#{order.id}</p>
                                                    <p className="text-xs text-gray-600 truncate max-w-[200px]">{order.name}</p>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap">
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm">${order.total}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Desktop Table Layout */}
                                <div className="max-sm:hidden">
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
                            </div>
                        ) : (
                            <p className="text-gray-600 text-center py-8 text-xs max-sm:text-sm sm:text-base">No orders yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}