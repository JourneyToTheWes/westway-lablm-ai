import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Doc } from "@/lib/types";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

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

    const zoomPluginInstance = zoomPlugin();
    const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;

    return (
        <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[80vw] !max-w-none mx-auto h-[80vh] flex flex-col">
                <DialogHeader className="">
                    <DialogTitle>{doc.title}</DialogTitle>
                </DialogHeader>
                {doc.type === "pdf" ? (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div className="flex justify-center items-center bg-gray-200 border-b border-gray-200 p-1">
                            <ZoomOutButton />
                            <ZoomPopover />
                            <ZoomInButton />
                        </div>
                        <Viewer
                            fileUrl={doc.path}
                            initialPage={page ? page - 1 : 0}
                            plugins={[zoomPluginInstance]}
                        />
                    </Worker>
                ) : (
                    <iframe
                        src={
                            doc.type === "docx"
                                ? `https://docs.google.com/viewer?url=${encodeURIComponent(
                                      doc.path
                                  )}&embedded=true`
                                : doc.type === "pptx"
                                ? `https://docs.google.com/labnol.org/viewer?url=${encodeURIComponent(
                                      doc.path
                                  )}&embedded=true`
                                : doc.path
                        }
                        className="w-full h-full rounded border"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DocumentPreview;
