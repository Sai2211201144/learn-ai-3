import React from 'react';
import CodeBlock from '../course/CodeBlock';

interface ExplanationDisplayProps {
    markdownContent: string;
}

interface ParsedSection {
    title: string;
    content: string;
}

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({ markdownContent }) => {
    
    const parseMarkdown = (markdown: string): ParsedSection[] => {
        const sections: ParsedSection[] = [];
        const lines = markdown.split('\n');
        let currentSection: ParsedSection | null = null;

        for (const line of lines) {
            const headingMatch = line.match(/^### (.*)/);
            if (headingMatch) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = { title: headingMatch[1].trim(), content: '' };
            } else if (currentSection) {
                currentSection.content += line + '\n';
            }
        }

        if (currentSection) {
            sections.push(currentSection);
        }

        return sections;
    };

    const parsedSections = parseMarkdown(markdownContent);
    
    const renderContent = (content: string) => {
        const codeBlockMatch = content.match(/```cpp\n([\s\S]*?)```/);
        if (codeBlockMatch) {
            return <CodeBlock code={codeBlockMatch[1].trim()} />;
        }
        
        // Simple paragraph rendering for other content
        return <div className="text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content.replace(/`(.*?)`/g, '<code class="bg-gray-700/50 text-cyan-300 px-1.5 py-0.5 rounded-md font-mono text-sm">$1</code>') }}></div>;
    };

    return (
        <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6 border-b border-[var(--color-border)] pb-4">Structured Explanation</h2>
            <div className="space-y-6">
                {parsedSections.map((section, index) => (
                    <div key={index}>
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{section.title}</h3>
                        <div>
                            {renderContent(section.content.trim())}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExplanationDisplay;
