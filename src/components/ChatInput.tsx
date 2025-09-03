"use client";

import { useState } from "react";

export default function ChatInput({
    onSend,
    disabled,
}: {
    onSend: (t: string) => void;
    disabled?: boolean;
}) {
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center p-2 border-t border-gray-200 dark:border-gray-700"
        >
            <input
                className="flex-1 p-2 rounded-md border bg-white dark:bg-gray-800 dark:text-gray-100"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                disabled={disabled}
            />
            <button
                type="submit"
                className="ml-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={disabled}
            >
                Send
            </button>
        </form>
    );
}
