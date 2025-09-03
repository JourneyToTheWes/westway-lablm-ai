"use client";

import { useEffect } from "react";
import { fetchMessages } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import useChatMessages from "@/hooks/useChatMessages";
import ChatInput from "./ChatInput";

const ChatWindow = ({ chatId }: { chatId: string }) => {
    const { messages, sendMessage, loading } = useChatMessages(chatId);

    return (
        <div className="flex flex-col flex-1">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>

            {/* Chat Input */}
            <ChatInput onSend={sendMessage} disabled={loading} />
        </div>
    );
};

export default ChatWindow;
