import { Message } from "@/lib/types";

const MessageBubble = ({ message }: { message: Message }) => {
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
                            <span
                                key={i}
                                className="mr-2 px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                            >
                                📄 {c.docId} {c.page ? `(p.${c.page})` : ""}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
