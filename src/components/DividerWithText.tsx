export default function DividerWithText({ text }: { text: string }) {
    return (
        <div className="flex items-center w-full mt-1">
            <div className="flex-grow border-t border-gray-500"></div>
            <span className="px-4 text-white-700 font-medium">{text}</span>
            <div className="flex-grow border-t border-gray-500"></div>
        </div>
    );
}
