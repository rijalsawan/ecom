'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Save, X, Package, AlertCircle, Star } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category?: {
        id: string;
        name: string;
    };
    images?: string[];
    imageUrl?: string;
    active?: boolean;
}

const AllProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/listProducts');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product.id);
        setEditForm({
            name: product.name,
            description: product.description,
            price: product.price,
            active: product.active
        });
    };

    const handleSave = async (productId: string) => {
        try {
            const response = await fetch('/api/updateProduct', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, ...editForm })
            });

            if (response.ok) {
                await fetchProducts();
                setEditingProduct(null);
                setEditForm({});
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleDelete = async (productId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/deleteProduct?id=${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchProducts();
                setDeleteConfirm(null);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
        setLoading(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        },
        exit: { 
            opacity: 0, 
            scale: 0.8,
            y: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-gradient-to-r from-indigo-500 to-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl font-medium text-gray-600"
                    >
                        Loading products...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            variants={floatingVariants}
                            animate="animate"
                            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg"
                        >
                            <Package className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Product Management
                            </h1>
                            <p className="text-gray-600 mt-1">Manage your products with style</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto p-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8"
                >
                    <AnimatePresence mode="popLayout">
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                variants={cardVariants}
                                layout
                                onHoverStart={() => setHoveredCard(product.id)}
                                onHoverEnd={() => setHoveredCard(null)}
                                className="group relative"
                            >
                                <motion.div
                                    className="bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-white/20"
                                    whileHover={{ 
                                        y: -8,
                                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    {editingProduct === product.id ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-6 space-y-6"
                                        >
                                            <div className="text-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-800">Edit Product</h3>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <motion.input
                                                    whileFocus={{ scale: 1.02 }}
                                                    type="text"
                                                    value={editForm.name || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full p-4 bg-white/50 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                                                    placeholder="Product name"
                                                />
                                                
                                                <motion.textarea
                                                    whileFocus={{ scale: 1.02 }}
                                                    value={editForm.description || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    className="w-full p-4 bg-white/50 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-400"
                                                    rows={3}
                                                    placeholder="Product description"
                                                />
                                                
                                                <motion.input
                                                    whileFocus={{ scale: 1.02 }}
                                                    type="number"
                                                    value={editForm.price || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                                    className="w-full p-4 bg-white/50 border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                                                    placeholder="Price"
                                                />
                                                
                                                <motion.div 
                                                    whileHover={{ scale: 1.02 }}
                                                    className="flex items-center gap-3 p-3 bg-white/30 rounded-xl"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.active || false}
                                                        onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                                    />
                                                    <span className="font-medium text-gray-700">Active Product</span>
                                                </motion.div>
                                            </div>
                                            
                                            <div className="flex gap-3 pt-4">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleSave(product.id)}
                                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-2xl flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    <Save className="w-5 h-5" />
                                                    Save Changes
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setEditingProduct(null);
                                                        setEditForm({});
                                                    }}
                                                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white p-3 rounded-2xl flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    <X className="w-5 h-5" />
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <>
                                            {/* Product Image */}
                                            <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                                                {product.imageUrl || (product.images && product.images[0]) ? (
                                                    <motion.img
                                                        src={product.imageUrl || product.images![0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        whileHover={{ scale: 1.1 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                ) : (
                                                    <motion.div 
                                                        className="w-full h-full flex items-center justify-center"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        <Package className="w-16 h-16 text-indigo-300" />
                                                    </motion.div>
                                                )}
                                                
                                                {/* Status Badge */}
                                                

                                                {/* Hover Actions */}
                                                <AnimatePresence>
                                                    {hoveredCard === product.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3"
                                                        >
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleEdit(product)}
                                                                className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-indigo-600 shadow-lg hover:bg-white transition-all duration-200"
                                                            >
                                                                <Edit2 className="w-5 h-5" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, rotate: -5 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => setDeleteConfirm(product.id)}
                                                                className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-red-600 shadow-lg hover:bg-white transition-all duration-200"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Product Details */}
                                            <div className="p-6">
                                                <motion.h3 
                                                    className="text-xl font-bold text-gray-900 mb-2 line-clamp-1"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    {product.name}
                                                </motion.h3>

                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                    {product.description || 'No description available'}
                                                </p>

                                                <div className="flex justify-between items-center mb-4">
                                                    <motion.span 
                                                        className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        ${product.price?.toFixed(2) || '0.00'}
                                                    </motion.span>
                                                    
                                                    <motion.div 
                                                        className="flex items-center gap-1"
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                        ))}
                                                    </motion.div>
                                                </div>

                                                {product.category && (
                                                    <motion.div 
                                                        className="flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                                                        whileHover={{ scale: 1.02 }}
                                                    >
                                                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-indigo-700">
                                                            {product.category.name}
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {products.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center py-20"
                    >
                        <motion.div
                            variants={floatingVariants}
                            animate="animate"
                            className="inline-block p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-6"
                        >
                            <Package className="w-20 h-20 text-indigo-400" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">No products found</h3>
                        <p className="text-gray-600 text-lg">Start building your amazing product catalog!</p>
                    </motion.div>
                )}
            </div>

            {/* Enhanced Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20"
                        >
                            <motion.div 
                                className="flex items-center gap-4 mb-6"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Confirm Delete</h3>
                            </motion.div>
                            
                            <motion.p 
                                className="text-gray-600 mb-8 leading-relaxed"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product from your catalog.
                            </motion.p>
                            
                            <motion.div 
                                className="flex gap-4"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Delete Product
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Cancel
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllProductsPage;
