'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Printer, Plus, Trash2, RotateCcw, LogOut, Shield, Truck, Navigation, Layers } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InvoiceItem {
    id: string;
    description: string;
    qty: number;
    price: number;
}

export default function InvoiceGenerator() {
    const t = useTranslations('Invoice');
    const locale = useLocale();
    const router = useRouter();

    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNr, setInvoiceNr] = useState('RE-' + new Date().getFullYear() + '-001');

    // New Fields
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [distance, setDistance] = useState('');
    const [floor, setFloor] = useState('');
    const [elevator, setElevator] = useState('No');

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
            setFromAddress('');
            setToAddress('');
            setDistance('');
            setFloor('');
            setItems([{ id: '1', description: 'Umzugsservice', qty: 1, price: 0 }]);
        }
    };

    const handleLogout = async () => {
        await logout();
        Cookies.remove('admin_session');
        router.refresh();
        router.push('/');
    };

    // Auto-fill templates
    const applyTemplate = (type: string) => {
        let desc = '';
        switch (type) {
            case 'moving': desc = t('movingService'); break;
            case 'clearance': desc = t('clearanceService'); break;
            case 'transport': desc = t('furnitureTransport'); break;
            case 'kitchen': desc = t('kitchenAssembly'); break;
        }
        if (desc) {
            setItems([...items, { id: Date.now().toString(), description: desc, qty: 1, price: 0 }]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300">

            {/* Controls (Hidden when printing) */}
            <div className="max-w-6xl mx-auto mb-8 print:hidden">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <Truck className="text-primary" size={32} />
                        {t('title')}
                    </h1>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link href={`/${locale}/admin/users`} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition shadow-md">
                            <Shield size={18} /> {t('adminBtn')}
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition">
                            <LogOut size={18} /> Abmelden
                        </button>
                        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">
                            <RotateCcw size={18} /> {t('reset')}
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg shadow-lg transition font-bold">
                            <Printer size={18} /> {t('print')}
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Customer Info */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                        <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            {t('customerInfo')}
                        </h2>
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
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 h-24"
                                    placeholder="Musterstraße 1, 12345 Berlin"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Move Details */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                        <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Navigation size={18} /> Details
                        </h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('from')}</label>
                                    <input value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Berlin" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('to')}</label>
                                    <input value={toAddress} onChange={(e) => setToAddress(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Hamburg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('distance')}</label>
                                    <input value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('floor')}</label>
                                    <input value={floor} onChange={(e) => setFloor(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="EG" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('elevator')}</label>
                                    <select value={elevator} onChange={(e) => setElevator(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="Yes">Ja</option>
                                        <option value="No">Nein</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                        <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">{t('createTitle')}</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('invoiceNr')}</label>
                                <input
                                    value={invoiceNr}
                                    onChange={(e) => setInvoiceNr(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
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

                {/* Items Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg text-gray-700 dark:text-gray-200">{t('items')}</h2>
                        <div className="flex gap-2">
                            <select className="p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={(e) => { applyTemplate(e.target.value); e.target.value = ''; }}>
                                <option value="">{t('selectService')}</option>
                                <option value="moving">{t('movingService')}</option>
                                <option value="clearance">{t('clearanceService')}</option>
                                <option value="transport">{t('furnitureTransport')}</option>
                                <option value="kitchen">{t('kitchenAssembly')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-2 items-center flex-wrap md:flex-nowrap">
                                <input
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    placeholder={t('desc')}
                                    className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-full md:w-auto"
                                />
                                <div className="flex gap-2 w-full md:w-auto">
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
                            </div>
                        ))}
                    </div>
                    <button onClick={addItem} className="mt-4 flex items-center gap-2 text-primary hover:text-primary-700 dark:text-primary-400 transition font-medium">
                        <Plus size={18} /> {t('addItem')}
                    </button>

                    {/* Live Totals */}
                    <div className="mt-8 border-t dark:border-gray-700 pt-4 flex justify-end">
                        <div className="w-64 space-y-2 text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span>{t('subtotal')}</span>
                                <span>{subtotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('tax')} (19%)</span>
                                <span>{tax.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl text-primary mt-2 pt-2 border-t dark:border-gray-700">
                                <span>{t('grandTotal')}</span>
                                <span>{total.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Preview (A4 Page Styles) */}
            <div className="bg-white [&:not(:focus-within)]:overflow-hidden mx-auto shadow-2xl print:shadow-none print:w-full print:m-0 w-[210mm] min-h-[297mm] p-12 text-black relative print:absolute print:top-0 print:left-0" id="invoice">

                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b-2 border-primary pb-6">
                    <div className="flex items-center gap-4">
                        {/* Ensure logo exists in public folder or use placeholder */}
                        <img src="/logo-transparent-final.png" alt="Logo" className="w-20 h-20 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <div>
                            <h1 className="text-3xl font-bold text-primary">Zusammen Umzüge</h1>
                            <p className="text-sm text-gray-600">Professionelle Umzüge & Transporte</p>
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <p className="font-bold text-lg mb-1 text-primary">{t('createTitle')}</p>
                        <p className="font-mono text-gray-600">{invoiceNr}</p>
                        <p className="text-gray-500 mt-1">{new Date(invoiceDate).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Addresses */}
                <div className="flex justify-between mb-12">
                    <div className="w-1/2 pr-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">{t('customerInfo')}</h3>
                        <p className="font-bold text-lg">{customerName || '—'}</p>
                        <p className="whitespace-pre-line text-gray-700 mb-4">{customerAddress || '—'}</p>

                        {(fromAddress || toAddress) && (
                            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                                <h4 className="font-bold text-gray-500 mb-1 text-xs uppercase">Umzugsdetails</h4>
                                {fromAddress && <p><span className="font-semibold text-gray-500 w-12 inline-block">{t('from')}:</span> {fromAddress}</p>}
                                {toAddress && <p><span className="font-semibold text-gray-500 w-12 inline-block">{t('to')}:</span> {toAddress}</p>}
                                <div className="flex gap-4 mt-1 text-xs text-gray-400">
                                    {distance && <span>{distance} km</span>}
                                    {floor && <span>{t('floor')}: {floor}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-1/3 text-right">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">{t('companyInfo')}</h3>
                        <p className="font-bold">Zusammen Umzüge</p>
                        <p className="text-gray-600 flex justify-end items-center gap-1">
                            Inh.
                            <input className="bg-transparent border-b border-gray-300 w-32 text-right focus:border-primary outline-none print:border-none" placeholder="" />
                        </p>
                        <p className="text-gray-600">Bochumer Str</p>
                        <p className="text-gray-600">45276 Essen</p>

                        <div className="mt-4 text-sm text-gray-600">
                            <p>{t('phone')}: 0178 272 2300</p>
                            <p>{t('email')}: info@zusammenumzuege.de</p>
                            <p>St-ID: 112/5334/3807</p>
                        </div>
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
                        <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t-2 border-primary/20">
                            <span>{t('grandTotal')}:</span>
                            <span>{total.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Contact / Bank */}
                <div className="absolute bottom-12 left-12 right-12 border-t pt-6 text-xs text-gray-500 flex justify-between">
                    <div>
                        <h4 className="font-bold text-gray-700 mb-1">{t('contact')}</h4>
                        <p>Tel: 0178 272 2300</p>
                        <p>Email: info@zusammenumzuege.de</p>
                        <p>Web: www.zusammen-umzuege.de</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-700 mb-1">{t('bankDetails')}</h4>
                        <p>Bank: Sparkasse Essen</p>
                        <p>IBAN: DE12 3456 7890 1234 56</p>
                        <p>BIC: ABCDEFGH</p>
                    </div>
                    <div className="text-right flex flex-col justify-end">
                        <p className="font-bold text-primary text-base italic">{t('footerNote')}</p>
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
