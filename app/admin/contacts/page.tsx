'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MessageCircle, Clock, User, Eye, Search, Filter } from 'lucide-react';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    createdAt: string;
}

const AdminContactsPage = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/listContacts');
            if (response.ok) {
                const data = await response.json();
                setContacts(data);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
        setLoading(false);
    };

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            contact.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterSubject === '' || contact.subject === filterSubject;
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSubjectColor = (subject: string) => {
        const colors = {
            general: 'bg-blue-100 text-blue-800',
            support: 'bg-red-100 text-red-800',
            sales: 'bg-green-100 text-green-800',
            partnership: 'bg-purple-100 text-purple-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[subject as keyof typeof colors] || colors.other;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b my-2 sm:my-4 border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-900 rounded-lg">
                                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Contact Messages</h1>
                                    <p className="text-xs sm:text-sm text-gray-500">{contacts.length} total messages</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
                <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="w-full">
                            <div className="relative">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-auto">
                            <div className="relative">
                                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <select
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="w-full sm:w-48 pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                >
                                    <option value="">All Subjects</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="sales">Sales</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contacts List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                <div className="space-y-3 sm:space-y-4">
                    {filteredContacts.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
                            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm sm:text-base">No contact messages found</p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <motion.div
                                key={contact.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{contact.name}</h3>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 mb-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                <span className="flex items-center gap-1 min-w-0">
                                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="truncate">{contact.email}</span>
                                                </span>
                                                {contact.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        <span>{contact.phone}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getSubjectColor(contact.subject)}`}>
                                                {contact.subject.charAt(0).toUpperCase() + contact.subject.slice(1)}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                {formatDate(contact.createdAt)}
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                                            {contact.message}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-end sm:justify-start gap-2 sm:ml-4 pt-2 sm:pt-0">
                                        <button
                                            onClick={() => setSelectedContact(contact)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Contact Detail Modal */}
            <AnimatePresence>
                {selectedContact && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
                        onClick={() => setSelectedContact(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto shadow-2xl mx-2 sm:mx-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Contact Details</h2>
                                <button
                                    onClick={() => setSelectedContact(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <p className="text-gray-900 text-sm sm:text-base break-words">{selectedContact.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <p className="text-gray-900 text-sm sm:text-base break-all">{selectedContact.email}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <p className="text-gray-900 text-sm sm:text-base">{selectedContact.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(selectedContact.subject)}`}>
                                            {selectedContact.subject.charAt(0).toUpperCase() + selectedContact.subject.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <p className="text-gray-900 text-sm sm:text-base">{formatDate(selectedContact.createdAt)}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                        <p className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">{selectedContact.message}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminContactsPage;