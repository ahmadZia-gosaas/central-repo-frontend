import { Tree } from 'react-arborist';
import { FaFolder, FaFile, FaChevronRight, FaChevronDown, FaUpload, FaPlus, FaSync, FaHistory } from 'react-icons/fa';
import { useMemo } from 'react';
import type { FileNode } from '../types';

interface FileTreeProps {
    data: FileNode;
    onSelect: (node: FileNode) => void;
    onCheckIn?: (node: FileNode) => void;
    onCheckInAsNew?: (node: FileNode) => void;
    onSync?: (node: FileNode) => void;
    onHistory?: (node: FileNode) => void;
}

const FileTree = ({ data, onSelect, onCheckIn, onCheckInAsNew, onSync, onHistory }: FileTreeProps) => {
    // react-arborist expects an array of roots
const treeData = useMemo(() => {
    const transform = (node: any): any => ({
        // Explicitly check for -1 to trigger the fallback
        id: node.nodeId !== -1 
            ? node.nodeId.toString() 
            : `${node.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: node.name,
        children: node.children?.map(transform),
        originalData: node
    });

    return data ? [transform(data)] : [];
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
                {({ node, style, dragHandle }) => {
                    const originalData = node.data.originalData as FileNode;
                    const isFile = originalData.nodeType === 'file';

                    const localMod = originalData.localLastModified ? new Date(originalData.localLastModified).getTime() : 0;
                    const remoteMod = originalData.lastModifiedAt ? new Date(originalData.lastModifiedAt).getTime() : 0;

                    const canCheckIn = isFile && localMod > remoteMod && originalData.nodeId !== -1;
                    const canCheckInAsNew = isFile && originalData.nodeId === -1;
                    const canSync = isFile && originalData.localVersionNum < originalData.currentVersion;

                    return (
                        <div style={style} ref={dragHandle} className={`tree-node d-flex align-items-center ${node.isSelected ? 'bg-primary text-white' : ''}`} >
                            <span className="me-2" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); node.toggle(); }}>
                                {originalData.nodeType === 'folder' ? (
                                    node.isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />
                                ) : <span style={{ width: 12, display: 'inline-block' }}></span>}
                            </span>
                            <span className="me-2 text-warning" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); node.toggle(); }}>
                                {originalData.nodeType === 'folder' ? <FaFolder /> : <FaFile className={node.isSelected ? 'text-white' : 'text-secondary'} />}
                            </span>
                            <span
                                className="flex-grow-1 text-truncate"
                                style={{ cursor: 'pointer' }}
                                onClick={() => onSelect(originalData)}
                            >
                                {node.data.name}
                            </span>

                            {(isFile || originalData.nodeType === 'folder') && (
                                <div className="d-flex align-items-center ms-2 me-2">
                                    {isFile && (
                                        <button
                                            className={`btn btn-link p-0 me-2 ${node.isSelected ? 'text-white' : 'text-secondary'}`}
                                            title="view version history"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onHistory?.(originalData);
                                            }}
                                            style={{ border: 'none', background: 'none' }}
                                        >
                                            <FaHistory size={12} />
                                        </button>
                                    )}
                                    <button
                                        className={`btn btn-link p-0 me-2 ${(isFile ? canSync : true) ? (node.isSelected ? 'text-white' : 'text-info') : 'text-muted'}`}
                                        disabled={isFile ? !canSync : false}
                                        title="get latest version from remote"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSync?.(originalData);
                                        }}
                                        style={{ opacity: (isFile ? canSync : true) ? 1 : 0.4, border: 'none', background: 'none' }}
                                    >
                                        <FaSync size={12} />
                                    </button>
                                    <button
                                        className={`btn btn-link p-0 me-2 ${(isFile ? canCheckIn : true) ? (node.isSelected ? 'text-white' : 'text-primary') : 'text-muted'}`}
                                        disabled={isFile ? !canCheckIn : false}
                                        title="check in"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCheckIn?.(originalData);
                                        }}
                                        style={{ opacity: (isFile ? canCheckIn : true) ? 1 : 0.4, border: 'none', background: 'none' }}
                                    >
                                        <FaUpload size={14} />
                                    </button>
                                    <button
                                        className={`btn btn-link p-0 ${(isFile ? canCheckInAsNew : true) ? (node.isSelected ? 'text-white' : 'text-success') : 'text-muted'}`}
                                        disabled={isFile ? !canCheckInAsNew : false}
                                        title="check in as new"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCheckInAsNew?.(originalData);
                                        }}
                                        style={{ opacity: (isFile ? canCheckInAsNew : true) ? 1 : 0.4, border: 'none', background: 'none' }}
                                    >
                                        <FaPlus size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                }}
            </Tree>
        </div>
    );
};

export default FileTree;
