
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChatBubbleOvalLeftEllipsisIcon } from '../common/Icons';

const AIChatButton: React.FC = () => {
    const { toggleChat } = useAppContext();

    return (
        <button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-2 ring-offset-[var(--color-background)] ring-[var(--color-primary)]"
            aria-label="Toggle AI Tutor"
        >
            <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
        </button>
    );
};

export default AIChatButton;
