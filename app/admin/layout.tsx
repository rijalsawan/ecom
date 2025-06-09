// Create app/admin/layout.tsx
import Link from 'next/link'
import { Package, Phone, BarChart3, Users} from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Admin Sidebar */}
            <div className="flex">
                <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
                    <nav className="mt-8 px-4">
                        <ul className="space-y-2">
                            <li>
                                <Link 
                                    href="/admin"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin/products"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    <Package className="w-5 h-5" />
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin/contacts"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    <Phone className="w-5 h-5" />
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin/orders"
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    <Users className="w-5 h-5" />
                                    Orders
                                </Link>
                            </li>
                            
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}