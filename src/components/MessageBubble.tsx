import { useState } from "react";
import { Message, Citation, Feedback } from "@/lib/types";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MessageBubbleProps {
    message: Message;
    onCitationClick: (docId: Citation["docId"], page: Citation["page"]) => void;
    onGiveFeedback: (id: string, feedback: Feedback) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    onCitationClick,
    onGiveFeedback,
}) => {
    const [showComment, setShowComment] = useState(false);
    const [rating, setRating] = useState<Feedback["rating"]>(
        message.feedback ? message.feedback.rating : null
    );
    const [comment, setComment] = useState(
        message.feedback ? message.feedback.comment ?? "" : ""
    );

    const isUser = message.role === "user";

    // Define a custom component for the <table> element
    const components: Components = {
        table: ({ node, ...props }) => (
            <table className="markdown-table" {...props} />
        ),
    };

    return (
        <div
            className={`message-bubble flex ${
                isUser ? "justify-end" : "justify-start"
            } mb-3`}
        >
            <div
                className={`max-w-lg rounded-xl px-4 py-2 shadow 
          ${
              isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
          }`}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={components}
                >
                    {message.content}
                </ReactMarkdown>

                {!isUser && (
                    <>
                        {message.citations && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                {message.citations.map((c, i) => (
                                    <button
                                        key={i}
                                        className="mr-2 px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                                        onClick={() =>
                                            onCitationClick(c.docId, c.page)
                                        }
                                    >
                                        <span>
                                            📄 {c.docId}{" "}
                                            {c.page ? `(p.${c.page})` : ""}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* feedback section */}
                        <div className="flex flex-col items-end gap-2 mt-2 text-gray-500">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        onGiveFeedback(message.id, {
                                            rating: "up",
                                        });
                                        setRating((prev) =>
                                            prev === "up" ? null : "up"
                                        );
                                    }}
                                    className={`hover:text-gray-300 cursor-pointer ${
                                        rating === "up" && "text-gray-300"
                                    }`}
                                >
                                    <ThumbsUp size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        onGiveFeedback(message.id, {
                                            rating: "down",
                                        });
                                        setRating((prev) =>
                                            prev === "down" ? null : "down"
                                        );
                                    }}
                                    className={`hover:text-gray-300 cursor-pointer ${
                                        rating === "down" && "text-gray-300"
                                    }`}
                                >
                                    <ThumbsDown size={16} />
                                </button>
                            </div>

                            {rating && (
                                <div>
                                    <button
                                        onClick={() =>
                                            setShowComment((prev) => !prev)
                                        }
                                        className="px-2 py-0.5 border border-gray-300 dark:border-gray-700 hover:dark:border-gray-500 bg-gray-50 rounded-md dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs cursor-pointer"
                                    >
                                        Leave feedback
                                    </button>
                                </div>
                            )}
                        </div>

                        {rating && showComment && (
                            <div className="mt-2 flex flex-col items-end">
                                <textarea
                                    placeholder="Leave feedback on assistant response..."
                                    className="w-full border rounded-md p-1 text-sm"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button
                                    onClick={() =>
                                        onGiveFeedback(message.id, {
                                            rating,
                                            comment,
                                        })
                                    }
                                    className="mt-1 px-2 py-1 rounded-md text-sm min-w-[70px] bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-default disabled:hover:bg-blue-600"
                                    disabled={comment.length === 0}
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
