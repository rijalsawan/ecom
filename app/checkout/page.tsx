'use client'
import { loadStripe } from '@stripe/stripe-js';
import { JSX, useState, useEffect } from 'react';

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
    const [isVisible, setIsVisible] = useState(false);
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
        setIsVisible(true);
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
        // 
        if (!validateForm()) {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 4000);
            return;
        }

        setIsLoading(true);
        const res = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Your Order',
                description: desc,
                amount: Math.round(total * 100),
                currency: 'usd'
            }),
        });

        const { id }: { id: string } = await res.json();
        const stripe = await stripePromise;
        if (stripe) {
            await stripe.redirectToCheckout({ sessionId: id });
            console.log(customerInfo);
        }
        
        
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500">Add some items to get started!</p>
                </div>
            </div>
        );
    }
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            {/* Alert Component */}
            {showAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-red-300">
                        <div className="flex items-center space-x-3">
                            <div className="text-2xl">⚠️</div>
                            <div>
                                <p className="font-semibold">Please fill all required fields</p>
                                <p className="text-sm opacity-90">Complete your information to proceed with payment</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-4xl mx-auto transition-all duration-1000 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Checkout
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Customer Information Form - Now at top */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                                <span className="mr-3">👤</span>
                                Customer Information
                            </h2>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={customerInfo.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                                                showAlert && !customerInfo.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={customerInfo.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                                                showAlert && !customerInfo.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123 Main Street, City, State, ZIP"
                                        value={customerInfo.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                                            showAlert && !customerInfo.address ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={customerInfo.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                                            showAlert && !customerInfo.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Order Summary - Now at bottom */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                                <span className="mr-3">📋</span>
                                Order Summary
                            </h2>
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div 
                                        key={item.id}
                                        className={`flex items-center p-4 bg-gray-50 rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-md ${
                                            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                                        }`}
                                        style={{ transitionDelay: `${index * 100}ms` }}
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                item.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                                            <p className="text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-xl font-semibold text-gray-800">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="lg:col-span-1">
                        <div className={`bg-white rounded-2xl shadow-lg p-6 sticky top-8 transition-all duration-700 transform ${
                            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}>
                            <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                                <span className="mr-3">💳</span>
                                Payment Details
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-xl font-bold text-gray-800">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                                    isLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    `Pay $${total.toFixed(2)}`
                                )}
                            </button>

                            <div className="mt-4 text-center">
                                <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                                    <span>🔒</span>
                                    <span>Secured by Stripe</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}