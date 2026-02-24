import type { FileNode } from '../types';

/**
 * Merges a local file tree structure into a remote FileNode structure.
 * Updates localLastModified for existing files and adds new nodes found locally.
 */
export const mergeTrees = (remoteNode: FileNode, localNode: any): FileNode => {
    const updatedNode = { ...remoteNode };

    // Update localLastModified if it's a file
    if (remoteNode.nodeType === 'file') {
        updatedNode.localLastModified = localNode.lastModifiedAt || localNode.lastModified;
    }

    // Merge children
    if (localNode.children && Array.isArray(localNode.children)) {
        const remoteChildrenMap = new Map(remoteNode.children.map(child => [child.name, child]));
        const mergedChildren = [...remoteNode.children];

        localNode.children.forEach((localChild: any) => {
            const remoteChild = remoteChildrenMap.get(localChild.name);
            if (remoteChild) {
                // Recursive merge for existing nodes
                const mergedChild = mergeTrees(remoteChild, localChild);
                const index = mergedChildren.findIndex(c => c.name === localChild.name);
                mergedChildren[index] = mergedChild;
            } else {
                // New node found locally but not in remote state
                const newNode: FileNode = {
                    nodeId: -1,
                    name: localChild.name,
                    nodeType: (localChild.children && localChild.children.length > 0) || localChild.type === 'folder' ? 'folder' : 'file',
                    path: localChild.path,
                    workspaceId: remoteNode.workspaceId,
                    localVersionNum: 0,
                    currentVersion: 0,
                    latest: false,
                    lastModifiedAt: null,
                    lastSyncedAt: null,
                    s3Url: null,
                    s3VersionId: null,
                    userS3Url: null,
                    userS3VersionId: null,
                    isLocked: false,
                    lockedBy: null,
                    localLastModified: localChild.lastModifiedAt,
                    children: []
                };

                if (localChild.children) {
                    const processedNewNode = mergeTrees(newNode, localChild);
                    mergedChildren.push(processedNewNode);
                } else {
                    mergedChildren.push(newNode);
                }
            }
        });
        updatedNode.children = mergedChildren;
    }

    return updatedNode;
};
