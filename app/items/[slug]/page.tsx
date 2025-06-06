'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react'
import Image from 'next/image'

interface Product {
    id: number
    name: string
    price: number
    originalPrice?: number
    rating: number
    reviewCount?: number
    description: string
    features?: string[]
    images?: string[]
    image: string
    inStock?: boolean
    category: string
    quantity: number
}

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image: string
}

export default function ProductPage() {
    const params = useParams()
    const slug = params.slug as string
    console.log(`Product slug: ${slug}`);
    
    
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [isLiked, setIsLiked] = useState(false)
    const [loading, setLoading] = useState(true)
    const [product, setProduct] = useState<Product | null>(null)

    // Get products from localStorage
    const getProductsFromStorage = (): Product[] => {
        if (typeof window !== 'undefined') {
            const products = localStorage.getItem('cart')
            return products ? JSON.parse(products) : []
        }
        return []
    }

    // Get cart from localStorage
    // Get cart from localStorage
    const getCartFromStorage = (): CartItem[] => {
        if (typeof window !== 'undefined') {
            const cart = localStorage.getItem('cart')
            return cart ? JSON.parse(cart) : []
        }
        return []
    }
    // Save cart to localStorage
    const saveCartToStorage = (cart: CartItem[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(cart))
        }
    }
    // Find product by slug (assuming slug is the product id)
    const findProduct = useCallback(() => {
        const products = getProductsFromStorage()
        console.log(products);
        
        const findId = (id: string, products: Product[]): Product | undefined => {
            return products.find(product => product.id === parseInt(id))
        }

        const foundProduct = findId(slug, products)
        
        if (foundProduct) {
            // Add default values for missing properties
            const productWithDefaults: Product = {
                ...foundProduct,
                originalPrice: foundProduct.price + 100, // Mock original price
                reviewCount: Math.floor(Math.random() * 500) + 50, // Mock review count
                features: [
                    "Premium quality construction",
                    "Advanced technology integration",
                    "User-friendly design",
                    "Durable materials",
                    "Excellent performance"
                ],
                images: [
                    foundProduct.image,
                    foundProduct.image,
                    foundProduct.image
                ],
                inStock: foundProduct.quantity > 0
            }
            setProduct(productWithDefaults)
        }
    }, [slug])
    // Check if product exists in cart and sync quantity
    const syncWithCart = useCallback(() => {
        if (!product) return
        
        const cart = getCartFromStorage()
        const existingItem = cart.find(item => 
            item.id === product.id.toString()
        )
        
        if (existingItem) {
            setQuantity(existingItem.quantity)
        } else {
            setQuantity(1)
        }
    }, [product])
    // Add to cart or update quantity
    const handleAddToCart = () => {
        if (!product) return
        
        const cart = getCartFromStorage()
        const cartItem: CartItem = {
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        }

        const existingItemIndex = cart.findIndex(item => 
            item.id === product.id.toString()
        )

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = quantity
        } else {
            cart.push(cartItem)
        }

        saveCartToStorage(cart)
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('cartUpdated'))
    }

    // Update quantity and sync with cart
    const updateQuantity = (newQuantity: number) => {
        if (newQuantity < 1 || !product) return
        
        setQuantity(newQuantity)
        
        const cart = getCartFromStorage()
        const existingItemIndex = cart.findIndex(item => 
            item.id === product.id.toString()
        )

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = newQuantity
            saveCartToStorage(cart)
            window.dispatchEvent(new CustomEvent('cartUpdated'))
        }
    }

    useEffect(() => {
        // Find product and simulate loading
        findProduct()
        setTimeout(() => setLoading(false), 1000)
    }, [findProduct])

    useEffect(() => {
        // Initial sync with cart when product is loaded
        if (product) {
            syncWithCart()
        }
    }, [product, syncWithCart])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <p className="text-gray-600">The product youre looking for doesnt exist.</p>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="aspect-square rounded-2xl overflow-hidden bg-white shadow-2xl"
                        >
                            <Image
                                src={product.images![selectedImage]}
                                alt={product.name}
                                width={500}
                                height={500}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                        
                        <div className="flex space-x-2">
                            {product.images!.map((image, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedImage(index)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                        selectedImage === index ? 'border-blue-500' : 'border-gray-300'
                                    }`}
                                >
                                    <Image 
                                        src={image} 
                                        alt={`${product.name} ${index + 1}`} 
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover" 
                                    />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                    {/* Product Details */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div>
                            <motion.h1
                                initial={{ x: -20 }}
                                animate={{ x: 0 }}
                                className="text-4xl font-bold text-gray-900 mb-2"
                            >
                                {product.name}
                            </motion.h1>
                            
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                    <span className="ml-2 text-gray-600">({product.reviewCount} reviews)</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                                {product.originalPrice && (
                                    <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                                )}
                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                                    Save ${(product.originalPrice || 0) - product.price}
                                </span>
                            </div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-600 leading-relaxed"
                        >
                            {product.description}
                        </motion.p>

                        {/* Quantity */}
                        {/* Quantity */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => updateQuantity(quantity - 1)}
                                        className="p-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </motion.button>
                                    <span className="px-4 py-2 font-medium">{quantity}</span>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => updateQuantity(quantity + 1)}
                                        className="p-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </motion.button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {product.quantity} available
                                </span>
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsLiked(!isLiked)}
                                className={`p-3 rounded-xl border-2 transition-all ${
                                    isLiked ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                            </motion.button>
                        </div>

                        {/* Features */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-xl p-6 shadow-lg"
                        >
                            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                            <ul className="space-y-2">
                                {product.features!.map((feature, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        className="flex items-center text-gray-600"
                                    >
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                                        {feature}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Shipping Info */}
                        <div className="grid grid-cols-3 gap-4">
                            <motion.div
                                whileHover={{ y: -2 }}
                                className="text-center p-4 bg-white rounded-lg shadow-sm"
                            >
                                <Truck className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                <span className="text-sm text-gray-600">Free Shipping</span>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -2 }}
                                className="text-center p-4 bg-white rounded-lg shadow-sm"
                            >
                                <Shield className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                <span className="text-sm text-gray-600">2 Year Warranty</span>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -2 }}
                                className="text-center p-4 bg-white rounded-lg shadow-sm"
                            >
                                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                                <span className="text-sm text-gray-600">30 Day Returns</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}