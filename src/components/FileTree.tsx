import { Tree } from 'react-arborist';
import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { useMemo } from 'react';
import type { FileNode } from '../types';



interface FileTreeProps {
    data: FileNode;
    onSelect: (node: FileNode) => void;
}

const FileTree = ({ data, onSelect }: FileTreeProps) => {
    // react-arborist expects an array of roots
    const treeData = useMemo(() => {
        // Map the incoming structure to what react-arborist expects (id, name, children)
        const transform = (node: any): any => ({
            id: node.nodeId.toString(),
            name: node.name,
            children: node.children?.map(transform),
            originalData: node
        });
        return [transform(data)];
    }, [data]);

    return (
        <div className="file-tree-container" style={{ height: '400px', width: '100%', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
            <Tree
                initialData={treeData}
                openByDefault={false}
                width={"100%"}
                height={400}
                indent={20}
                rowHeight={32}
                disableDrag={true}
                disableEdit={true}
                disableDrop={true}
                onSelect={(nodes) => {
                    if (nodes.length > 0) {
                        onSelect(nodes[0].data.originalData);
                    }
                }}
            >
                {({ node, style, dragHandle }) => (
                    <div style={style} ref={dragHandle} className={`tree-node ${node.isSelected ? 'bg-primary text-white' : ''}`} >
                        <span className="me-2" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); node.toggle(); }}>
                            {node.data.originalData.nodeType === 'folder' ? (
                                node.isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />
                            ) : <span style={{ width: 12, display: 'inline-block' }}></span>}
                        </span>
                        <span className="me-2 text-warning" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); node.toggle(); }}>
                            {node.data.originalData.nodeType === 'folder' ? <FaFolder /> : <FaFile className="text-secondary" />}
                        </span>
                        <span style={{ cursor: 'pointer' }} onClick={() => onSelect(node.data.originalData)}>
                            {node.data.name}
                        </span>
                    </div>
                )}
            </Tree>
        </div>
    );
};

export default FileTree;
