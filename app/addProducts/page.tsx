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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage('Please select a valid image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setMessage('Image size must be less than 5MB');
                return;
            }

            setSelectedFile(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Upload API error:', errorData);
                throw new Error(errorData.error || 'Failed to upload image');
            }
    
            const data = await response.json();
            console.log('Upload successful:', data);
            return data.url;
        } catch (error) {
            console.error('Image upload error:', error);
            throw new Error('Failed to upload image');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            let finalImageUrl = formData.imageUrl;

            if (uploadMethod === 'upload' && selectedFile) {
                setMessage('Uploading image...');
                finalImageUrl = await uploadImage(selectedFile);
            }

            const productData = {
                ...formData,
                imageUrl: finalImageUrl,
                price: parseFloat(formData.price),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
                categoryName: formData.categoryName || undefined,
                interval: formData.isRecurring ? formData.interval : undefined,
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
                setSelectedFile(null);
                setImagePreview('');
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
                ...(name === 'isRecurring' && !checked ? { interval: '' } : {})
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
                ...(name === 'categoryId' && value ? { categoryName: '' } : {}),
                ...(name === 'categoryName' && value ? { categoryId: '' } : {})
            });
        }
    };

    const handleUploadMethodChange = (method: 'url' | 'upload') => {
        setUploadMethod(method);
        if (method === 'url') {
            setSelectedFile(null);
            setImagePreview('');
        } else {
            setFormData({ ...formData, imageUrl: '' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light text-gray-900 mb-2">Create Product</h1>
                    <p className="text-gray-500 text-sm">Add a new product to your store</p>
                </div>
                
                {/* Main Form Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                            message.includes('Error') || message.includes('Failed')
                                ? 'bg-red-50 text-red-600 border border-red-100' 
                                : message.includes('Uploading')
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Product Details Section */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors text-lg"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 transition-all resize-none"
                                        placeholder="Describe your product..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Price (USD)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            required
                                            className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 transition-all text-lg"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">Product Image</h3>
                            
                            {/* Upload Method Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                                <button
                                    type="button"
                                    onClick={() => handleUploadMethodChange('url')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                        uploadMethod === 'url'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleUploadMethodChange('upload')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                        uploadMethod === 'upload'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Upload
                                </button>
                            </div>

                            {/* URL Input */}
                            {uploadMethod === 'url' && (
                                <div className="space-y-4">
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 transition-all"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {formData.imageUrl && (
                                        <div className="flex justify-center">
                                            <img
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-100 shadow-sm"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* File Upload */}
                            {uploadMethod === 'upload' && (
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                    <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 font-medium">Drop your image here, or browse</p>
                                                    <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {selectedFile && (
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span className="font-medium">{selectedFile.name}</span>
                                                <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                    )}

                                    {imagePreview && (
                                        <div className="flex flex-col items-center space-y-3">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-100 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setImagePreview('');
                                                }}
                                                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Category Section */}
                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">Category</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Category ID
                                    </label>
                                    <input
                                        type="number"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 transition-all"
                                        placeholder="Existing ID"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        name="categoryName"
                                        value={formData.categoryName}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 transition-all"
                                        placeholder="New category"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                                Use Category ID for existing categories or Category Name to create new ones
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading || !formData.name || !formData.price || (formData.isRecurring && !formData.interval)}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-medium text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating Product...</span>
                                    </div>
                                ) : (
                                    'Create Product'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}