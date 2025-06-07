'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Save, X, Package, AlertCircle, Plus, Search } from 'lucide-react';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredProducts(filtered);
    }, [products, searchTerm]);

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
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-900 rounded-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                                    <p className="text-sm text-gray-500">{filteredProducts.length} total products</p>
                                </div>
                            </div>
                            
                            {/* Search and Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none w-full sm:w-64"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Product</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                                >
                                    {editingProduct === product.id ? (
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={editForm.name || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                                    placeholder="Product name"
                                                />
                                                
                                                <textarea
                                                    value={editForm.description || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
                                                    rows={3}
                                                    placeholder="Product description"
                                                />
                                                
                                                <input
                                                    type="number"
                                                    value={editForm.price || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                                    placeholder="Price"
                                                />
                                                
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.active || false}
                                                        onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                                                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                                    />
                                                    <span className="text-sm text-gray-700">Active</span>
                                                </label>
                                            </div>
                                            
                                            <div className="flex gap-2 mt-6">
                                                <button
                                                    onClick={() => handleSave(product.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(null);
                                                        setEditForm({});
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Image */}
                                            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                                {product.imageUrl || (product.images && product.images[0]) ? (
                                                    <img
                                                        src={product.imageUrl || product.images![0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-gray-300" />
                                                    </div>
                                                )}
                                                
                                                {/* Status */}
                                                {product.active !== undefined && (
                                                    <div className="absolute top-3 right-3">
                                                        <span className={`inline-block w-2 h-2 rounded-full ${
                                                            product.active ? 'bg-green-400' : 'bg-gray-400'
                                                        }`} />
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(product.id)}
                                                        className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                                    {product.description || 'No description'}
                                                </p>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        ${product.price?.toFixed(2) || '0.00'}
                                                    </span>
                                                    {product.category && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                            {product.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                            </div>
                            
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this product? This action cannot be undone.
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllProductsPage;
