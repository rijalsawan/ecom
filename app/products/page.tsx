'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Product {
    id: number
    name: string
    price: number
    image: string
    rating: number
    category: string
    description: string
}

interface CartItem extends Product {
    quantity: number
}

// API Response interface
interface ApiProduct {
    id: number
    name: string
    description: string
    price: number
    imageUrl: string
    categoryId: number
    createdAt: string
    updatedAt: string
    category: {
        id: number
        name: string
        description: string
        createdAt: string
        updatedAt: string
    }
}

const Page = () =>  {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const [isLoading, setIsLoading] = useState(true)
    const [cart, setCart] = useState<CartItem[]>([])
    const [categories, setCategories] = useState<string[]>(['All'])

    // Transform API data to Product interface
    const transformApiProduct = (apiProduct: ApiProduct): Product => ({
        id: apiProduct.id,
        name: apiProduct.name,
        price: apiProduct.price,
        image: apiProduct.imageUrl,
        rating: 4.5, // Default rating since not provided by API
        category: apiProduct.category.name,
        description: apiProduct.description
    })

    useEffect(() => {
        // Load cart from localStorage on component mount
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }

        // Fetch products from API
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/listProducts')
                if (!response.ok) {
                    throw new Error('Failed to fetch products')
                }
                const apiData: ApiProduct[] = await response.json()
                
                // Transform API data to Product format
                const transformedProducts = apiData.map(transformApiProduct)
                setProducts(transformedProducts)
                
                // Extract unique categories from products
                const uniqueCategories = Array.from(
                    new Set(apiData.map(product => product.category.name))
                )
                setCategories(['All', ...uniqueCategories])
                
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setIsLoading(false)
            }
        }   
        fetchProducts()

        // Listen for cart updates from other components
        const handleCartUpdate = () => {
            setTimeout(() => {
                const updatedCart = localStorage.getItem('cart')
                if (updatedCart) {
                    setCart(JSON.parse(updatedCart))
                }
            }, 0);
        };

        window.addEventListener('storage', handleCartUpdate);
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            window.removeEventListener('storage', handleCartUpdate);
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [])

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id)
            let updatedCart: CartItem[]

            if (existingItem) {
                updatedCart = prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            } else {
                updatedCart = [...prevCart, { ...product, quantity: 1 }]
            }

            localStorage.setItem('cart', JSON.stringify(updatedCart))
            
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('cartUpdated'))
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'cart',
                    newValue: localStorage.getItem('cart')
                }))
            }, 0)
            
            return updatedCart
        })
    }

    const isInCart = (productId: number) => {
        return cart.some(item => item.id === productId)
    }

    const getCartItemQuantity = (productId: number) => {
        const item = cart.find(item => item.id === productId)
        return item ? item.quantity : 0
    }

    const filteredProducts = selectedCategory === 'All' 
        ? products 
        : products.filter(p => p.category === selectedCategory)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                ease: "easeOut"
            }
        }
    }

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="bg-white shadow-lg"
            >
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Category Filter */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                        duration: 0.8, 
                        delay: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="flex flex-wrap justify-center gap-4 mb-12"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-500 ease-out ${
                                selectedCategory === category
                                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Products Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            whileHover={{ 
                                y: -8, 
                                scale: 1.03,
                                transition: { duration: 0.4, ease: "easeOut" }
                            }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 ease-out"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover transition-transform duration-700 ease-out hover:scale-110"
                                />
                                <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-lg">
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-xs font-medium ml-1">{product.rating}</span>
                                </div>
                                {isInCart(product.id) && (
                                    <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                                        In Cart: {getCartItemQuantity(product.id)}
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">
                                        {product.name}
                                    </h3>
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                        {product.category}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 mb-3 text-xs leading-relaxed">
                                    {product.description}
                                </p>

                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-blue-600">
                                        ${product.price}
                                    </span>
                                    <motion.button
                                        whileHover={{ 
                                            scale: 1.05,
                                            transition: { duration: 0.3, ease: "easeOut" }
                                        }}
                                        whileTap={{ 
                                            scale: 0.95,
                                            transition: { duration: 0.1 }
                                        }}
                                        onClick={() => addToCart(product)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out shadow-lg hover:shadow-xl ${
                                            isInCart(product.id)
                                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                        }`}
                                    >
                                        {isInCart(product.id) ? 'Add More' : 'Add to Cart'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {filteredProducts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center py-16"
                    >
                        <p className="text-gray-500 text-lg">No products found in this category.</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Page;
