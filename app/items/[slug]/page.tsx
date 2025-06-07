'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Category {
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

interface Product {
    id: number
    name: string
    price: number
    description: string
    imageUrl: string
    category: Category | string
}


export default function ProductPage() {
    const params = useParams()
    const slug = params.slug as string
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFavorite, setIsFavorite] = useState(false)
    
    const getCategoryName = (category: Category | string): string => {
        if (typeof category === 'string') {
            return category
        }
        return category?.name || 'Uncategorized'
    }

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true)
            const fetchedProduct = await fetch(`/api/listProducts`)
            if (!fetchedProduct.ok) {
                throw new Error('Failed to fetch product')
            }
            const products: Product[] = await fetchedProduct.json()
            
            const foundProduct = products.find((p) => p.id === parseInt(slug))
            if (foundProduct) {
                setProduct(foundProduct)
            } else {
                setProduct(null)
            } 
        } catch (error) {
            console.error('Error fetching product:', error)
            setProduct(null)
        } finally {
            setLoading(false)
        }
    }, [slug])

    useEffect(() => {
        fetchProduct()
    }, [fetchProduct])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 font-light">Loading product details...</p>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-6 p-8">
                    <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-light text-gray-900">Product Not Found</h1>
                        <p className="text-gray-600 font-light">The product youre looking for doesnt exist.</p>
                    </div>
                    <Link 
                        href="/products" 
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2 font-medium hover:bg-gray-800 transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Products
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="bg-white border-b my-8 border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-light">
                        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-gray-900 transition-colors">Products</Link>
                        <span>/</span>
                        <span className="text-gray-900">{product.name}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Product Image */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="group"
                    >
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Product Details */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6 lg:space-y-8"
                    >
                        {/* Category */}
                        <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {getCategoryName(product.category)}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className="p-2 hover:bg-gray-50 transition-colors"
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                                </button>
                                <button className="p-2 hover:bg-gray-50 transition-colors">
                                    <Share2 className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Product Name */}
                        <h1 className="text-2xl lg:text-3xl font-light text-gray-900 leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-600 text-sm font-light">4.8 (256 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-2xl lg:text-3xl font-light text-gray-900">${product.price}</span>
                            <span className="text-lg text-gray-500 line-through font-light">${(product.price * 1.3)}</span>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <p className="text-gray-600 font-light leading-relaxed">
                                {product.description || "Experience premium quality and exceptional design with this carefully crafted product. Built with attention to detail and designed to exceed your expectations."}
                            </p>
                        </div>

                        

                        {/* Additional Info */}
                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3 text-sm">
                                <Truck className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-600 font-light">Free shipping on orders over $50</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-600 font-light">2-year manufacturer warranty</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <RotateCcw className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-600 font-light">30-day return policy</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
