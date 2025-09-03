"use client";

import { useEffect, useState } from "react";
import { fetchProjects, fetchChats } from "@/lib/api";
import { Project, Chat } from "@/lib/types";

const Sidebar = ({
    onSelectChat,
}: {
    onSelectChat: (chatId: string) => void;
}) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);

    useEffect(() => {
        fetchProjects().then(setProjects).catch(console.error);
        fetchChats().then(setChats).catch(console.error);
    }, []);

    return (
        <div className="w-64 h-full flex flex-col border-r bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            <div className="p-4 font-bold text-lg border-b">Projects</div>
            <ul className="flex-1 overflow-y-auto">
                {projects.map((p) => (
                    <li
                        key={p.id}
                        className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        {p.name}
                    </li>
                ))}
            </ul>

            <div className="p-4 font-bold text-lg border-b">Chats</div>
            <ul className="flex-1 overflow-y-auto">
                {chats.map((c) => (
                    <li
                        key={c.id}
                        className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
                        onClick={() => onSelectChat(c.id)}
                    >
                        {c.title}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
