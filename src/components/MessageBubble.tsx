import { Message, Citation } from "@/lib/types";

interface MessageBubbleProps {
    message: Message;
    onCitationClick: (
        docId: Citation["docId"],
        page: Citation["page"],
        docTitle?: Citation["docTitle"] // Temp variable for Document Viewing Demo
    ) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    onCitationClick,
}) => {
    const isUser = message.role === "user";

    return (
        <div
            className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
        >
            <div
                className={`max-w-lg rounded-xl px-4 py-2 shadow 
          ${
              isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
          }`}
            >
                <p>{message.content}</p>

                {message.citations && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        {message.citations.map((c, i) => (
                            <button
                                key={i}
                                className="mr-2 px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                                onClick={() =>
                                    onCitationClick(c.docId, c.page, c.docTitle)
                                }
                            >
                                <span
                                // key={i}
                                // className="mr-2 px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                                >
                                    📄 {c.docId} {c.page ? `(p.${c.page})` : ""}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
