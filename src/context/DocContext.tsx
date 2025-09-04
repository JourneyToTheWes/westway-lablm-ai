"use client";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    Dispatch,
    SetStateAction,
} from "react";
import { fetchDocs } from "@/lib/api";
import { Doc } from "@/lib/types";

interface DocContextType {
    docs: Doc[];
    setDocs: Dispatch<SetStateAction<Doc[]>>;
}

const DocContext = createContext<DocContextType | undefined>(undefined);

export const DocProvider = ({ children }: { children: React.ReactNode }) => {
    const [docs, setDocs] = useState<Doc[]>([]);

    useEffect(() => {
        fetchDocs().then(setDocs);
    }, []);

    return (
        <DocContext.Provider
            value={{
                docs,
                setDocs,
            }}
        >
            {children}
        </DocContext.Provider>
    );
};

export const useDocs = () => {
    const ctx = useContext(DocContext);
    if (!ctx) {
        throw new Error("useDocs must be used within a DocProvider");
    }
    return ctx;
};
