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
import GoogleDrivePicker from "./GoogleDrivePicker";
import { useDocs } from "@/context/DocContext";
import AssociatedInstruments from "./AssociatedInstruments";

type SidebarProps = {
    onSelectChat: (chatId: string) => void;
};

export default function Sidebar({ onSelectChat }: SidebarProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        null
    );
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    // const [docs, setDocs] = useState<Doc[]>([]); // Migrated to using React context provider
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const { docs, setDocs } = useDocs();
    const [selectedDocInstrumentIds, setSelectedDocInstrumentIds] = useState<
        string[]
    >([]);
    const [selectedInstrumentIdsFilter, setSelectedInstrumentIdsFilter] =
        useState<string[]>([]);

    // Fetch all data (TODO: can be swapped for some app-wide state management in the future)
    useEffect(() => {
        fetchProjects().then(setProjects).catch(console.error);
        fetchInstruments().then(setInstruments).catch(console.error);
        // fetchDocs().then(setDocs).catch(console.error); // Migrated to using React context provider
        fetchChats().then(setChats).catch(console.error);
    }, []);

    // Filtered data by selected project
    const filteredInstruments = selectedProjectId
        ? instruments.filter((i) => i.projectIds.includes(selectedProjectId))
        : [...instruments];

    // Filter documents by selected project, or instruments, both, or none
    let filteredDocs: Doc[] = [];
    if (selectedProjectId && selectedInstrumentIdsFilter.length === 0) {
        // Only project is selected
        filteredDocs = docs.filter((d) => d.projectId === selectedProjectId);
    } else if (!selectedProjectId && selectedInstrumentIdsFilter.length > 0) {
        // only instruments are selected
        filteredDocs = docs.filter((d) =>
            selectedInstrumentIdsFilter.includes(d.projectId)
        );
    } else if (selectedProjectId && selectedInstrumentIdsFilter.length > 0) {
        // Both project and instruments are selected
        filteredDocs = docs
            .filter((d) => d.projectId === selectedProjectId)
            .filter((d) =>
                selectedInstrumentIdsFilter.some((i) =>
                    d.instrumentIds?.includes(i)
                )
            );
    } else {
        // None are selected so display all docs
        filteredDocs = [...docs];
    }

    const filteredChats = selectedProjectId
        ? chats.filter((c) => c.projectId === selectedProjectId)
        : [...chats];

    const handleUpload = (newDocs: Doc[]) => {
        setDocs((prev) => [...prev, ...newDocs]);
    };

    const handleChatSelect = (chatId: string) => {
        onSelectChat(chatId);
        setSelectedChatId(chatId);
    };

    const handleSelectedInstrumentIdsFilterChange = (id: string) => {
        let instrumentIds: string[] = [];
        setSelectedInstrumentIdsFilter((prev) => {
            if (prev.includes(id)) {
                instrumentIds = prev.filter((i) => i !== id);
            } else {
                instrumentIds = [...prev, id];
            }
            return instrumentIds;
        });
    };

    return (
        <div className="w-64 h-screen flex flex-col border-r bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 overflow-y-auto scrollbar-custom pt-3 pb-8 px-2">
            <div>
                <h1 className="text-xl font-bold">
                    WestWay L<span className="text-sm">ab</span>LM AI
                </h1>
                <p className="p-2 text-xs text-gray-600 dark:text-gray-400 italic">
                    View project-specific data by selecting one, or all data if
                    none is chosen.
                </p>
            </div>
            {/* Projects */}
            <div className="flex flex-col">
                <h2 className="px-2 py-1 font-semibold text-sm border-b dark:border-gray-400">
                    Projects
                </h2>
                <div className="p-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    {selectedProjectId
                        ? `Displaying data for project "${
                              projects.find((p) => p.id === selectedProjectId)
                                  ?.name
                          }"`
                        : "Displaying all instruments, documents, and chats"}
                </div>
                <ul className="flex-1 overflow-y-auto scrollbar-custom max-h-[250px]">
                    {projects.map((p) => (
                        <li
                            key={p.id}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                selectedProjectId === p.id
                                    ? "bg-gray-200 dark:bg-gray-700 font-semibold"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedProjectId((prev) =>
                                    prev === p.id ? null : p.id
                                )
                            }
                        >
                            {p.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Instruments */}
            <div className="flex flex-col">
                <h2 className="px-2 py-1 font-semibold text-sm border-b dark:border-gray-400">
                    Instruments
                </h2>

                <div className="p-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    {selectedProjectId
                        ? `Displaying instruments for project "${
                              projects.find((p) => p.id === selectedProjectId)
                                  ?.name
                          }"`
                        : "Displaying all instruments"}
                </div>
                <ul className="flex-1 overflow-y-auto scrollbar-custom max-h-[250px]">
                    {filteredInstruments.map((i) => (
                        <li key={i.id} className="w-full">
                            <button
                                className={`px-4 py-1 w-full truncate cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    selectedInstrumentIdsFilter.includes(i.id)
                                        ? "bg-gray-200 dark:bg-gray-700 font-semibold"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleSelectedInstrumentIdsFilterChange(
                                        i.id
                                    )
                                }
                            >
                                {i.name} ({i.model})
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Documents */}
            <div className="flex flex-col">
                <h2 className="px-2 py-1 font-semibold text-sm border-b dark:border-gray-400">
                    Document
                </h2>

                <div className="p-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    {selectedProjectId
                        ? `Displaying documents for project "${
                              projects.find((p) => p.id === selectedProjectId)
                                  ?.name
                          }"`
                        : "Displaying all documents"}
                </div>
                <ul className="flex-1 overflow-y-auto scrollbar-custom max-h-[250px]">
                    {filteredDocs.map((d) => (
                        <li
                            key={d.id}
                            className="px-4 py-1 truncate"
                            title={`${d.title} ${
                                d.instrumentIds?.length
                                    ? `(Instruments: ${d.instrumentIds.join(
                                          ", "
                                      )})`
                                    : "(General)"
                            }`}
                        >
                            {d.title}{" "}
                            {d.instrumentIds?.length
                                ? `(Instruments: ${d.instrumentIds.join(", ")})`
                                : "(General)"}
                        </li>
                    ))}
                </ul>
            </div>

            {/* File Upload */}
            {selectedProjectId && (
                <div className="flex flex-col gap-2 mb-3">
                    <h2 className="px-2 py-1 font-semibold text-sm border-b dark:border-gray-400 mb-2">
                        Document Upload
                    </h2>
                    <div className="flex flex-col">
                        <AssociatedInstruments
                            instruments={filteredInstruments}
                            onInstrumentSelectionChange={
                                setSelectedDocInstrumentIds
                            }
                        />
                        <span className="px-2 text-xs text-gray-600 dark:text-gray-400 italic">
                            Files uploaded (via local / Google Drive) will be
                            associated with the selected instruments
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <FileUpload
                            projectId={selectedProjectId}
                            instrumentIds={selectedDocInstrumentIds}
                            onUpload={handleUpload}
                        />
                        <hr className="border border-gray-500 w-5/10"></hr>
                        <GoogleDrivePicker
                            projectId={selectedProjectId}
                            instrumentIds={selectedDocInstrumentIds}
                            onImport={(newDocs) => {
                                setDocs((prev) => [...prev, ...newDocs]); // update docs
                                console.log(docs);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Chats */}
            <div className="flex flex-col">
                <h2 className="px-2 py-1 font-semibold text-sm border-b dark:border-gray-400">
                    Chats
                </h2>

                <div className="p-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    {selectedProjectId
                        ? `Displaying chats for project "${
                              projects.find((p) => p.id === selectedProjectId)
                                  ?.name
                          }"`
                        : "Displaying all chats"}
                </div>
                <ul className="flex-1 overflow-y-auto scrollbar-custom max-h-[250px]">
                    {filteredChats.map((c) => (
                        <li
                            key={c.id}
                            className={`px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer ${
                                selectedChatId === c.id
                                    ? "bg-gray-200 dark:bg-gray-700 font-semibold"
                                    : ""
                            }`}
                            onClick={() => handleChatSelect(c.id)}
                        >
                            {c.title}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
