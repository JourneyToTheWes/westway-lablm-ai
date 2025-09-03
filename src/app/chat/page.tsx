"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWIndow";
import ChatInput from "@/components/ChatInput";

const ChatPage = () => {
    const [chatId, setChatId] = useState<string | null>(null);

    function handleSend(text: string) {
        if (!chatId) return;
        // TODO: call POST /api/chats/[id]/messages (mock for now)
        console.log("Send:", text, "to chat:", chatId);
    }

    return (
        <div className="flex h-screen">
            <Sidebar onSelectChat={setChatId} />
            <div className="flex flex-col flex-1">
                {chatId ? (
                    <>
                        <ChatWindow chatId={chatId} />
                        <ChatInput onSend={handleSend} />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a chat to get started
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
