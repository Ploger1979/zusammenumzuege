'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

type ItemKey = 'washing_machine' | 'dryer' | 'bed' | 'table' | 'cupboard';

interface ItemState {
    active: boolean;
    qty: number;
    // Specifics
    bedSize?: string; // '90x200', '140x200', '180x200', 'custom'
    width?: string;
    length?: string;
    height?: string;
    depth?: string;
}

export default function QuoteFormFull() {
    const t = useTranslations('QuoteFormFull');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Item States
    const [items, setItems] = useState<Record<ItemKey, ItemState>>({
        washing_machine: { active: false, qty: 1 },
        dryer: { active: false, qty: 1 },
        bed: { active: false, qty: 1, bedSize: '90x200' },
        table: { active: false, qty: 1, width: '', length: '' },
        cupboard: { active: false, qty: 1, width: '', height: '', depth: '' },
    });

    const updateItem = (key: ItemKey, updates: Partial<ItemState>) => {
        setItems(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
    };

    const toggleItem = (key: ItemKey) => {
        updateItem(key, { active: !items[key].active });
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);

        // Prepare Items Array
        const itemsList = [];
        for (const [key, state] of Object.entries(items)) {
            if (state.active) {
                let size = {};
                let label = key;
                if (key === 'bed') {
                    label = `Bett (${state.bedSize})`;
                    if (state.bedSize === 'custom') {
                        size = { width: Number(state.width), length: Number(state.length) };
                    } else if (state.bedSize) {
                        const [w, l] = state.bedSize.split('x').map(Number);
                        size = { width: w, length: l };
                    }
                } else if (key === 'table') {
                    label = 'Tisch';
                    size = { width: Number(state.width), length: Number(state.length) };
                } else if (key === 'cupboard') {
                    label = 'Schrank';
                    size = { width: Number(state.width), height: Number(state.height), depth: Number(state.depth) };
                } else if (key === 'washing_machine') label = 'Waschmaschine';
                else if (key === 'dryer') label = 'Trockner';

                itemsList.push({ key, qty: state.qty, label, size });
            }
        }

        const payload = {
            customer: {
                firstName: fd.get('firstName'),
                lastName: fd.get('lastName'),
                phone: fd.get('phone'),
                email: fd.get('email'),
            },
            moveType: fd.get('moveType'),
            services: fd.getAll('services'),
            addresses: {
                from: fd.get('addressFrom'),
                to: fd.get('addressTo'),
            },
            details: {
                floorsFrom: Number(fd.get('floorsFrom')),
                floorsTo: Number(fd.get('floorsTo')),
                elevatorFrom: fd.get('elevatorFrom') === 'on',
                elevatorTo: fd.get('elevatorTo') === 'on',
                parking: fd.get('parking') === 'on',
                assembly: fd.get('assembly') === 'on',
                date: fd.get('date'),
            },
            items: itemsList,
            message: fd.get('message'),
        };

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) setSuccess(true);
            else alert('Fehler bei der Übermittlung. Bitte prüfen Sie Ihre Eingaben.');
        } catch (error) {
            console.error(error);
            alert('Ein Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-lg text-center transition-colors duration-300">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✓</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('successTitle')}</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">{t('successMsg')}</p>
            </div>
        );
    }

    const SERVICES = [
        { id: 'Umzug', label: t('services.move') },
        { id: 'Entrümpelung', label: t('services.clearance') },
        { id: 'Transport', label: t('services.transport') },
        { id: 'Packservice', label: t('services.packing') },
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-2xl shadow-xl space-y-10 border border-gray-100 dark:border-gray-700 transition-colors duration-300">

            {/* Step 1: Basic Info */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">{t('step1')}</h3>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-200">
                        <input type="radio" name="moveType" value="privat" defaultChecked className="w-5 h-5 text-primary focus:ring-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <span className="text-lg">{t('privateMove')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-200">
                        <input type="radio" name="moveType" value="firma" className="w-5 h-5 text-primary focus:ring-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <span className="text-lg">{t('companyMove')}</span>
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {SERVICES.map(s => (
                        <label key={s.id} className="flex items-center gap-2 p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors">
                            <input type="checkbox" name="services" value={s.id} className="w-5 h-5 rounded text-primary focus:ring-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                            <span>{s.label}</span>
                        </label>
                    ))}
                </div>
            </section>

            {/* Step 2: Addresses */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">{t('step2')}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* From */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-primary-700 dark:text-primary-400">{t('addressFrom')}</h4>
                        <input required name="addressFrom" placeholder={t('placeholderAddress')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('floor')}</label>
                                <input type="number" name="floorsFrom" defaultValue={0} min={0} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <div className="w-1/2 flex items-center pt-5">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                                    <input type="checkbox" name="elevatorFrom" className="h-4 w-4 text-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                                    <span>{t('elevator')}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* To */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-secondary dark:text-secondary-400">{t('addressTo')}</h4>
                        <input required name="addressTo" placeholder={t('placeholderAddress')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('floor')}</label>
                                <input type="number" name="floorsTo" defaultValue={0} min={0} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <div className="w-1/2 flex items-center pt-5">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                                    <input type="checkbox" name="elevatorTo" className="h-4 w-4 text-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                                    <span>{t('elevator')}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                        <input type="checkbox" name="parking" className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <span>{t('parking')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                        <input type="checkbox" name="assembly" className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <span>{t('assembly')}</span>
                    </label>
                </div>
            </section>

            {/* Step 3: Date */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">{t('step3')}</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <input type="datetime-local" name="date" className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg md:w-1/2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
            </section>

            {/* Step 4: Items */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">{t('step4')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('goodsDesc')}</p>

                <div className="space-y-4">
                    {/* Washing Machine */}
                    <div className={`p-4 border rounded-lg transition ${items.washing_machine.active ? 'border-primary bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500' : 'bg-white dark:bg-gray-700 dark:border-gray-600'}`}>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-900 dark:text-gray-200">
                            <input type="checkbox" checked={items.washing_machine.active} onChange={() => toggleItem('washing_machine')} className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                            <span className="font-semibold">{t('washingMachine')}</span>
                        </label>
                        {items.washing_machine.active && (
                            <div className="mt-2 ml-8 text-gray-700 dark:text-gray-300">
                                <label className="text-sm mr-2">{t('qty')}</label>
                                <input type="number" min="1" value={items.washing_machine.qty} onChange={(e) => updateItem('washing_machine', { qty: Number(e.target.value) })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                            </div>
                        )}
                    </div>

                    {/* Dryer */}
                    <div className={`p-4 border rounded-lg transition ${items.dryer.active ? 'border-primary bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500' : 'bg-white dark:bg-gray-700 dark:border-gray-600'}`}>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-900 dark:text-gray-200">
                            <input type="checkbox" checked={items.dryer.active} onChange={() => toggleItem('dryer')} className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                            <span className="font-semibold">{t('dryer')}</span>
                        </label>
                        {items.dryer.active && (
                            <div className="mt-2 ml-8 text-gray-700 dark:text-gray-300">
                                <label className="text-sm mr-2">{t('qty')}</label>
                                <input type="number" min="1" value={items.dryer.qty} onChange={(e) => updateItem('dryer', { qty: Number(e.target.value) })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                            </div>
                        )}
                    </div>

                    {/* Bed */}
                    <div className={`p-4 border rounded-lg transition ${items.bed.active ? 'border-primary bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500' : 'bg-white dark:bg-gray-700 dark:border-gray-600'}`}>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-900 dark:text-gray-200">
                            <input type="checkbox" checked={items.bed.active} onChange={() => toggleItem('bed')} className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                            <span className="font-semibold">{t('bed')}</span>
                        </label>
                        {items.bed.active && (
                            <div className="mt-2 ml-8 flex flex-wrap gap-4 items-center text-gray-700 dark:text-gray-300">
                                <div>
                                    <label className="text-sm mr-2">{t('qty')}</label>
                                    <input type="number" min="1" value={items.bed.qty} onChange={(e) => updateItem('bed', { qty: Number(e.target.value) })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-sm mr-2">{t('size')}</label>
                                    <select className="p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" value={items.bed.bedSize} onChange={(e) => updateItem('bed', { bedSize: e.target.value })}>
                                        <option value="90x200">90 x 200 cm</option>
                                        <option value="140x200">140 x 200 cm</option>
                                        <option value="160x200">160 x 200 cm</option>
                                        <option value="180x200">180 x 200 cm</option>
                                        <option value="custom">{t('custom')}</option>
                                    </select>
                                </div>
                                {items.bed.bedSize === 'custom' && (
                                    <div className="flex gap-2">
                                        <input placeholder={t('width')} value={items.bed.width || ''} onChange={(e) => updateItem('bed', { width: e.target.value })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400" />
                                        <input placeholder={t('length')} value={items.bed.length || ''} onChange={(e) => updateItem('bed', { length: e.target.value })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className={`p-4 border rounded-lg transition ${items.table.active ? 'border-primary bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500' : 'bg-white dark:bg-gray-700 dark:border-gray-600'}`}>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-900 dark:text-gray-200">
                            <input type="checkbox" checked={items.table.active} onChange={() => toggleItem('table')} className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                            <span className="font-semibold">{t('table')}</span>
                        </label>
                        {items.table.active && (
                            <div className="mt-2 ml-8 flex flex-wrap gap-4 items-center text-gray-700 dark:text-gray-300">
                                <div>
                                    <label className="text-sm mr-2">{t('qty')}</label>
                                    <input type="number" min="1" value={items.table.qty} onChange={(e) => updateItem('table', { qty: Number(e.target.value) })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm">{t('size')}</span>
                                    <input placeholder={`${t('width')} (cm)`} value={items.table.width || ''} onChange={(e) => updateItem('table', { width: e.target.value })} className="w-24 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400" />
                                    <input placeholder={`${t('length')} (cm)`} value={items.table.length || ''} onChange={(e) => updateItem('table', { length: e.target.value })} className="w-24 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cupboard */}
                    <div className={`p-4 border rounded-lg transition ${items.cupboard.active ? 'border-primary bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500' : 'bg-white dark:bg-gray-700 dark:border-gray-600'}`}>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-900 dark:text-gray-200">
                            <input type="checkbox" checked={items.cupboard.active} onChange={() => toggleItem('cupboard')} className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                            <span className="font-semibold">{t('cupboard')}</span>
                        </label>
                        {items.cupboard.active && (
                            <div className="mt-2 ml-8 flex flex-wrap gap-4 items-center text-gray-700 dark:text-gray-300">
                                <div>
                                    <label className="text-sm mr-2">{t('qty')}</label>
                                    <input type="number" min="1" value={items.cupboard.qty} onChange={(e) => updateItem('cupboard', { qty: Number(e.target.value) })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm">{t('size')}</span>
                                    <input placeholder={t('height')} value={items.cupboard.height || ''} type="number" onChange={(e) => updateItem('cupboard', { height: e.target.value })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400" />
                                    <input placeholder={t('width')} value={items.cupboard.width || ''} type="number" onChange={(e) => updateItem('cupboard', { width: e.target.value })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400" />
                                    <input placeholder={t('depth')} value={items.cupboard.depth || ''} type="number" onChange={(e) => updateItem('cupboard', { depth: e.target.value })} className="w-20 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400" />
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </section>

            {/* Step 5: Contact */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">{t('step5')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <input required name="firstName" placeholder={t('firstName')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                    <input required name="lastName" placeholder={t('lastName')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <input required name="email" type="email" placeholder={t('email')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                    <input required name="phone" type="tel" placeholder={t('phone')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
                <textarea name="message" placeholder={t('msgPlaceholder')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg h-32 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"></textarea>
            </section>

            <button disabled={loading} type="submit" className="w-full bg-secondary hover:bg-secondary-hover text-white text-lg font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : t('submit')}
            </button>

        </form>
    );
}
