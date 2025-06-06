'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Order {
    id: number;
    name: string;
    email: string;
    total: number;
    status: string;
    phone: string;
    shippingAddress: string;
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
    createdAt: string;
}

export default function SuccessPage() {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (sessionId) {
            fetchOrder();
            localStorage.removeItem('cart');
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
    }, [sessionId]);
    
    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders?sessionId=${sessionId}`);
            if (response.ok) {
                const orderData = await response.json();
                setOrder(orderData);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-4">Order not found</h1>
                    <p className="text-gray-600 mb-6">Please contact support if you think this is an error.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order Confirmed</h1>
                    <p className="text-gray-600">Thank you, {order.name}. Your order has been processed successfully.</p>
                </div>

                {/* Order Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                    {/* Order Summary */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Order #{order.id}</h2>
                                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                                <span className="inline-block px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full capitalize">
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span className="text-gray-900">{order.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone</span>
                                <span className="text-gray-900">{order.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Address</span>
                                <span className="text-gray-900 text-right max-w-xs">{order.shippingAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Items ({order.items.length})</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => window.location.href = '/products'}
                        className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                    >
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}
