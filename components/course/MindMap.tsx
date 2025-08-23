import React from 'react';
import { MindMapNode } from '../../types';
import MindMapNodeComponent from './MindMapNodeComponent';

interface MindMapProps {
    data: MindMapNode;
}

const MindMap: React.FC<MindMapProps> = ({ data }) => {
    return (
        <div className="p-4 bg-slate-50 rounded-lg border border-gray-200">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Module Mind Map</h3>
             <MindMapNodeComponent node={data} isRoot={true} />
        </div>
    );
};

export default MindMap;