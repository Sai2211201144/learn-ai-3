import React from 'react';
import CodeBlock from '../course/CodeBlock';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const elements: React.ReactNode[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const parseInline = (text: string) => {
            const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).filter(Boolean);
            return parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={index}>{part.slice(1, -1)}</em>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={index} className="bg-[var(--color-secondary)] text-[var(--color-primary)] px-1.5 py-1 rounded font-mono text-sm">{part.slice(1, -1)}</code>;
                }
                return <span key={index}>{part}</span>;
            });
        };

        if (line.startsWith('```')) {
            const lang = line.substring(3).trim();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(<div key={i} className="my-4"><CodeBlock code={codeLines.join('\n')} /></div>);
        } else if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-2xl font-bold text-[var(--color-foreground)] mt-8 mb-3">{parseInline(line.substring(4))}</h3>);
        } else if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-3xl font-bold text-[var(--color-foreground)] mt-10 mb-4 border-b border-[var(--color-border)] pb-2">{parseInline(line.substring(3))}</h2>);
        } else if (line.startsWith('# ')) {
            elements.push(<h1 key={i} className="text-4xl font-extrabold text-[var(--color-foreground)] mb-4">{parseInline(line.substring(2))}</h1>);
        } else if (line.trim() === '---') {
            elements.push(<hr key={i} className="my-8 border-t border-dashed border-[var(--color-border)]" />);
        } else if (line.startsWith('> ')) {
            elements.push(<blockquote key={i} className="my-4 pl-4 border-l-4 border-[var(--color-primary)] text-[var(--color-muted-foreground)] italic">{parseInline(line.substring(2))}</blockquote>);
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            const listItems = [];
            while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
                listItems.push(<li key={i}>{parseInline(lines[i].substring(2))}</li>);
                i++;
            }
            i--;
            elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 my-4 space-y-2 text-[var(--color-muted-foreground)]">{listItems}</ul>);
        } else if (line.match(/^\d+\. /)) {
            const listItems = [];
            while (i < lines.length && lines[i].match(/^\d+\. /)) {
                listItems.push(<li key={i}>{parseInline(lines[i].substring(lines[i].indexOf(' ') + 1))}</li>);
                i++;
            }
            i--;
            elements.push(<ol key={`ol-${i}`} className="list-decimal pl-6 my-4 space-y-2 text-[var(--color-muted-foreground)]">{listItems}</ol>);
        } else if (line.trim() !== '') {
            elements.push(<p key={i} className="my-4 text-[var(--color-muted-foreground)] leading-relaxed">{parseInline(line)}</p>);
        }
    }

    return <div className="prose max-w-none">{elements}</div>;
};

export default MarkdownRenderer;