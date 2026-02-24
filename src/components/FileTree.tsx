import { Tree } from 'react-arborist';
import { FaFolder, FaFile, FaChevronRight, FaChevronDown, FaUpload, FaPlus, FaSync } from 'react-icons/fa';
import { useMemo } from 'react';
import type { FileNode } from '../types';

interface FileTreeProps {
    data: FileNode;
    onSelect: (node: FileNode) => void;
    onCheckIn?: (path: string) => void;
    onCheckInAsNew?: (path: string) => void;
    onSync?: (path: string) => void;
}

const FileTree = ({ data, onSelect, onCheckIn, onCheckInAsNew, onSync }: FileTreeProps) => {
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

                            {isFile && (
                                <div className="d-flex align-items-center ms-2 me-2">
                                    <button
                                        className={`btn btn-link p-0 me-2 ${canSync ? (node.isSelected ? 'text-white' : 'text-info') : 'text-muted'}`}
                                        disabled={!canSync}
                                        title="get latest version from remote"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSync?.(originalData.path);
                                        }}
                                        style={{ opacity: canSync ? 1 : 0.4, border: 'none', background: 'none' }}
                                    >
                                        <FaSync size={12} />
                                    </button>
                                    <button
                                        className={`btn btn-link p-0 me-2 ${canCheckIn ? (node.isSelected ? 'text-white' : 'text-primary') : 'text-muted'}`}
                                        disabled={!canCheckIn}
                                        title="check in"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCheckIn?.(originalData.path);
                                        }}
                                        style={{ opacity: canCheckIn ? 1 : 0.4, border: 'none', background: 'none' }}
                                    >
                                        <FaUpload size={14} />
                                    </button>
                                    <button
                                        className={`btn btn-link p-0 ${canCheckInAsNew ? (node.isSelected ? 'text-white' : 'text-success') : 'text-muted'}`}
                                        disabled={!canCheckInAsNew}
                                        title="check in as new"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCheckInAsNew?.(originalData.path);
                                        }}
                                        style={{ opacity: canCheckInAsNew ? 1 : 0.4, border: 'none', background: 'none' }}
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
