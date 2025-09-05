"use client";

import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import useChatMessages from "@/hooks/useChatMessages";
import ChatInput from "./ChatInput";
import { useDocs } from "@/context/DocContext";
import { Doc } from "@/lib/types";
import DocumentPreview from "./DocumentPreview";

const ChatWindow = ({ chatId }: { chatId: string }) => {
    const { messages, sendMessage, status } = useChatMessages(chatId);
    const [loading, setLoading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
    const [previewPage, setPreviewPage] = useState<number | null>(null);
    const { docs } = useDocs();

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
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        onCitationClick={(docId, page, docTitle) => {
                            console.log(docTitle);
                            console.log(docs);
                            console.log(docId);
                            const doc = docs.find(
                                (d) =>
                                    d.id === docId ||
                                    (docTitle && d.title.includes(docTitle))
                            ) as Doc;

                            console.log(docs);

                            setPreviewDoc(doc);
                            setPreviewPage(page ? page : null);
                        }}
                    />
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

            {/* Document Preview */}
            <DocumentPreview
                doc={previewDoc}
                page={previewPage}
                onClose={() => {
                    setPreviewDoc(null);
                    setPreviewPage(null);
                }}
            />

            {/* Chat Input */}
            <ChatInput onSend={handleSend} disabled={loading} />
        </div>
    );
};

export default ChatWindow;
