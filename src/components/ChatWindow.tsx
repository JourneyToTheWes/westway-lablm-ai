"use client";

import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import useChatMessages from "@/hooks/useChatMessages";
import ChatInput from "./ChatInput";

const ChatWindow = ({ chatId }: { chatId: string }) => {
    const { messages, sendMessage, status } = useChatMessages(chatId);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSend = async (text: string) => {
        setLoading(true);
        await sendMessage(text);
        setLoading(false);
    };

    // Auto-scroll when messages or status changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status]);

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-custom">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Show AI status indicator when streaming */}
                {status && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {status}...
                    </div>
                )}

                {/* Dummy div to scroll into */}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <ChatInput onSend={handleSend} disabled={loading} />
        </div>
    );
};

export default ChatWindow;
