export default function ChatLoading() {
    return (
        <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 text-blue-600">
                <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <p className="text-sm font-medium text-gray-600">Opening chat...</p>
            </div>
        </div>
    );
}
