export interface Workspace {
  id: number
  name: string
  description: string
}



export interface FileNode {
  nodeId: number;
  name: string;
  nodeType: 'file' | 'folder';
  path: string;
  workspaceId: number;
  localVersionNum: number;
  currentVersion: number;
  latest: boolean;
  lastModifiedAt: string | null;
  lastSyncedAt: string | null;
  s3Url: string | null;
  s3VersionId: string | null;
  userS3Url: string | null;
  userS3VersionId: string | null;
  isLocked: Boolean | null;
  lockedBy: string | null;
  localLastModified?: string | null;
  children: FileNode[];
}
