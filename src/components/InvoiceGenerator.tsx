'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Printer, Plus, Trash2, RotateCcw } from 'lucide-react';

interface InvoiceItem {
    id: string;
    description: string;
    qty: number;
    price: number;
}

export default function InvoiceGenerator() {
    const t = useTranslations('Invoice');
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNr, setInvoiceNr] = useState('RE-' + new Date().getFullYear() + '-001');

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: 'Umzugsservice / Moving Service', qty: 1, price: 0 }
    ]);

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: '', qty: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        if (confirm('Reset form?')) {
            setCustomerName('');
            setCustomerAddress('');
            setItems([{ id: '1', description: 'Umzugsservice', qty: 1, price: 0 }]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300">

            {/* Controls (Hidden when printing) */}
            <div className="max-w-5xl mx-auto mb-8 print:hidden">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('title')}</h1>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">
                            <RotateCcw size={18} /> {t('reset')}
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg shadow-lg transition font-bold">
                            <Printer size={18} /> {t('print')}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 grid md:grid-cols-2 gap-6 transition-colors">
                    <div>
                        <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">{t('customerInfo')}</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('customerName')}</label>
                                <input
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    placeholder="Max Mustermann"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('customerAddress')}</label>
                                <textarea
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 h-20"
                                    placeholder="Musterstraße 1, 12345 Berlin"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">{t('createTitle')}</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('invoiceNr')}</label>
                                    <input
                                        value={invoiceNr}
                                        onChange={(e) => setInvoiceNr(e.target.value)}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('invoiceDate')}</label>
                                    <input
                                        type="date"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                    <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">{t('items')}</h2>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-2 items-center">
                                <input
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    placeholder={t('desc')}
                                    className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                />
                                <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                                    placeholder={t('qty')}
                                    className="w-20 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    min="1"
                                />
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                    placeholder={t('price')}
                                    className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    min="0"
                                />
                                <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addItem} className="mt-4 flex items-center gap-2 text-primary hover:text-primary-700 dark:text-primary-400 transition">
                        <Plus size={18} /> {t('addItem')}
                    </button>
                </div>
            </div>

            {/* Print Preview (A4 Page Styles) */}
            <div className="bg-white [&:not(:focus-within)]:overflow-hidden mx-auto shadow-2xl print:shadow-none print:w-full print:m-0 w-[210mm] min-h-[297mm] p-12 text-black relative print:absolute print:top-0 print:left-0" id="invoice">

                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b-2 border-primary pb-6">
                    <div className="flex items-center gap-4">
                        {/* Ensure logo exists in public folder or use placeholder */}
                        <img src="/logo-Circle.png" alt="Logo" className="w-20 h-20 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <div>
                            <h1 className="text-3xl font-bold text-primary">Zusammen Umzüge</h1>
                            <p className="text-sm text-gray-600">Professional Moving Service</p>
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <p className="font-bold text-lg mb-1">{t('createTitle')}</p>
                        <p><span className="text-gray-500">{t('invoiceNr')}:</span> {invoiceNr}</p>
                        <p><span className="text-gray-500">{t('invoiceDate')}:</span> {new Date(invoiceDate).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Addresses */}
                <div className="flex justify-between mb-16">
                    <div className="w-1/2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('customerInfo')}</h3>
                        <p className="font-bold text-lg">{customerName || '—'}</p>
                        <p className="whitespace-pre-line text-gray-700">{customerAddress || '—'}</p>
                    </div>
                    <div className="w-1/3 text-right">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('companyInfo')}</h3>
                        <p className="font-bold">Zusammen Umzüge</p>
                        <input
                            className="text-right text-sm w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none transition-colors"
                            placeholder="Mein Name / Inhaber"
                        />
                        <input
                            className="text-right text-sm w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none transition-colors"
                            placeholder="Meine Straße Nr."
                        />
                        <input
                            className="text-right text-sm w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none transition-colors"
                            placeholder="PLZ Stadt"
                        />
                        <p className="text-sm mt-2">{t('phone')}: 017644465156</p>
                        <p className="text-sm">{t('email')}: info@zusammen-umzuege.de</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-100">
                            <th className="text-left py-3 font-bold text-gray-600 w-1/2">{t('desc')}</th>
                            <th className="text-center py-3 font-bold text-gray-600">{t('qty')}</th>
                            <th className="text-right py-3 font-bold text-gray-600">{t('price')}</th>
                            <th className="text-right py-3 font-bold text-gray-600">{t('total')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-gray-50">
                                <td className="py-4 text-gray-800">{item.description}</td>
                                <td className="py-4 text-center text-gray-600">{item.qty}</td>
                                <td className="py-4 text-right text-gray-600">{item.price.toFixed(2)} €</td>
                                <td className="py-4 text-right font-medium text-gray-800">{(item.qty * item.price).toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-20">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>{t('subtotal')}:</span>
                            <span>{subtotal.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>{t('tax')}:</span>
                            <span>{tax.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t border-gray-200">
                            <span>{t('grandTotal')}:</span>
                            <span>{total.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Contact / Bank */}
                <div className="absolute bottom-12 left-12 right-12 border-t pt-8 text-sm text-gray-500 flex justify-between">
                    <div>
                        <h4 className="font-bold text-gray-700 mb-1">{t('contact')}</h4>
                        <p className="flex items-center gap-2"><span className="w-4">📞</span> 017644465156</p>
                        <p className="flex items-center gap-2"><span className="w-4">📧</span> info@zusammen-umzuege.de</p>
                        <p className="flex items-center gap-2"><span className="w-4">🌐</span> www.zusammen-umzuege.de</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-700 mb-1">{t('bankDetails')}</h4>
                        <p>Bank: Musterbank</p>
                        <p>IBAN: DE00 0000 0000 0000 0000 00</p>
                        <p>BIC: XXXXXXXXXXX</p>
                    </div>
                    <div className="text-right flex flex-col justify-end">
                        <p className="font-bold text-primary">{t('footerNote')}</p>
                    </div>
                </div>

            </div>

            <style jsx global>{`
                @media print {
                    body {
                        background: white;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:w-full {
                        width: 100% !important;
                    }
                    .print\\:m-0 {
                        margin: 0 !important;
                    }
                    .print\\:absolute {
                        position: absolute !important;
                    }
                    .print\\:top-0 {
                        top: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
