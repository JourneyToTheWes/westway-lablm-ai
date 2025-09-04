import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Doc } from "@/lib/types";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

interface DocumentPreviewProps {
    doc: Doc | null;
    page?: number | null;
    onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
    doc,
    page,
    onClose,
}) => {
    if (!doc) return null;

    return (
        <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[80vw] !max-w-none mx-auto h-[80vh] flex flex-col">
                <DialogHeader className="">
                    <DialogTitle>{doc.title}</DialogTitle>
                </DialogHeader>
                {doc.type === "pdf" ? (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer
                            // fileUrl={doc.path} // comment out when doc.path points to real document
                            fileUrl={"docs/example-of-an-instrument-manual.pdf"} // Dummy Doc to preview
                            defaultScale={SpecialZoomLevel.PageFit}
                            initialPage={page ? page - 1 : 0}
                        />
                    </Worker>
                ) : (
                    <iframe
                        // src={doc.path} // comment out when doc.path points to real document
                        src={`docs/example-of-an-instrument-manual.pdf#page=${
                            // Dummy Doc to preview
                            page ? page - 1 : 0
                        }#zoom=100`}
                        className="w-full h-full rounded border"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DocumentPreview;
