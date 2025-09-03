"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

const ChatPage = () => {
    const [chatId, setChatId] = useState<string | null>(null);

    return (
        <div className="flex h-screen">
            <Sidebar onSelectChat={setChatId} />
            <div className="flex flex-col flex-1">
                {chatId ? (
                    <ChatWindow chatId={chatId} />
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
