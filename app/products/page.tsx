'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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
                staggerChildren: 0.08,
                ease: "easeOut"
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                        duration: 1, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full"
                />
            </div>
        )
    }


    return (
        <div className="">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Category Filter */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 lg:mb-16"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium transition-all duration-300 border ${
                                selectedCategory === category
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
                >
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            className="group bg-white border-[1px] border-gray-300 hover:border-gray-200 transition-all duration-300"
                        >
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                
                                {/* Cart Badge */}
                                {isInCart(product.id) && (
                                    <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                                        {getCartItemQuantity(product.id)}
                                    </div>
                                )}
                                
                                
                            </div>

                            {/* Product Info */}
                            <div className="p-4 lg:p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900 text-sm lg:text-base leading-tight pr-2">
                                        {product.name}
                                    </h3>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                        {product.category}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 text-xs lg:text-sm mb-4 leading-relaxed line-clamp-2">
                                    {product.description}...
                                </p>
                                <Link href={`/items/${product.id}`}><div className=''>
                                <motion.p 
                                    className="text-gray-600 w-1/2 cursor-pointer text-xs lg:text-sm mb-4 leading-relaxed line-clamp-2 relative"
                                    whileHover="hover"
                                    initial="initial"
                                    variants={{
                                        initial: {},
                                        hover: {}
                                    }}
                                >
                                    See more
                                    <motion.span
                                        className="absolute bottom-0 left-0 h-0.5 bg-gray-600"
                                        variants={{
                                            initial: { width: 0 },
                                            hover: { width: "100%" }
                                        }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    />
                                </motion.p>
                                </div>
                                </Link>

                                <div className="flex justify-between items-center">
                                    <span className="text-lg lg:text-xl font-light text-gray-900">
                                        ${product.price}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => addToCart(product)}
                                        className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                            isInCart(product.id)
                                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                                : 'bg-white text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white'
                                        }`}
                                    >
                                        {isInCart(product.id) ? 'Add More' : 'Add to Cart'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-center py-16 lg:py-24"
                    >
                        <p className="text-gray-500 text-lg font-light">No products found in this category.</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Page;
