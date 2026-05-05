'use client';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
    suggestions?: string[];
}

const markdownComponents = {
    p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="mb-2 mt-3 first:mt-0 text-sm md:text-base font-semibold text-gray-900" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc space-y-1 pl-5 mb-3" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal space-y-1 pl-5 mb-3" {...props} />,
    li: ({ node, ...props }: any) => <li className="leading-relaxed" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-semibold text-gray-900" {...props} />,
    em: ({ node, ...props }: any) => <em className="mt-2 block text-xs not-italic text-gray-500" {...props} />,
};

function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({
    message,
    onSuggestionClick,
}: {
    message: Message;
    onSuggestionClick?: (suggestion: string) => void;
}) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] md:max-w-[75%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`w-full rounded-2xl px-4 py-3 shadow-sm ${
                        isUser
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                >
                    <div className={isUser ? "text-sm md:text-base whitespace-pre-wrap" : "prose prose-sm md:prose-base max-w-none"}>
                        {isUser ? (
                            message.text
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {message.text}
                            </ReactMarkdown>
                        )}
                    </div>
                    <p className={`text-[10px] md:text-xs mt-1.5 flex ${isUser ? 'justify-end text-blue-200' : 'justify-start text-gray-400'}`}>
                        {formatTime(message.timestamp)}
                    </p>
                </div>
                {!isUser && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => onSuggestionClick?.(suggestion)}
                                className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition-all hover:bg-blue-50 active:scale-95"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(MessageBubble);
