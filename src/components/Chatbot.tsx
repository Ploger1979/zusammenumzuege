'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle, X, Send, User, Bot, Loader2, Plus, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

export default function Chatbot() {
    const t = useTranslations('Chatbot');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const startNewChat = () => {
        setMessages([
            {
                id: '1',
                text: t('welcome'),
                sender: 'bot',
                timestamp: new Date(),
            },
        ]);
        setInputValue('');
        setIsTyping(false);
    };

    useEffect(() => {
        if (messages.length === 0) startNewChat();
    }, [t]);

    const [leadInfo, setLeadInfo] = useState({ name: '', phone: '', from: '', to: '' });
    const [leadSent, setLeadSent] = useState(false);

    // Auto-Send Lead when Name & Phone are captured
    useEffect(() => {
        if (leadInfo.name && leadInfo.phone && !leadSent) {
            fetch('/api/send-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leadInfo.name,
                    phone: leadInfo.phone,
                    from: leadInfo.from,
                    to: leadInfo.to,
                    message: messages.map(m => `[${m.sender}] ${m.text}`).join('\n')
                })
            }).then(() => setLeadSent(true)).catch(err => console.error("Email lead error:", err));
        }
    }, [leadInfo, leadSent, messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userText = inputValue.trim();
        const userMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            let response;
            let retries = 0;
            const maxRetries = 3;
            
            // Auto-Retry Loop for High Demand / Rate Limits
            while (retries < maxRetries) {
                response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messages.concat(userMsg).map(m => ({
                            role: m.sender === 'user' ? 'user' : 'assistant',
                            content: m.text
                        }))
                    })
                });

                if (response.ok) break; // Success!
                
                const errorData = await response.json();
                // If it's a "High Demand" or "Rate Limit" error, wait and retry
                if (response.status === 503 || response.status === 429 || errorData.details?.includes("high demand")) {
                    retries++;
                    if (retries < maxRetries) {
                        // Wait for 2 seconds before next retry
                        await new Promise(res => setTimeout(res, 2000 * retries));
                        continue;
                    }
                }
                
                throw new Error(errorData.details || "Unknown AI error");
            }

            if (!response || !response.ok) throw new Error("Connection failed after retries");

            const data = await response.json();
            
            if (data.text) {
                let cleanText = data.text;
                
                // ROBUST LEAD EXTRACTION
                const nameMatch = cleanText.match(/Name=([^,\]]*)/);
                const phoneMatch = cleanText.match(/Phone=([^,\]]*)/);
                const fromMatch = cleanText.match(/From=([^,\]]*)/);
                const toMatch = cleanText.match(/To=([^,\]]*)/);
                
                if (nameMatch || phoneMatch || fromMatch || toMatch) {
                    const extractedName = nameMatch ? nameMatch[1].trim() : '';
                    const extractedPhone = phoneMatch ? phoneMatch[1].trim() : '';
                    const extractedFrom = fromMatch ? fromMatch[1].trim() : '';
                    const extractedTo = toMatch ? toMatch[1].trim() : '';
                    
                    if (extractedName && extractedName !== '...') setLeadInfo(prev => ({ ...prev, name: extractedName }));
                    if (extractedPhone && extractedPhone !== '...') setLeadInfo(prev => ({ ...prev, phone: extractedPhone }));
                    if (extractedFrom && extractedFrom !== '...') setLeadInfo(prev => ({ ...prev, from: extractedFrom }));
                    if (extractedTo && extractedTo !== '...') setLeadInfo(prev => ({ ...prev, to: extractedTo }));
                    
                    // AGGRESSIVE CLEANING: Remove any instance of the tag completely
                    cleanText = cleanText.replace(/\[LEAD_DATA:.*?\]/g, '').trim();
                }

                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    text: cleanText,
                    sender: 'bot',
                    timestamp: new Date(),
                }]);
            } else {
                throw new Error(data.details || "Unknown AI error");
            }
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: `Entschuldigung, technischer Fehler: ${error.message}. Bitte versuchen Sie es gleich erneut.`,
                sender: 'bot',
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleWhatsAppDirect = () => {
        let message = "Hallo Zusammen Umzüge, ich habe eine Frage zu einem Umzug.";
        if (leadInfo.name || leadInfo.phone) {
            message = `Hallo Zusammen Umzüge, ich bin ${leadInfo.name || '[Name]'}. Meine Nummer ist ${leadInfo.phone || '[Telefon]'}. Ich hätte gerne ein Angebot für meinen Umzug.`;
        }
        window.open(`https://wa.me/491782722300?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-gray-900 to-black text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-gray-800"
            >
                {isOpen ? <X size={30} /> : <MessageSquare size={30} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 border-2 border-white"></span>
                    </span>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[420px] h-[600px] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-5 text-white flex items-center justify-between shadow-2xl border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-blue-400/30">
                                        <Bot size={28} className="text-white" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{t('title')}</h3>
                                    <span className="text-xs text-green-400 font-bold uppercase tracking-widest">{t('status')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={startNewChat}
                                    title={t('newChat')}
                                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-95 group"
                                >
                                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-950/50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-auto ${
                                            msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-blue-400 border border-gray-200 dark:border-gray-700'
                                        }`}>
                                            {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                                            msg.sender === 'user' 
                                                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20' 
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-1.5 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* WhatsApp CTA */}
                        {messages.length > 2 && (
                            <div className="px-5 py-2">
                                <button 
                                    onClick={handleWhatsAppDirect}
                                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebd59] text-white py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]"
                                >
                                    <MessageCircle size={20} />
                                    <span>Direkt per WhatsApp</span>
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                            <form onSubmit={handleSend} className="flex gap-3">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('placeholder')}
                                    className="flex-grow bg-gray-100 dark:bg-gray-800 text-[15px] border-none rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white"
                                />
                                <button 
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95"
                                >
                                    <Send size={22} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
