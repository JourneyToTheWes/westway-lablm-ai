import React, { useState } from "react";
import { Instrument } from "@/lib/types";

interface AssociatedInstrumentsProps {
    instruments: Instrument[];
    onInstrumentSelectionChange: (instrIds: string[]) => void;
}

const AssociatedInstruments: React.FC<AssociatedInstrumentsProps> = ({
    instruments,
    onInstrumentSelectionChange,
}) => {
    const [selectedInstrumentIds, setSelectedInstrumentIds] = useState<
        string[]
    >([]);
    const handleInstrumentSelect = (id: string) => {
        let instrumentIds: string[] = [];
        setSelectedInstrumentIds((prev) => {
            if (prev.includes(id)) {
                instrumentIds = prev.filter((i) => i !== id);
            } else {
                instrumentIds = [...prev, id];
            }
            return instrumentIds;
        });

        onInstrumentSelectionChange(instrumentIds);
    };

    return (
        <>
            {instruments.length > 0 && (
                <div className="my-2 flex flex-col items-center">
                    <p className="text-sm font-semibold">
                        Associate with instrument(s):
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1 justify-center">
                        {instruments.map((instr) => (
                            <button
                                key={instr.id}
                                type="button"
                                className={`px-2 py-1 border rounded text-sm cursor-pointer ${
                                    selectedInstrumentIds.includes(instr.id)
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-800"
                                }`}
                                onClick={() => handleInstrumentSelect(instr.id)}
                            >
                                {instr.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default AssociatedInstruments;
