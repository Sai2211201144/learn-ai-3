import React, { useState } from 'react';
import { PracticeConcept } from '../../types';
import { ChevronDownIcon, DocumentIcon, CodeIcon } from '../common/Icons';
import CodeBlock from '../course/CodeBlock';

interface PracticeConceptAccordionProps {
    concept: PracticeConcept;
}

const PracticeConceptAccordion: React.FC<PracticeConceptAccordionProps> = ({ concept }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-100 transition-colors"
                aria-expanded={isExpanded}
            >
                <h3 className="text-lg font-bold text-gray-800">{concept.title}</h3>
                <ChevronDownIcon
                    className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0">
                    <div className="p-4 border-t border-gray-200/80 space-y-4">
                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-gray-600 text-sm mb-2">
                                <DocumentIcon className="w-5 h-5 text-sky-500"/>
                                Explanation
                            </h4>
                            <p className="text-gray-700 leading-relaxed">{concept.description}</p>
                        </div>
                         <div>
                            <h4 className="flex items-center gap-2 font-semibold text-gray-600 text-sm mb-2">
                                <CodeIcon className="w-5 h-5 text-amber-500"/>
                                Code Example
                            </h4>
                            <CodeBlock code={concept.codeExample} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeConceptAccordion;