import React, { useState } from 'react';
import { MindMapNode } from '../../types';
import { ChevronRightIcon } from '../common/Icons';

interface MindMapNodeProps {
    node: MindMapNode;
    isRoot?: boolean;
}

const MindMapNodeComponent: React.FC<MindMapNodeProps> = ({ node, isRoot = false }) => {
    const [isExpanded, setIsExpanded] = useState(isRoot);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className={isRoot ? '' : 'mt-2'}>
            <div className="flex items-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-left disabled:cursor-default group"
                    disabled={!hasChildren}
                >
                    {hasChildren ? (
                        <ChevronRightIcon className={`w-5 h-5 mr-1 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                    ) : (
                        <span className="w-5 h-5 mr-1 flex-shrink-0 inline-flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        </span>
                    )}
                    <span className={`font-medium ${isRoot ? 'text-xl text-[var(--color-primary)]' : 'text-slate-700'} group-hover:text-[var(--color-primary-hover)]`}>
                        {node.title}
                    </span>
                </button>
            </div>
            
            {hasChildren && isExpanded && (
                <div className="pl-4 mt-1 border-l-2 border-green-200/50">
                     <div className="pl-4 space-y-2">
                        {node.children.map((child, index) => (
                            <MindMapNodeComponent key={index} node={child} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
export default MindMapNodeComponent;