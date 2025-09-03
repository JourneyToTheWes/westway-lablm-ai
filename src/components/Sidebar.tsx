"use client";

import { useEffect, useState } from "react";
import {
    fetchProjects,
    fetchInstruments,
    fetchDocs,
    fetchChats,
} from "@/lib/api";
import { Project, Instrument, Doc, Chat } from "@/lib/types";
import FileUpload from "./FileUpload";

type SidebarProps = {
    onSelectChat: (chatId: string) => void;
};

export default function Sidebar({ onSelectChat }: SidebarProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        null
    );

    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [docs, setDocs] = useState<Doc[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);

    const [uploadedDocs, setUploadedDocs] = useState<Doc[]>([]);

    // Fetch all data
    useEffect(() => {
        fetchProjects().then(setProjects).catch(console.error);
        fetchInstruments().then(setInstruments).catch(console.error);
        fetchDocs().then(setDocs).catch(console.error);
        fetchChats().then(setChats).catch(console.error);
    }, []);

    // Filtered data by selected project
    const filteredInstruments = selectedProjectId
        ? instruments.filter((i) => i.projectIds.includes(selectedProjectId))
        : [...instruments];

    const filteredDocs = selectedProjectId
        ? docs
              .filter((d) => d.projectId === selectedProjectId)
              .concat(
                  uploadedDocs.filter((d) => d.projectId === selectedProjectId)
              )
        : [...docs];

    const filteredChats = selectedProjectId
        ? chats.filter((c) => c.projectId === selectedProjectId)
        : [...chats];

    const handleUpload = (newDocs: Doc[]) => {
        setUploadedDocs((prev) => [...prev, ...newDocs]);
    };

    return (
        <div className="w-64 h-full flex flex-col border-r bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
            {/* Projects */}
            <div className="p-4 font-bold text-lg border-b">Projects</div>
            <div className="p-2 text-sm text-gray-600 dark:text-gray-400 italic">
                {selectedProjectId
                    ? `Displaying data for project "${
                          projects.find((p) => p.id === selectedProjectId)?.name
                      }"`
                    : "Displaying all instruments, documents, and chats"}
            </div>
            <ul className="flex-1 overflow-y-auto scrollbar-custom">
                {projects.map((p) => (
                    <li
                        key={p.id}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                            selectedProjectId === p.id
                                ? "bg-gray-300 dark:bg-gray-800 font-semibold"
                                : ""
                        }`}
                        onClick={() => setSelectedProjectId(p.id)}
                    >
                        {p.name}
                    </li>
                ))}
            </ul>

            {/* Instruments */}
            <div className="p-4 font-bold text-lg border-b">Instruments</div>
            <div className="p-2 text-sm text-gray-600 dark:text-gray-400 italic">
                {selectedProjectId
                    ? `Displaying instruments for project "${
                          projects.find((p) => p.id === selectedProjectId)?.name
                      }"`
                    : "Displaying all instruments"}
            </div>
            <ul className="flex-1 overflow-y-auto scrollbar-custom">
                {filteredInstruments.map((i) => (
                    <li key={i.id} className="px-4 py-2">
                        {i.name} ({i.model})
                    </li>
                ))}
            </ul>

            {/* Documents */}
            <div className="p-4 font-bold text-lg border-b">Documents</div>
            <div className="p-2 text-sm text-gray-600 dark:text-gray-400 italic">
                {selectedProjectId
                    ? `Displaying documents for project "${
                          projects.find((p) => p.id === selectedProjectId)?.name
                      }"`
                    : "Displaying all documents"}
            </div>
            <ul className="flex-1 overflow-y-auto text-sm scrollbar-custom">
                {filteredDocs.map((d) => (
                    <li key={d.id} className="px-4 py-1 truncate">
                        {d.title}{" "}
                        {d.instrumentIds?.length
                            ? `(Instruments: ${d.instrumentIds.join(", ")})`
                            : "(General)"}
                    </li>
                ))}
            </ul>

            {/* File Upload */}
            {selectedProjectId && (
                <>
                    <div className="p-4 font-bold text-lg border-b">
                        Document Upload
                    </div>
                    <div className="p-4 border-t">
                        <FileUpload
                            projectId={selectedProjectId}
                            instruments={filteredInstruments}
                            onUpload={handleUpload}
                        />
                    </div>
                </>
            )}

            {/* Chats */}
            <div className="p-4 font-bold text-lg border-b">Chats</div>
            <div className="p-2 text-sm text-gray-600 dark:text-gray-400 italic">
                {selectedProjectId
                    ? `Displaying chats for project "${
                          projects.find((p) => p.id === selectedProjectId)?.name
                      }"`
                    : "Displaying all chats"}
            </div>
            <ul className="flex-1 overflow-y-auto scrollbar-custom">
                {filteredChats.map((c) => (
                    <li
                        key={c.id}
                        className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => onSelectChat(c.id)}
                    >
                        {c.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}
