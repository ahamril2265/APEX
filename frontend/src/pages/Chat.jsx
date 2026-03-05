import React, { useState, useEffect, useRef } from 'react';
import useAppStore from '../store/useAppStore';
import { api } from '../api/client';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
    const { chatMessages, setChatMessages, addChatMessage, profile } = useAppStore();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const { data } = await api.getChatHistory();
                setChatMessages(data || []);
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };
        loadHistory();
    }, [setChatMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        addChatMessage({ role: 'user', content: userMessage });
        setIsTyping(true);

        try {
            const { data } = await api.sendMessage(userMessage);
            addChatMessage({ role: 'assistant', content: data.response });
        } catch (err) {
            console.error(err);
            addChatMessage({ role: 'assistant', content: "Connection to APEX failed. Please try again." });
        } finally {
            setIsTyping(false);
        }
    };

    const clearHistory = async () => {
        try {
            await api.clearChatHistory();
            setChatMessages([]);
        } catch (err) {
            console.error("Failed to clear history", err);
        }
    };

    return (
        <div className="h-[85vh] flex flex-col relative animate-in fade-in duration-500">

            {!profile && (
                <div className="bg-primary/20 border border-primary/40 p-4 rounded-xl mb-6 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                    <p className="text-primary font-bold text-center">Setup your profile! Tell APEX your name, height, weight, and fitness goals to configure your starting baseline.</p>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-white">APEX Coach</h1>
                    <p className="text-textMuted text-sm mt-1">AI Personal Trainer & Nutritionist</p>
                </div>
                <button onClick={clearHistory} className="btn-secondary flex items-center space-x-2 text-sm !py-1.5 !px-3">
                    <Trash2 className="w-4 h-4" />
                    <span>Clear History</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-6">
                {chatMessages.length === 0 && !isTyping && (
                    <div className="h-full flex flex-col items-center justify-center text-textMuted">
                        <Bot className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No messages yet.</p>
                        <p className="text-sm">Say hello to start building your personalized plan.</p>
                    </div>
                )}

                {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] flex space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>

                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-surface border border-white/10' : 'bg-primary shadow-[0_0_15px_rgba(74,222,128,0.3)]'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-6 h-6 text-black" />}
                            </div>

                            <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-surface border border-white/5 text-white' : 'glass-panel text-white/90 prose prose-invert max-w-none'}`}>
                                {msg.role === 'user' ? (
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] flex space-x-4">
                            <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                                <Bot className="w-6 h-6 text-black" />
                            </div>
                            <div className="glass-panel p-4 rounded-2xl flex items-center space-x-2">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="text-textMuted text-sm font-medium tracking-wide">APEX is analyzing...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="relative mt-auto">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask APEX for advice, log unstructured data, or update your profile..."
                    className="input-field pr-16 resize-none block w-full bg-surface shadow-xl"
                    rows="3"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-4 bottom-4 p-2 bg-primary text-black rounded-lg hover:bg-green-300 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default Chat;
