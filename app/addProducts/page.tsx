'use client'
import { useState } from 'react';

interface FormData {
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    categoryId: string;
    categoryName: string;
    isRecurring: boolean;
    interval: 'day' | 'week' | 'month' | 'year' | '';
}

export default function AddProductsPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        categoryId: '',
        categoryName: '',
        isRecurring: false,
        interval: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
                categoryName: formData.categoryName || undefined,
                interval: formData.isRecurring ? formData.interval : undefined,
                imageUrl: formData.imageUrl || undefined
            };

            const response = await fetch('/api/addProducts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const result = await response.json();

            if (result.success) {
                setMessage('Product created successfully!');
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    imageUrl: '',
                    categoryId: '',
                    categoryName: '',
                    isRecurring: false,
                    interval: ''
                });
            } else {
                setMessage(`Error: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked,
                // Reset interval when unchecking recurring
                ...(name === 'isRecurring' && !checked ? { interval: '' } : {})
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
                // Clear categoryName when categoryId is selected and vice versa
                ...(name === 'categoryId' && value ? { categoryName: '' } : {}),
                ...(name === 'categoryName' && value ? { categoryId: '' } : {})
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add New Product</h1>
                
                {message && (
                    <div className={`mb-4 p-3 rounded-lg ${
                        message.includes('Error') 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter product name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter product description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (USD) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                        </label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category ID
                            </label>
                            <input
                                type="number"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Existing category ID"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                name="categoryName"
                                value={formData.categoryName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="New/existing category"
                            />
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                        Use either Category ID (for existing categories) OR Category Name (to create/connect by name)
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                name="isRecurring"
                                checked={formData.isRecurring}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700">
                                Recurring/Subscription Product
                            </label>
                        </div>

                        {formData.isRecurring && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Interval *
                                </label>
                                <select
                                    name="interval"
                                    value={formData.interval}
                                    onChange={handleChange}
                                    required={formData.isRecurring}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select interval</option>
                                    <option value="day">Daily</option>
                                    <option value="week">Weekly</option>
                                    <option value="month">Monthly</option>
                                    <option value="year">Yearly</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.name || !formData.price || (formData.isRecurring && !formData.interval)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                        {loading ? 'Creating in Stripe & Database...' : 'Create Product'}
                    </button>
                </form>
            </div>
        </div>
    );
}