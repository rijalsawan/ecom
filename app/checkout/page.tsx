'use client'
import { loadStripe } from '@stripe/stripe-js';
import { JSX, useState, useEffect } from 'react';
import { SignedIn, SignedOut } from '@clerk/nextjs';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CustomerInfo {
    name: string;
    email: string;
    address: string;
    phone: string;
}

export default function Page(): JSX.Element {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        email: '',
        address: '',
        phone: ''
    });
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const desc = cartItems.map(item => `${item.name} (x${item.quantity})`).join(', ');

    const handleInputChange = (field: keyof CustomerInfo, value: string) => {
        setCustomerInfo(prev => ({ ...prev, [field]: value }));
        if (showAlert) setShowAlert(false);
    };

    const validateForm = (): boolean => {
        const { name, email, address, phone } = customerInfo;
        return name.trim() !== '' && email.trim() !== '' && address.trim() !== '' && phone.trim() !== '';
    };

    const handleCheckout = async (): Promise<void> => {
        if (!validateForm()) {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 4000);
            return;
        }
    
        setIsLoading(true);
        
        try {
            const res = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Your Order',
                    description: desc,
                    amount: Math.round(total * 100),
                    currency: 'usd',
                    customerInfo,
                    cartItems
                }),
            });
    
            if (!res.ok) {
                throw new Error('Failed to create checkout session');
            }
    
            const { id }: { id: string } = await res.json();
            const stripe = await stripePromise;
            
            if (stripe) {
                await stripe.redirectToCheckout({ sessionId: id });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setIsLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7.5" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600">Add some items to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            {/* Alert Component */}
            {showAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Please fill all required fields</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Checkout</h1>
                    <p className="text-gray-600">Complete your order details below</p>
                </div>

                {/* Main Checkout Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                    {/* Customer Information */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={customerInfo.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                                        showAlert && !customerInfo.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={customerInfo.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                                        showAlert && !customerInfo.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    value={customerInfo.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                                        showAlert && !customerInfo.phone ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="123 Main Street, City, State, ZIP"
                                    value={customerInfo.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                                        showAlert && !customerInfo.address ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                            <div className="text-right">
                                <p className="text-2xl font-semibold text-gray-900">${total.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Items ({cartItems.length})</h3>
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-start">
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

                {/* Payment Buttons */}
                <div className="space-y-3">
                    <SignedIn>
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                                isLoading 
                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                `Pay $${total.toFixed(2)}`
                            )}
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <button
                            onClick={() => alert('Please sign in to proceed with payment.')}
                            className="w-full bg-gray-400 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                        >
                            Sign in to Pay
                        </button>
                    </SignedOut>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center text-gray-500 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secured by Stripe
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
