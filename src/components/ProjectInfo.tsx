import React from 'react';
import { FaSync } from 'react-icons/fa';

interface ProjectInfoProps {
    id: string | undefined;
    name: string | undefined;
    rootPath: string | undefined;
    onRefresh: () => void;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({ id, name, rootPath, onRefresh }) => {
    return (
        <div className="row mt-4">
            <div className="col-md-6 mb-3">
                <p className="text-muted small">Project ID</p>
                <h5 className="fw-bold">{id}</h5>
            </div>
            <div className="col-md-6 mb-3">
                <p className="text-muted small">Project Name</p>
                <h5 className="fw-bold">{name}</h5>
            </div>
            {rootPath && (
                <div className="col-md-12 mb-3">
                    <p className="text-muted small">Local Root Path</p>
                    <div className="d-flex align-items-center">
                        <h5 className="fw-bold text-primary mb-0 me-3">{rootPath}</h5>
                        <button
                            className="btn btn-outline-primary btn-sm rounded-circle shadow-sm"
                            onClick={onRefresh}
                            title="show updated state of the local directory"
                            style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <FaSync size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectInfo;
