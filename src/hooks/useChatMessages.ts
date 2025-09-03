import { useState, useEffect } from "react";
import { Message } from "@/lib/types";

const useChatMessages = (chatId: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<string | null>(null);

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
        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            chatId,
            role: "user",
            content: text,
            createdAt: new Date().toISOString(),
        };

        // Add user message immediately
        setMessages((prev) => [...prev, userMessage]);

        const res = await fetch(`/api/chats/${chatId}/messages`, {
            method: "POST",
            body: JSON.stringify({ text }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let assistantMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            chatId,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString(),
            citations: [],
        };

        setMessages((prev) => [...prev, assistantMessage]);

        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const parts = buffer.split("\n\n");
            buffer = parts.pop() || ""; // keep incomplete chunk for next iteration

            for (const part of parts) {
                if (!part.startsWith("data: ")) continue;

                try {
                    const event = JSON.parse(part.replace(/^data:\s*/, ""));

                    if (event.stage) {
                        setStatus(event.stage);
                    }
                    if (event.token) {
                        assistantMessage = {
                            ...assistantMessage,
                            content: assistantMessage.content + event.token,
                        };
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantMessage.id
                                    ? assistantMessage
                                    : m
                            )
                        );
                    }
                    if (event.citations) {
                        assistantMessage = {
                            ...assistantMessage,
                            citations: event.citations,
                        };
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantMessage.id
                                    ? assistantMessage
                                    : m
                            )
                        );
                    }
                } catch (e) {
                    console.error("Failed to parse SSE chunk", e, part);
                }
            }
        }

        setStatus(null);
    }

    return { messages, sendMessage, status };
};

export default useChatMessages;
