"use client";

import { useState } from "react";

const ChatInput = ({ onSend }: { onSend: (text: string) => void }) => {
    const [input, setInput] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;
        onSend(input.trim());
        setInput("");
    }

    return (
        <form onSubmit={handleSubmit} className="flex border-t p-2">
            <input
                type="text"
                className="flex-1 p-2 border rounded-lg mr-2"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
            >
                Send
            </button>
        </form>
    );
};

export default ChatInput;
