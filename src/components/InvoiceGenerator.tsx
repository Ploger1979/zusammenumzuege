'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Printer, Plus, Trash2, RotateCcw, LogOut, Shield, Truck, Navigation, Layers } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
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

    const searchParams = useSearchParams();
    const requestId = searchParams.get('request_id');

    useEffect(() => {
        if (requestId) {
            loadRequestData(requestId);
        }
    }, [requestId]);

    async function loadRequestData(id: string) {
        if (id === 'demo-request') {
            setCustomerName('Max Mustermann');
            setCustomerAddress('Musterstraße 12, 10115 Berlin');
            setFromAddress('Musterstraße 12, 10115 Berlin');
            setToAddress('Beispielweg 99, 20095 Hamburg');
            setDistance('290');
            setFloor('2');
            setElevator('No');
            setCompanyOwner('Ayman Ploger');
            setCompanyAddress('Umzugsweg 1');
            setCompanyCity('12345 Berlin');
            setCompanyTaxId('DE123456789');

            setItems([
                { id: '1', description: t('movingService'), qty: 5, price: 50 },
                { id: '2', description: t('cartons'), qty: 20, price: 2.5 },
                { id: '3', description: 'Waschmaschine Transport', qty: 1, price: 50 }
            ]);
            return;
        }

        try {
            const res = await fetch(`/api/requests/${id}`);
            const data = await res.json();
            if (data.success && data.request) {
                const r = data.request;
                setCustomerName(`${r.customer.firstName} ${r.customer.lastName}`);
                setCustomerAddress(r.addresses.from || ''); // Default billing to 'From'
                setFromAddress(r.addresses.from);
                setToAddress(r.addresses.to);
                setFloor(r.details.floorsFrom ? String(r.details.floorsFrom) : '');
                setElevator(r.details.elevatorFrom ? 'Yes' : 'No');

                // Map items
                const newItems: InvoiceItem[] = r.items.map((item: any, idx: number) => ({
                    id: Date.now().toString() + idx,
                    description: item.key === 'cartons' ? t('cartons') : (item.label || item.key),
                    qty: item.qty || 1,
                    price: 0
                }));

                // Add base service if empty or just specific items
                if (newItems.length === 0) {
                    newItems.push({ id: '1', description: t('movingService'), qty: 1, price: 0 });
                }

                setItems(newItems);
            }
        } catch (error) {
            console.error('Error loading request', error);
        }
    }

    // New Fields
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [distance, setDistance] = useState('');
    const [floor, setFloor] = useState('');
    const [elevator, setElevator] = useState('No');

    // Company Info Fields
    const [companyOwner, setCompanyOwner] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyCity, setCompanyCity] = useState('');
    const [companyTaxId, setCompanyTaxId] = useState('');

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: t('movingService'), qty: 1, price: 0 }
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

    const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const calculateTax = () => calculateSubtotal() * 0.19;
    const calculateTotal = () => calculateSubtotal() + calculateTax();

    const handlePrint = () => {
        window.print();
    };

    const resetForm = () => {
        if (confirm('Reset form?')) {
            setCustomerName('');
            setCustomerAddress('');
            setFromAddress('');
            setToAddress('');
            setDistance('');
            setFloor('');
            setCompanyOwner('');
            setCompanyAddress('');
            setCompanyCity('');
            setCompanyTaxId('');
            setItems([{ id: '1', description: t('movingService'), qty: 1, price: 0 }]);
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4 font-sans print:p-0 print:bg-white text-gray-900 dark:text-white transition-colors duration-300">

            {/* Header / Navigation */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-[#FFC107] flex items-center gap-2">
                    <Printer className="text-[#FFC107]" />
                    {t('title')}
                </h1>
                <div className="flex gap-3">
                    <button
                        onClick={resetForm}
                        className="px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition"
                    >
                        <RotateCcw size={18} />
                        {t('reset')}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2 bg-[#FFC107] text-black font-bold rounded-lg hover:bg-[#ffb300] shadow-lg flex items-center gap-2 transition"
                    >
                        <Printer size={18} />
                        {t('print')}
                    </button>
                </div>
            </div>

            {/* Split View Container - PROPOSED CHANGE: Stacked Layout */}
            <div className="max-w-5xl mx-auto flex flex-col gap-12 print:block print:max-w-none">

                {/* 1. INPUT FORM (Hidden in Print) */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 h-fit print:hidden transition-colors duration-300">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-[#FFC107] mb-4 border-b border-gray-200 dark:border-gray-600 pb-2 flex items-center gap-2">
                        <Layers size={20} className="text-[#FFC107]" />
                        {t('createTitle')}
                    </h2>

                    <div className="space-y-6">
                        {/* Meta Data */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('invoiceDate')}</label>
                                <input
                                    type="date"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('invoiceNr')}</label>
                                <input
                                    type="text"
                                    value={invoiceNr}
                                    onChange={(e) => setInvoiceNr(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300 font-semibold">
                                <Shield size={16} /> {t('customerInfo')}
                            </div>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                                className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                placeholder={t('customerName')}
                            />
                            <textarea
                                placeholder={t('customerAddress')}
                                value={customerAddress}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomerAddress(e.target.value)}
                                rows={3}
                                className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white resize-none focus:border-[#FFC107] focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Company Info Input */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300 font-semibold">
                                <Shield size={16} /> {t('companyInfo')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Inh."
                                    value={companyOwner}
                                    onChange={(e) => setCompanyOwner(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Steuer-Nr."
                                    value={companyTaxId}
                                    onChange={(e) => setCompanyTaxId(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Adresse"
                                    value={companyAddress}
                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="PLZ/Ort"
                                    value={companyCity}
                                    onChange={(e) => setCompanyCity(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Move Details */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-[#FFC107] font-semibold">
                                <Truck size={16} /> Details
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder={t('from')} value={fromAddress} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromAddress(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors" />
                                <input type="text" placeholder={t('to')} value={toAddress} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToAddress(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors" />
                                <div className="relative">
                                    <input type="number" placeholder={t('distance')} value={distance} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistance(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 ps-8 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors" />
                                    <Navigation size={14} className="absolute top-3 start-2.5 text-gray-400" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder={t('floor')} value={floor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFloor(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors" />
                                    <select value={elevator} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setElevator(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors">
                                        <option value="No" className="text-black dark:text-white">{t('noElevator')}</option>
                                        <option value="Yes" className="text-black dark:text-white">{t('elevator')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Items Manager */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex justify-between items-center">
                                <span>{t('items')}</span>
                                <button onClick={addItem} className="text-[#FFC107] hover:text-[#ffb300] text-xs flex items-center gap-1 font-bold transition">
                                    <Plus size={14} /> {t('addItem')}
                                </button>
                            </h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-2 items-start bg-gray-50 dark:bg-[#0f172a] p-2 rounded border border-gray-200 dark:border-gray-700 group hover:border-[#FFC107] transition transition-colors">
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                            className="flex-grow min-w-0 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#FFC107] outline-none text-sm py-1 text-gray-900 dark:text-white transition-colors"
                                            placeholder={t('desc')}
                                        />
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                                            className="w-16 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#FFC107] outline-none text-sm py-1 text-center text-gray-900 dark:text-white transition-colors"
                                            placeholder={t('qty')}
                                        />
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                            className="w-20 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#FFC107] outline-none text-sm py-1 text-end text-gray-900 dark:text-white transition-colors"
                                            placeholder={t('price')}
                                        />
                                        <div className="w-20 text-end py-1 text-sm font-medium opacity-60 text-gray-900 dark:text-white">
                                            {(item.qty * item.price).toFixed(2)}€
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* 2. LIVE PREVIEW (The Paper) */}
                <div className="relative">
                    {/* Sticky Header for Mobile Print Button */}
                    <div className="lg:hidden mb-4 flex justify-end">
                        <button onClick={handlePrint} className="bg-[#FFC107] px-4 py-2 rounded font-bold shadow-lg">
                            {t('previewTitle')}
                        </button>
                    </div>

                    {/* The A4 Paper Container */}
                    <div
                        id="invoice"
                        className="bg-white text-black shadow-2xl mx-auto print:shadow-none print:m-0 relative overflow-hidden"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '40px', // Standard internal padding
                            fontFamily: 'Arial, sans-serif'
                        }}
                    >
                        {/* ---------------- WATERMARK ---------------- */}
                        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                            {/* Assuming logo exists at /logo.png based on previous context, usually it's public/logo.png */}
                            <img
                                src="/logo.png"
                                alt="Watermark"
                                className="w-[80%] opacity-[0.04] grayscale rotate-[-12deg]"
                            />
                        </div>
                        {/* ------------------------------------------- */}

                        <div className="relative z-10 flex flex-col h-full justify-between">

                            {/* TOP SECTION */}
                            <div>
                                {/* Header: Logo & Company */}
                                <div className="flex justify-between items-start border-b-4 border-[#16a34a] pb-6 mb-8">
                                    <div className="flex flex-col gap-2">
                                        <img src="/logo.png" alt="Zusammen Umzüge" className="h-20 w-auto object-contain" />
                                        <p className="text-xs text-gray-500 max-w-[200px] leading-tight mt-2">
                                            Zusammen Umzüge<br />
                                            Ihr zuverlässiger Partner für<br />
                                            Zusammen Umzüge<br />
                                            {t('slogan')}
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <h1 className="text-4xl font-extrabold text-[#16a34a] uppercase tracking-widest mb-2">{t('invoiceTitle')}</h1>
                                        <p className="text-sm font-bold text-gray-600">{t('invoiceNr')} <span className="text-black text-lg">{invoiceNr}</span></p>
                                        <p className="text-sm font-bold text-gray-600">{t('date')}: <span className="text-black">{new Date(invoiceDate).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')}</span></p>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="flex justify-between mb-12 gap-8">
                                    {/* Receiver */}
                                    <div className="w-1/2">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">{t('customerInfo')}</h3>
                                        <div className="text-base font-bold text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            {customerName || 'Musterkunde Name'}<br />
                                            <span className="font-normal whitespace-pre-line text-gray-700">
                                                {customerAddress || 'Musterstraße 123\n12345 Musterstadt'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sender Details (Small) */}
                                    <div className="w-1/3 text-end text-sm text-gray-600 space-y-1">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{t('companyInfo')}</h3>
                                        <p className="font-bold text-gray-900">Zusammen Umzüge</p>
                                        <p>Inh. {companyOwner}</p>
                                        <p>{companyAddress}</p>
                                        <p>{companyCity}</p>
                                        <p className="mt-2 text-[#16a34a]">{t('taxId')}: {companyTaxId}</p>
                                    </div>
                                </div>

                                {/* Move Details (Yellow Bar) */}
                                <div className="bg-[#FFC107]/10 border-s-4 border-[#FFC107] p-4 mb-8 rounded-e-lg">
                                    <h3 className="text-xs font-bold text-[#b45309] uppercase mb-2 flex items-center gap-2">
                                        <Truck size={14} /> {t('moveDetails')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-800">
                                        <div className="flex justify-between border-b border-[#FFC107]/20 pb-1">
                                            <span className="text-gray-500">{t('from')}:</span>
                                            <span className="font-medium truncate ms-2 text-end">{fromAddress || '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#FFC107]/20 pb-1">
                                            <span className="text-gray-500">{t('to')}:</span>
                                            <span className="font-medium truncate ms-2 text-end">{toAddress || '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#FFC107]/20 pb-1">
                                            <span className="text-gray-500">{t('date')}:</span>
                                            <span className="font-medium text-end">{new Date(invoiceDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#FFC107]/20 pb-1">
                                            <span className="text-gray-500">{t('info')}:</span>
                                            <span className="font-medium text-end">
                                                {distance ? `${distance} km` : ''}
                                                {floor ? ` | ${t('floor')} ${floor}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="bg-[#16a34a] text-white text-sm uppercase">
                                            <th className="py-3 px-4 text-start rounded-s-md w-16 text-center">Pos.</th>
                                            <th className="py-3 px-4 text-start">{t('desc')}</th>
                                            <th className="py-3 px-4 text-center w-24">{t('qty')}</th>
                                            <th className="py-3 px-4 text-end w-32">{t('price')}</th>
                                            <th className="py-3 px-4 text-end rounded-e-md w-32">{t('total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700 text-sm">
                                        {items.map((item, index) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors even:bg-gray-50/50">
                                                <td className="py-3 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                                                <td className="py-3 px-4 font-medium">{item.description}</td>
                                                <td className="py-3 px-4 text-center">{item.qty}</td>
                                                <td className="py-3 px-4 text-end">{item.price.toFixed(2)} €</td>
                                                <td className="py-3 px-4 text-end font-bold text-gray-900">
                                                    {(item.qty * item.price).toFixed(2)} €
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Filler/Empty Rows for visual balance if short */}
                                        {items.length < 3 && Array(3 - items.length).fill(null).map((_, i) => (
                                            <tr key={`empty-${i}`} className="h-12 border-b border-gray-50">
                                                <td colSpan={5}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* BOTTOM SECTION */}
                            <div className="avoid-break-inside">
                                {/* Totals */}
                                <div className="flex justify-end mb-8">
                                    <div className="w-1/2 md:w-1/3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>{t('subtotal')}</span>
                                            <span>{calculateSubtotal().toFixed(2)} €</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>{t('tax')}</span>
                                            <span>{calculateTax().toFixed(2)} €</span>
                                        </div>
                                        <div className="border-t border-gray-300 my-2 pt-2 flex justify-between font-extrabold text-xl text-[#16a34a]">
                                            <span>{t('grandTotal')}</span>
                                            <span>{calculateTotal().toFixed(2)} €</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-6 text-xs text-gray-500">
                                    <div>
                                        {/* Bank Details Removed per user request */}
                                    </div>
                                    <div className="text-end">
                                        <h4 className="font-bold text-gray-700 uppercase mb-2">{t('contact')}</h4>
                                        <p>{t('phone')}: +49 178 2722300</p>
                                        <p>{t('email')}: info@zusammen-umzuege.de</p>
                                        <p>{t('web')}: www.zusammen-umzuege.de</p>
                                        <p className="mt-2 italic">{t('footerNote')}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
