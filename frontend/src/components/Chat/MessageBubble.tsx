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
    h3: ({ node, ...props }: any) => <h3 className="mb-2 mt-3 first:mt-0 text-sm md:text-base font-semibold text-white" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc space-y-1 pl-5 mb-3 marker:text-cyan-500" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal space-y-1 pl-5 mb-3 marker:text-cyan-500" {...props} />,
    li: ({ node, ...props }: any) => <li className="leading-relaxed" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-semibold text-white" {...props} />,
    em: ({ node, ...props }: any) => <em className="mt-2 block text-xs not-italic text-slate-400" {...props} />,
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
                            ? 'bg-cyan-500 text-slate-950 rounded-br-sm shadow-[0_2px_10px_rgba(6,182,212,0.15)]'
                            : 'bg-slate-800 border border-white/10 text-slate-200 rounded-bl-sm shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                    }`}
                >
                    <div className={isUser ? "text-sm md:text-base whitespace-pre-wrap font-medium" : "prose prose-invert prose-sm md:prose-base max-w-none"}>
                        {isUser ? (
                            message.text
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {message.text}
                            </ReactMarkdown>
                        )}
                    </div>
                    <p className={`text-[10px] md:text-xs mt-1.5 flex ${isUser ? 'justify-end text-slate-800/70 font-medium' : 'justify-start text-slate-400'}`}>
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
                                className="rounded-full border border-cyan-500/30 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-cyan-300 shadow-sm transition-all hover:bg-cyan-500/20 hover:text-cyan-100 active:scale-95"
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
