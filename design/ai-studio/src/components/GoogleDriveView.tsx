import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Folder,
  FileText,
  Upload,
  Plus,
  Search,
  Grid,
  List,
  Star,
  Trash2,
  ExternalLink,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  FileCheck,
  FileSpreadsheet,
  FileImage,
  File,
  LogOut,
  ChevronRight,
  Database,
  Lock,
  Download,
  X,
  FileUp,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
} from '../firebase';
import {
  DriveFile,
  DriveStorageQuota,
  SAMPLE_FLEET_DOCS,
  fetchDriveFiles,
  createDriveFolder,
  uploadDriveFile,
  deleteDriveFile,
  toggleStarDriveFile,
  getDriveStorageQuota,
  formatBytes,
} from '../services/googleDriveService';

interface BreadcrumbItem {
  id: string;
  name: string;
}

export const GoogleDriveView: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Files & folders state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(SAMPLE_FLEET_DOCS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quota, setQuota] = useState<DriveStorageQuota | null>(null);
  const [currentFolder, setCurrentFolder] = useState<BreadcrumbItem>({
    id: 'root',
    name: 'Compliance Vault Root',
  });
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'Drive Root' },
  ]);

  // UI state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);

  // Modal states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Mandatory Destructive Operation Confirmation Dialog
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // File input ref for upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        loadDriveData(token, 'root');
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    // Initial check for existing token
    getAccessToken().then((token) => {
      if (token && auth.currentUser) {
        setUser(auth.currentUser);
        setAccessToken(token);
        loadDriveData(token, 'root');
      }
    });

    return () => unsubscribe();
  }, []);

  // Load files from Google Drive or sample fallback
  const loadDriveData = async (token?: string | null, folderId = currentFolder.id) => {
    const activeToken = token || accessToken;
    if (!activeToken) {
      // In demo mode, load local sample fleet docs
      setIsLoading(true);
      setTimeout(() => {
        setDriveFiles(SAMPLE_FLEET_DOCS);
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      setIsLoading(true);
      setAuthError(null);
      const parentQuery = folderId === 'root' ? undefined : folderId;
      const [result, quotaInfo] = await Promise.all([
        fetchDriveFiles(activeToken, { parentFolderId: parentQuery }),
        getDriveStorageQuota(activeToken),
      ]);

      if (result.files && result.files.length > 0) {
        setDriveFiles(result.files);
      } else if (folderId === 'root') {
        // If live drive root is empty, include sample compliance structures
        setDriveFiles(SAMPLE_FLEET_DOCS);
      } else {
        setDriveFiles([]);
      }

      if (quotaInfo) {
        setQuota(quotaInfo);
      }
    } catch (err: any) {
      console.warn('Error fetching live Google Drive files, showing compliance vault preview:', err);
      setAuthError(err.message || 'Failed to sync with live Google Drive.');
      setDriveFiles(SAMPLE_FLEET_DOCS);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await loadDriveData(result.accessToken, 'root');
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        console.warn('Google Drive sign in popup was closed by user.');
        setAuthError('Sign-in cancelled. Click "Connect Google Drive" whenever you are ready.');
      } else {
        console.error('Google Drive sign in failed:', err);
        setAuthError(err.message || 'Sign in failed. Check popup permissions.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout Flow
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setDriveFiles(SAMPLE_FLEET_DOCS);
      setCurrentFolder({ id: 'root', name: 'Drive Root' });
      setBreadcrumbs([{ id: 'root', name: 'Drive Root' }]);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Folder navigation
  const navigateToFolder = (folder: DriveFile) => {
    const nextFolder: BreadcrumbItem = { id: folder.id, name: folder.name };
    setCurrentFolder(nextFolder);
    setBreadcrumbs((prev) => [...prev, nextFolder]);
    loadDriveData(accessToken, folder.id);
  };

  const navigateToBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentFolder(target);
    loadDriveData(accessToken, target.id);
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    if (accessToken) {
      try {
        setIsLoading(true);
        const parentId = currentFolder.id === 'root' ? undefined : currentFolder.id;
        const created = await createDriveFolder(accessToken, newFolderName.trim(), parentId);
        setDriveFiles((prev) => [created, ...prev]);
        setIsCreateFolderOpen(false);
        setNewFolderName('');
      } catch (err: any) {
        alert(`Failed to create folder in Drive: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local demo creation
      const mockFolder: DriveFile = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        mimeType: 'application/vnd.google-apps.folder',
        modifiedTime: new Date().toISOString(),
        parents: [currentFolder.id],
        complianceCategory: 'OTHER',
      };
      setDriveFiles((prev) => [mockFolder, ...prev]);
      setIsCreateFolderOpen(false);
      setNewFolderName('');
    }
  };

  // Upload File
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    if (accessToken) {
      try {
        const parentId = currentFolder.id === 'root' ? undefined : currentFolder.id;
        const uploaded = await uploadDriveFile(accessToken, uploadFile, parentId);
        setDriveFiles((prev) => [uploaded, ...prev]);
        setIsUploadOpen(false);
        setUploadFile(null);
      } catch (err: any) {
        alert(`Failed to upload to Google Drive: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Local demo upload
      setTimeout(() => {
        const mockUploaded: DriveFile = {
          id: `file-${Date.now()}`,
          name: uploadFile.name,
          mimeType: uploadFile.type || 'application/pdf',
          size: String(uploadFile.size),
          modifiedTime: new Date().toISOString(),
          parents: [currentFolder.id],
          complianceCategory: 'DVIR',
          statuteCitation: '49 CFR § 396.11',
        };
        setDriveFiles((prev) => [mockUploaded, ...prev]);
        setIsUploading(false);
        setIsUploadOpen(false);
        setUploadFile(null);
      }, 500);
    }
  };

  // Toggle Star
  const handleToggleStar = async (file: DriveFile, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStarred = !file.starred;
    if (accessToken) {
      try {
        await toggleStarDriveFile(accessToken, file.id, nextStarred);
        setDriveFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, starred: nextStarred } : f))
        );
      } catch (err: any) {
        console.error('Failed to toggle star:', err);
      }
    } else {
      setDriveFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, starred: nextStarred } : f))
      );
    }
  };

  // MANDATORY DESTRUCTIVE CONFIRMATION EXECUTION
  const executeDeleteFile = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    if (accessToken) {
      try {
        await deleteDriveFile(accessToken, fileToDelete.id);
        setDriveFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
        if (selectedFile?.id === fileToDelete.id) {
          setSelectedFile(null);
        }
        setFileToDelete(null);
      } catch (err: any) {
        alert(`Failed to delete document: ${err.message}`);
      } finally {
        setIsDeleting(false);
      }
    } else {
      // Local demo delete
      setDriveFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      if (selectedFile?.id === fileToDelete.id) {
        setSelectedFile(null);
      }
      setFileToDelete(null);
      setIsDeleting(false);
    }
  };

  // Filtered files in current folder
  const currentLevelFiles = useMemo(() => {
    return driveFiles.filter((file) => {
      // In root, include files with no parents or root parent
      if (currentFolder.id === 'root') {
        const isRootChild =
          !file.parents || file.parents.length === 0 || file.parents.includes('root');
        return isRootChild;
      }
      // Inside a folder, match parent folder id
      return file.parents && file.parents.includes(currentFolder.id);
    });
  }, [driveFiles, currentFolder]);

  // Apply search and category filters
  const filteredFiles = useMemo(() => {
    return currentLevelFiles.filter((file) => {
      const matchesSearch =
        !searchQuery ||
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.complianceCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.statuteCitation?.toLowerCase().includes(searchQuery.toLowerCase());

      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

      let matchesCat = true;
      if (activeCategory === 'FOLDERS') {
        matchesCat = isFolder;
      } else if (activeCategory === 'STARRED') {
        matchesCat = !!file.starred;
      } else if (activeCategory === 'PDF') {
        matchesCat = file.mimeType.includes('pdf');
      } else if (activeCategory !== 'ALL') {
        matchesCat = file.complianceCategory === activeCategory;
      }

      return matchesSearch && matchesCat;
    });
  }, [currentLevelFiles, searchQuery, activeCategory]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-[#F59E0B]" fill="#F59E0B" fillOpacity={0.25} />;
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-[#EF4444]" />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-[#10B981]" />;
    }
    if (mimeType.includes('image')) {
      return <FileImage className="w-5 h-5 text-[#06B6D4]" />;
    }
    return <File className="w-5 h-5 text-[#8f9097]" />;
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Banner & Header */}
      <div className="bg-[#0B192C] border border-[#1f2a3c] rounded p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded bg-[#121F33] border border-[#1f2a3c] flex items-center justify-center shrink-0">
              {/* Google Drive Tri-color Iconic Diamond */}
              <svg className="w-7 h-7" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.45-1.2h-18.6c-1.55 0-3.1.4-4.45 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.45 1.2h50.8c1.55 0 3.1-.4 4.45-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline text-xl sm:text-2xl uppercase text-white font-bold tracking-tight">
                  GOOGLE DRIVE // FLEET COMPLIANCE VAULT
                </h1>
                <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-mono text-[10px] font-bold rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  49 CFR § 391 & § 396
                </span>
                {accessToken ? (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 font-mono text-[10px] font-bold rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    LIVE DRIVE API CONNECTED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-mono text-[10px] font-bold rounded">
                    PREVIEW VAULT MODE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8f9097] font-mono mt-1 max-w-2xl">
                Cryptographically synchronized fleet document repository for FMCSA audits, DQF qualification files,
                annual periodic vehicle inspections, IFTA fuel records, and signed bills of lading.
              </p>
            </div>
          </div>

          {/* User Auth Bar / Sign In With Google */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            {user ? (
              <div className="flex items-center gap-3 bg-[#121F33] border border-[#1f2a3c] rounded px-3 py-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-[#F59E0B]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0B192C] text-[#F59E0B] flex items-center justify-center font-bold text-xs">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">
                    {user.displayName || 'Fleet Compliance Officer'}
                  </span>
                  <span className="text-[10px] font-mono text-[#8f9097] truncate max-w-[140px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Disconnect Google Account"
                  className="text-[#8f9097] hover:text-white p-1.5 rounded hover:bg-[#0B192C] transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Sign in with Google Button per Workspace Integration Skill */
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="gsi-material-button inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded shadow transition-all disabled:opacity-50"
              >
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isAuthenticating ? 'Connecting to Drive...' : 'Sign in with Google'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Quota & Storage telemetry bar */}
        {quota && (
          <div className="mt-4 pt-3 border-t border-[#1f2a3c] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#8f9097]">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>
                GOOGLE DRIVE STORAGE: {formatBytes(quota.usage)} of{' '}
                {quota.limit ? formatBytes(quota.limit) : 'Unlimited'} used
              </span>
            </div>
            {quota.limit && (
              <div className="w-full sm:w-48 bg-[#121F33] h-1.5 rounded-full overflow-hidden border border-[#1f2a3c]">
                <div
                  className="bg-[#F59E0B] h-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (parseInt(quota.usage, 10) / parseInt(quota.limit, 10)) * 100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {authError && (
        <div className="bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono p-3 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Notice: {authError}</span>
          </div>
          <button
            onClick={() => setAuthError(null)}
            className="text-amber-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Toolbar & Breadcrumbs */}
      <div className="bg-[#121F33] border border-[#1f2a3c] rounded p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs text-[#8f9097]">
          <HardDrive className="w-4 h-4 text-[#F59E0B] mr-1" />
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#44474c]" />}
              <button
                onClick={() => navigateToBreadcrumb(idx)}
                className={`hover:text-white transition-colors ${
                  idx === breadcrumbs.length - 1 ? 'text-white font-bold underline' : ''
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadDriveData(accessToken, currentFolder.id)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B192C] hover:bg-[#1f2a3c] text-[#d8e3fb] text-xs font-mono rounded border border-[#1f2a3c] transition-colors"
            title="Sync latest files"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F59E0B]' : ''}`} />
            <span>SYNC</span>
          </button>

          <button
            onClick={() => setIsCreateFolderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B192C] hover:bg-[#1f2a3c] text-white text-xs font-mono font-bold rounded border border-[#1f2a3c] transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>NEW FOLDER</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-black text-xs font-mono font-bold uppercase rounded transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-black" />
            <span>UPLOAD DOC</span>
          </button>

          <div className="border-l border-[#1f2a3c] pl-2 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#0B192C] text-[#F59E0B]' : 'text-[#8f9097] hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-[#0B192C] text-[#F59E0B]' : 'text-[#8f9097] hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8f9097] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search compliance docs by title, statute citation (e.g. 49 CFR), or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B192C] border border-[#1f2a3c] rounded pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-[#8f9097] focus:outline-none focus:border-[#F59E0B]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f9097] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-[11px]">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'FOLDERS', label: 'Folders' },
            { id: 'PERMITS', label: 'Permits & Authority' },
            { id: 'DQF', label: 'DQF Qualifications' },
            { id: 'DVIR', label: 'DVIR Inspections' },
            { id: 'BOL', label: 'BOL / POD' },
            { id: 'STARRED', label: 'Starred' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors border ${
                activeCategory === cat.id
                  ? 'bg-[#F59E0B] text-black font-bold border-[#F59E0B]'
                  : 'bg-[#121F33] text-[#8f9097] hover:text-white border-[#1f2a3c]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Files Display Area */}
      {isLoading ? (
        <div className="bg-[#0B192C] border border-[#1f2a3c] rounded p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#F59E0B] animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-[#8f9097]">Synchronizing with Google Drive...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-[#0B192C] border border-dashed border-[#1f2a3c] rounded p-12 text-center space-y-3">
          <Folder className="w-10 h-10 text-[#8f9097] mx-auto opacity-50" />
          <h3 className="font-headline text-base font-bold text-white uppercase tracking-tight">
            NO COMPLIANCE DOCUMENTS FOUND IN THIS VIEW
          </h3>
          <p className="text-xs text-[#8f9097] max-w-md mx-auto font-mono">
            Upload new carrier documents, create a folder, or adjust your search filter to locate specific
            compliance records.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3 py-1.5 bg-[#F59E0B] text-black text-xs font-mono font-bold uppercase rounded"
            >
              UPLOAD FIRST DOCUMENT
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredFiles.map((file) => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            return (
              <div
                key={file.id}
                onClick={() => (isFolder ? navigateToFolder(file) : setSelectedFile(file))}
                className="bg-[#121F33] border border-[#1f2a3c] hover:border-[#F59E0B]/70 rounded p-3 flex flex-col justify-between cursor-pointer group transition-all relative overflow-hidden shadow-sm"
              >
                {/* Accent top line for starred */}
                {file.starred && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#F59E0B]" />
                )}

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#0B192C] rounded border border-[#1f2a3c] group-hover:border-[#F59E0B]/40 transition-colors">
                        {getFileIcon(file.mimeType)}
                      </div>
                      {file.complianceCategory && (
                        <span className="px-1.5 py-0.5 bg-[#0B192C] text-[#d8e3fb] border border-[#1f2a3c] font-mono text-[9px] uppercase font-bold rounded">
                          {file.complianceCategory}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleStar(file, e)}
                        className={`p-1 rounded transition-colors ${
                          file.starred ? 'text-[#F59E0B]' : 'text-[#8f9097] hover:text-[#F59E0B]'
                        }`}
                        title={file.starred ? 'Unstar file' : 'Star file'}
                      >
                        <Star className="w-3.5 h-3.5" fill={file.starred ? '#F59E0B' : 'none'} />
                      </button>

                      {/* Explicit Delete Button triggering Mandatory Dialog */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileToDelete(file);
                        }}
                        className="p-1 text-[#8f9097] hover:text-rose-400 rounded transition-colors"
                        title="Delete from Google Drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-headline text-sm font-bold text-white tracking-tight break-all line-clamp-2 group-hover:text-[#F59E0B] transition-colors">
                      {file.name}
                    </h4>
                    {file.statuteCitation && (
                      <p className="text-[10px] font-mono text-[#F59E0B] mt-0.5">
                        {file.statuteCitation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1f2a3c] flex items-center justify-between font-mono text-[10px] text-[#8f9097]">
                  <span>{isFolder ? 'Folder' : formatBytes(file.size)}</span>
                  <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#121F33] border border-[#1f2a3c] rounded overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0B192C] text-[#8f9097] uppercase border-b border-[#1f2a3c] text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-8"></th>
                  <th className="py-2.5 px-3">Document Name</th>
                  <th className="py-2.5 px-3">Compliance Category</th>
                  <th className="py-2.5 px-3">CFR Statute</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Modified</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2a3c]">
                {filteredFiles.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  return (
                    <tr
                      key={file.id}
                      onClick={() => (isFolder ? navigateToFolder(file) : setSelectedFile(file))}
                      className="hover:bg-[#18263d] cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <button
                          onClick={(e) => handleToggleStar(file, e)}
                          className={`${file.starred ? 'text-[#F59E0B]' : 'text-[#44474c] hover:text-[#F59E0B]'}`}
                        >
                          <Star className="w-3.5 h-3.5" fill={file.starred ? '#F59E0B' : 'none'} />
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-white group-hover:text-[#F59E0B] transition-colors">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.mimeType)}
                          <span className="truncate max-w-xs">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        {file.complianceCategory ? (
                          <span className="px-1.5 py-0.5 bg-[#0B192C] text-[#d8e3fb] border border-[#1f2a3c] text-[9px] uppercase font-bold rounded">
                            {file.complianceCategory}
                          </span>
                        ) : (
                          <span className="text-[#8f9097]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[#F59E0B] text-[11px]">
                        {file.statuteCitation || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#8f9097]">
                        {isFolder ? 'Folder' : formatBytes(file.size)}
                      </td>
                      <td className="py-2.5 px-3 text-[#8f9097]">
                        {new Date(file.modifiedTime).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-[#8f9097] hover:text-white inline-block"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileToDelete(file);
                          }}
                          className="p-1 text-[#8f9097] hover:text-rose-400 inline-block"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected File Details Drawer / Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B192C] border border-[#1f2a3c] rounded max-w-lg w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between gap-3 border-b border-[#1f2a3c] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#121F33] rounded border border-[#1f2a3c]">
                  {getFileIcon(selectedFile.mimeType)}
                </div>
                <div>
                  <h3 className="font-headline text-base uppercase text-white font-bold tracking-tight break-all">
                    {selectedFile.name}
                  </h3>
                  <p className="text-xs font-mono text-[#8f9097]">{selectedFile.mimeType}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-[#8f9097] hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-[#1f2a3c]/60">
                <span className="text-[#8f9097]">Compliance Category:</span>
                <span className="text-[#F59E0B] font-bold">{selectedFile.complianceCategory || 'GENERAL'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f2a3c]/60">
                <span className="text-[#8f9097]">Governing Statute:</span>
                <span className="text-white">{selectedFile.statuteCitation || '49 CFR Compliant'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f2a3c]/60">
                <span className="text-[#8f9097]">File Size:</span>
                <span className="text-white">{formatBytes(selectedFile.size)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f2a3c]/60">
                <span className="text-[#8f9097]">Last Modified:</span>
                <span className="text-white">{new Date(selectedFile.modifiedTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f2a3c]/60">
                <span className="text-[#8f9097]">Drive Document ID:</span>
                <span className="text-[#8f9097] truncate max-w-[200px]">{selectedFile.id}</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const target = selectedFile;
                  setSelectedFile(null);
                  setFileToDelete(target);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 text-rose-300 hover:bg-rose-900 border border-rose-800 rounded font-mono text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE DOCUMENT</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedFile.webViewLink ? (
                  <a
                    href={selectedFile.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] text-black font-mono text-xs font-bold rounded hover:bg-[#D97706] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>OPEN IN GOOGLE DRIVE</span>
                  </a>
                ) : (
                  <button
                    onClick={() => alert(`Opening ${selectedFile.name} in viewer.`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] text-black font-mono text-xs font-bold rounded hover:bg-[#D97706] transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>INSPECT AUDIT METADATA</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFolder}
            className="bg-[#0B192C] border border-[#1f2a3c] rounded max-w-md w-full p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1f2a3c] pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-headline text-base uppercase text-white font-bold">
                  CREATE COMPLIANCE FOLDER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="text-[#8f9097] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8f9097]">Folder Name</label>
              <input
                type="text"
                required
                placeholder="e.g. 2026 IFTA Fuel Decals, Hazmat Tier 2"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-[#121F33] border border-[#1f2a3c] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F59E0B]"
                autoFocus
              />
              <p className="text-[10px] font-mono text-[#8f9097]">
                Folder will be created inside: <span className="text-white">{currentFolder.name}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-3 py-1.5 bg-[#121F33] hover:bg-[#1f2a3c] text-[#8f9097] text-xs font-mono rounded"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isLoading || !newFolderName.trim()}
                className="px-4 py-1.5 bg-[#F59E0B] text-black text-xs font-mono font-bold uppercase rounded hover:bg-[#D97706] disabled:opacity-50"
              >
                CREATE IN DRIVE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-[#0B192C] border border-[#1f2a3c] rounded max-w-md w-full p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1f2a3c] pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-headline text-base uppercase text-white font-bold">
                  UPLOAD COMPLIANCE DOCUMENT
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadFile(null);
                }}
                className="text-[#8f9097] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  setUploadFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-[#1f2a3c] hover:border-[#F59E0B] rounded p-6 text-center cursor-pointer transition-colors bg-[#121F33]/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setUploadFile(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-8 h-8 text-[#F59E0B] mx-auto mb-2 opacity-80" />
              {uploadFile ? (
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-white truncate max-w-xs mx-auto">
                    {uploadFile.name}
                  </p>
                  <p className="text-[10px] font-mono text-[#10B981]">
                    {formatBytes(uploadFile.size)} ready to sync
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-mono text-white font-bold">
                    Click to browse or drag file here
                  </p>
                  <p className="text-[10px] font-mono text-[#8f9097]">
                    Supports PDF, CSV, Excel, Scanned JPG/PNG (Up to 25MB)
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] font-mono text-[#8f9097] flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Target Folder: {currentFolder.name}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadFile(null);
                }}
                className="px-3 py-1.5 bg-[#121F33] hover:bg-[#1f2a3c] text-[#8f9097] text-xs font-mono rounded"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="px-4 py-1.5 bg-[#F59E0B] text-black text-xs font-mono font-bold uppercase rounded hover:bg-[#D97706] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isUploading ? 'UPLOADING...' : 'UPLOAD TO GOOGLE DRIVE'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE OPERATION PER WORKSPACE SKILL */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B192C] border-2 border-rose-600/80 rounded max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-950/60 border border-rose-600/50 rounded text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline text-lg uppercase text-white font-bold tracking-tight">
                  CONFIRM PERMANENT REMOVAL
                </h3>
                <p className="text-xs font-mono text-rose-300">
                  CRITICAL WORKSPACE SAFETY CONFIRMATION
                </p>
              </div>
            </div>

            <div className="bg-[#070E18] border border-[#1f2a3c] rounded p-3 space-y-2 text-xs font-mono">
              <p className="text-[#d8e3fb]">
                Are you sure you want to delete the following document from Google Drive?
              </p>
              <div className="p-2 bg-[#121F33] rounded border border-[#1f2a3c] text-white font-bold break-all">
                {fileToDelete.name}
              </div>
              <p className="text-[11px] text-[#8f9097]">
                This will remove the file permanently from the active Google Drive folder and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 bg-[#121F33] hover:bg-[#1f2a3c] text-[#d8e3fb] text-xs font-mono font-bold rounded transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDeleteFile}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold uppercase rounded transition-colors shadow-lg"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? 'DELETING...' : 'YES, PERMANENTLY DELETE'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
