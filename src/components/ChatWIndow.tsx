"use client";

import { useEffect, useState } from "react";
import { fetchMessages } from "@/lib/api";
import { Message } from "@/lib/types";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ chatId }: { chatId: string }) => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (!chatId) return;
        fetchMessages(chatId).then(setMessages).catch(console.error);
    }, [chatId]);

    return (
        <div className="flex-1 flex flex-col overflow-y-auto p-4">
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
            ))}
        </div>
    );
};

export default ChatWindow;
