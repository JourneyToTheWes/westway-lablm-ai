import { useState, useEffect } from "react";
import { Message } from "@/lib/types";

const useChatMessages = (chatId: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    // Load initial messages
    useEffect(() => {
        async function fetchMessages() {
            try {
                const res = await fetch(`/api/chats/${chatId}/messages`);
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error(err);
            }
        }
        if (chatId) fetchMessages();
    }, [chatId]);

    // Send new message
    async function sendMessage(text: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/chats/${chatId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data: Message[] = await res.json();
            // Append new messages
            setMessages((prev) => [...prev, ...data]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return { messages, sendMessage, loading };
};

export default useChatMessages;
