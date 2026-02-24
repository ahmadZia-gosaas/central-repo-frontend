import React from 'react';
import { FaInfoCircle, FaCalendarAlt, FaClock, FaLink, FaLock } from 'react-icons/fa';
import type{ FileNode } from '../types';

interface FilePropertiesProps {
    selectedNode: FileNode | null;
    rootPath: string | undefined;
    onCheckout: () => void;
}

const FileProperties: React.FC<FilePropertiesProps> = ({ selectedNode, rootPath, onCheckout }) => {
    if (!selectedNode) {
        return (
            <div className="text-center py-5">
                <p className="text-muted">Select a node to view its properties</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex align-items-center mb-4">
                <div className="bg-white p-2 rounded shadow-sm me-3 text-primary">
                    <FaInfoCircle size={24} />
                </div>
                <div>
                    <h5 className="mb-0 fw-bold">{selectedNode.name}</h5>
                    <span className={`badge ${selectedNode.nodeType === 'folder' ? 'bg-warning text-dark' : 'bg-info'}`}>
                        {selectedNode.nodeType.toUpperCase()}
                    </span>
                </div>
            </div>

            {selectedNode.nodeType === 'file' && (
                <div className="property-group mb-3">
                    <div className="d-flex align-items-center text-muted small mb-1">
                        <FaCalendarAlt className="me-2" /> Last Modified (Remote)
                    </div>
                    <div className="fw-bold ps-4">
                        {selectedNode.lastModifiedAt ? new Date(selectedNode.lastModifiedAt).toLocaleString() : 'N/A'}
                    </div>
                </div>
            )}

            {selectedNode.nodeType === 'file' && selectedNode.localLastModified && (
                <div className="property-group mb-3">
                    <div className="d-flex align-items-center text-success small mb-1">
                        <FaClock className="me-2" /> Last Modified (Local)
                    </div>
                    <div className="fw-bold ps-4">
                        {new Date(selectedNode.localLastModified).toLocaleString()}
                    </div>
                </div>
            )}

            {selectedNode.nodeType === 'file' && (
                <>
                    <div className="property-group mb-3">
                        <div className="d-flex align-items-center text-muted small mb-1">
                            <FaClock className="me-2" /> Version
                        </div>
                        <div className="fw-bold ps-4">{"L:" + selectedNode.localVersionNum}</div>
                        <div className="fw-bold ps-4">
                            {selectedNode.currentVersion ? "C:" + selectedNode.currentVersion : 'N/A'}
                        </div>
                    </div>

                    <div className="property-group mb-3">
                        <div className="d-flex align-items-center text-muted small mb-1">
                            <FaLink className="me-2" /> S3 URL
                        </div>
                        <div className="ps-4 overflow-hidden text-truncate" style={{ maxWidth: '100%' }}>
                            {selectedNode.s3Url ? (
                                <a href={selectedNode.s3Url} target="_blank" rel="noopener noreferrer" className="text-break small">
                                    {selectedNode.s3Url}
                                </a>
                            ) : 'None'}
                        </div>
                    </div>
                </>
            )}

            <div className="property-group mb-3">
                <div className="d-flex align-items-center text-muted small mb-1">
                    <FaInfoCircle className="me-2" /> Path
                </div>
                <code className="ps-4 d-block small text-dark">{selectedNode.path}</code>
            </div>

            {selectedNode.isLocked && (
                <div className="property-group mb-3">
                    <div className="d-flex align-items-center text-danger small mb-1">
                        <FaLock className="me-2" /> Locked
                    </div>
                    <div className="fw-bold ps-4 text-danger">
                        By: {selectedNode.lockedBy || 'Unknown'}
                    </div>
                </div>
            )}

            <div className="mt-4 pt-2 border-top">
                <button
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    onClick={onCheckout}
                    disabled={!rootPath}
                >
                    <FaClock className="me-2" /> Check Out
                </button>
                {!rootPath && (
                    <p className="text-danger small mt-2 mb-0">
                        Local root path not found. Please clone the project first.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FileProperties;
