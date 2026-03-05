import React from 'react';
import { FaDownload } from 'react-icons/fa';

interface HistoryItem {
    url: string;
    s3VersionId: string;
    username: string;
    createdAt: string;
    versionNumber: number;
    node_id: number;
}

interface FileHistoryTableProps {
    data: HistoryItem[];
    loading: boolean;
    filename?: string;
    onRestore: (nodeId: number, versionNumber: number) => void;
}

const FileHistoryTable: React.FC<FileHistoryTableProps> = ({ data, loading, filename, onRestore }) => {

    console.log("File history data:", data);
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading history...</span>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-5 bg-light rounded">
                <p className="text-muted mb-0">No history available for this file.</p>
            </div>
        );
    }

    const handleDownload = async (e: any, url: any, fileName: any) => {
        e.preventDefault(); // Prevents the <a> tag from opening the URL in a tab

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');

            // Convert the response into a Blob
            const blob = await response.blob();

            // Create a temporary local URL for the Blob
            const blobUrl = window.URL.createObjectURL(blob);

            // Create a hidden link, click it, then remove it
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', fileName); // This sets the actual filename
            document.body.appendChild(link);
            link.click();

            // Clean up memory
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback: If fetch fails (likely CORS), try opening in a new tab
            window.open(url, '_blank');
        }
    };
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Version</th>
                        <th>User</th>
                        <th>Created At</th>
                        <th className="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>
                                <span className="badge bg-secondary">V{item.versionNumber}</span>
                            </td>
                            <td>
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                        {item.username?.substring(0, 2).toUpperCase() || '??'}
                                    </div>
                                    {item.username}
                                </div>
                            </td>
                            <td>
                                <small className="text-muted">
                                    {new Date(item.createdAt).toLocaleString()}
                                </small>
                            </td>
                            <td className="text-end">
                                <button
                                    onClick={() => onRestore(item.node_id, item.versionNumber)}
                                    className="btn btn-outline-success btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center me-2"
                                    title="Restore this version"
                                    style={{ width: '30px', height: '30px' }}
                                >
                                    ↻
                                </button>
                                <a
                                    href={`${item.url}?versionId=${item.s3VersionId}`}
                                    onClick={(e) => handleDownload(e, `${item.url}?versionId=${item.s3VersionId}`, filename)}
                                    className="btn btn-outline-primary btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center"
                                    title="Download this version"
                                    style={{ width: '30px', height: '30px' }}
                                >
                                    <FaDownload size={14} />
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FileHistoryTable;
