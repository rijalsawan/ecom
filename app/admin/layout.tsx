// Create app/admin/layout.tsx
'use client'
import Link from 'next/link'
import { Package, Phone, BarChart3, Users, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile menu button */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-700 hover:text-gray-900"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex">
                {/* Admin Sidebar */}
                <aside className={`
                    fixed lg:static lg:h-0 inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 
                    transform transition-transform duration-300 ease-in-out lg:transform-none
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <nav className="mt-8 px-4">
                        <ul className="space-y-2">
                            <li>
                                <Link 
                                    href="/admin"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin/products"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Package className="w-5 h-5" />
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin/contacts"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Phone className="w-5 h-5" />
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin/orders"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Users className="w-5 h-5" />
                                    Orders
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}