// Google Drive API v3 Service for Truckwithease Enterprise Compliance Vault

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  createdTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  starred?: boolean;
  trashed?: boolean;
  // Fleet compliance domain metadata
  complianceCategory?: 'PERMITS' | 'DQF' | 'DVIR' | 'BOL' | 'AUDIT' | 'INSURANCE' | 'OTHER';
  statuteCitation?: string;
}

export interface DriveStorageQuota {
  limit: string;
  usage: string;
  usageInDrive: string;
  usageInDriveTrash: string;
}

// Default Seed Fleet Compliance Structure for Instant Preview & Offline Navigation
export const SAMPLE_FLEET_DOCS: DriveFile[] = [
  {
    id: 'folder-permits',
    name: 'Carrier Permits & Operating Authority',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2026-03-01T14:20:00Z',
    complianceCategory: 'PERMITS',
    statuteCitation: '49 CFR § 365',
    starred: true,
  },
  {
    id: 'folder-dqf',
    name: 'Driver Qualification Files (DQF)',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2026-03-02T09:15:00Z',
    complianceCategory: 'DQF',
    statuteCitation: '49 CFR § 391.51',
    starred: true,
  },
  {
    id: 'folder-dvir',
    name: 'Vehicle Inspections & DVIR Audits',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2026-03-03T18:45:00Z',
    complianceCategory: 'DVIR',
    statuteCitation: '49 CFR § 396.11',
  },
  {
    id: 'folder-bolds',
    name: 'Signed BOLs & Freight Proof of Delivery',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2026-03-04T11:30:00Z',
    complianceCategory: 'BOL',
    statuteCitation: '49 CFR § 373.101',
  },
  {
    id: 'folder-audits',
    name: 'FMCSA Safety Management & Hazmat Security',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2026-02-28T16:00:00Z',
    complianceCategory: 'AUDIT',
    statuteCitation: '49 CFR § 385 / HM-232',
  },
  // Files inside Carrier Permits
  {
    id: 'file-mc-authority',
    name: 'FMCSA_Operating_Authority_MC-1492041_Certificate.pdf',
    mimeType: 'application/pdf',
    size: '1428500',
    modifiedTime: '2026-01-15T10:00:00Z',
    parents: ['folder-permits'],
    complianceCategory: 'PERMITS',
    statuteCitation: '49 CFR § 365.101',
    starred: true,
  },
  {
    id: 'file-bmc91x',
    name: 'BMC-91X_Public_Liability_Endorsement_1M_Travelers.pdf',
    mimeType: 'application/pdf',
    size: '895400',
    modifiedTime: '2026-01-20T11:20:00Z',
    parents: ['folder-permits'],
    complianceCategory: 'INSURANCE',
    statuteCitation: '49 CFR § 387.7',
  },
  {
    id: 'file-ucr-receipt',
    name: 'UCR_Unified_Carrier_Registration_2026_Receipt.pdf',
    mimeType: 'application/pdf',
    size: '412000',
    modifiedTime: '2026-01-08T08:30:00Z',
    parents: ['folder-permits'],
    complianceCategory: 'PERMITS',
    statuteCitation: '49 U.S.C. § 14504a',
  },
  {
    id: 'file-ifta-decal',
    name: 'IFTA_Quarterly_License_Decal_Roster_Q1-2026.pdf',
    mimeType: 'application/pdf',
    size: '684000',
    modifiedTime: '2026-01-12T15:40:00Z',
    parents: ['folder-permits'],
    complianceCategory: 'PERMITS',
    statuteCitation: 'IFTA Articles of Agreement § R300',
  },
  // Files inside DQF
  {
    id: 'file-med-cert',
    name: 'Medical_Examiner_Cert_MCSA-5876_J_Vance.pdf',
    mimeType: 'application/pdf',
    size: '720300',
    modifiedTime: '2026-02-10T13:00:00Z',
    parents: ['folder-dqf'],
    complianceCategory: 'DQF',
    statuteCitation: '49 CFR § 391.43',
    starred: true,
  },
  {
    id: 'file-cdl-scan',
    name: 'Commercial_Drivers_License_ClassA_DoubleTriples_Endorsements.pdf',
    mimeType: 'application/pdf',
    size: '1240000',
    modifiedTime: '2026-02-10T13:05:00Z',
    parents: ['folder-dqf'],
    complianceCategory: 'DQF',
    statuteCitation: '49 CFR § 383.23',
  },
  {
    id: 'file-clearinghouse',
    name: 'FMCSA_Drug_Alcohol_Clearinghouse_Annual_Query_2026.pdf',
    mimeType: 'application/pdf',
    size: '512000',
    modifiedTime: '2026-01-25T09:40:00Z',
    parents: ['folder-dqf'],
    complianceCategory: 'DQF',
    statuteCitation: '49 CFR § 382.701',
  },
  // Files inside DVIR
  {
    id: 'file-annual-dot',
    name: 'Annual_Periodic_Inspection_Unit_1042_Freightliner_Cascadia.pdf',
    mimeType: 'application/pdf',
    size: '1980000',
    modifiedTime: '2026-02-18T16:20:00Z',
    parents: ['folder-dvir'],
    complianceCategory: 'DVIR',
    statuteCitation: '49 CFR § 396.17 Appendix G',
    starred: true,
  },
  {
    id: 'file-brake-adjustment',
    name: 'CVSA_Level_1_Clean_Brake_Adjustment_Inspection_Report.pdf',
    mimeType: 'application/pdf',
    size: '1150000',
    modifiedTime: '2026-02-22T10:15:00Z',
    parents: ['folder-dvir'],
    complianceCategory: 'DVIR',
    statuteCitation: '49 CFR § 393.40',
  },
  // Files inside BOLs
  {
    id: 'file-bol-chicago',
    name: 'BOL_938102_Chicago_to_Dallas_Signed_Clean_POD.pdf',
    mimeType: 'application/pdf',
    size: '850000',
    modifiedTime: '2026-03-02T20:30:00Z',
    parents: ['folder-bolds'],
    complianceCategory: 'BOL',
    statuteCitation: '49 CFR § 373.101',
  },
  {
    id: 'file-temp-recorder',
    name: 'Reefer_Cold_Chain_Continuous_Temp_DataLogger_Export.csv',
    mimeType: 'text/csv',
    size: '340000',
    modifiedTime: '2026-03-02T20:35:00Z',
    parents: ['folder-bolds'],
    complianceCategory: 'BOL',
    statuteCitation: 'FSMA 21 CFR § 1.908',
  },
];

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Fetch files from Google Drive v3 REST API
 */
export async function fetchDriveFiles(
  accessToken: string,
  options?: {
    parentFolderId?: string;
    searchQuery?: string;
    pageSize?: number;
    mimeFilter?: string;
  }
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  try {
    const params = new URLSearchParams();
    params.append(
      'fields',
      'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, webViewLink, webContentLink, iconLink, thumbnailLink, parents, starred, trashed)'
    );
    params.append('pageSize', String(options?.pageSize || 100));
    params.append('orderBy', 'folder,modifiedTime desc,name');

    const queries: string[] = ['trashed = false'];

    if (options?.parentFolderId) {
      queries.push(`'${options.parentFolderId}' in parents`);
    }

    if (options?.searchQuery && options.searchQuery.trim()) {
      const sanitized = options.searchQuery.replace(/'/g, "\\'");
      queries.push(`name contains '${sanitized}'`);
    }

    if (options?.mimeFilter) {
      if (options.mimeFilter === 'folder') {
        queries.push(`mimeType = 'application/vnd.google-apps.folder'`);
      } else if (options.mimeFilter === 'pdf') {
        queries.push(`mimeType = 'application/pdf'`);
      } else if (options.mimeFilter === 'image') {
        queries.push(`mimeType contains 'image/'`);
      }
    }

    params.append('q', queries.join(' and '));

    const response = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(
        errBody.error?.message || `Google Drive API error ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Failed to fetch Google Drive files:', error);
    throw error;
  }
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<DriveFile> {
  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create folder in Google Drive');
  }

  return response.json();
}

/**
 * Upload a compliance file to Google Drive using multipart upload
 */
export async function uploadDriveFile(
  accessToken: string,
  file: File,
  parentFolderId?: string
): Promise<DriveFile> {
  const metadata: Record<string, any> = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const fileReader = new FileReader();
  const fileContentPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
    fileReader.onerror = () => reject(fileReader.error);
    fileReader.readAsArrayBuffer(file);
  });

  const arrayBuffer = await fileContentPromise;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}\r\n`;

  const filePartHeader = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\nContent-Transfer-Encoding: binary\r\n\r\n`;

  const encoder = new TextEncoder();
  const metaBytes = encoder.encode(metadataPart);
  const fileHeaderBytes = encoder.encode(filePartHeader);
  const closeBytes = encoder.encode(closeDelimiter);

  const totalLength = metaBytes.byteLength + fileHeaderBytes.byteLength + arrayBuffer.byteLength + closeBytes.byteLength;
  const combined = new Uint8Array(totalLength);

  let offset = 0;
  combined.set(metaBytes, offset);
  offset += metaBytes.byteLength;
  combined.set(fileHeaderBytes, offset);
  offset += fileHeaderBytes.byteLength;
  combined.set(new Uint8Array(arrayBuffer), offset);
  offset += arrayBuffer.byteLength;
  combined.set(closeBytes, offset);

  const response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      Accept: 'application/json',
    },
    body: combined,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload file to Google Drive');
  }

  return response.json();
}

/**
 * Delete a file permanently from Google Drive (Mandatory user confirmation required in UI before calling)
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete file from Google Drive');
  }
}

/**
 * Star or Unstar a file in Google Drive
 */
export async function toggleStarDriveFile(
  accessToken: string,
  fileId: string,
  starred: boolean
): Promise<DriveFile> {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ starred }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to update star state');
  }

  return response.json();
}

/**
 * Fetch Drive Storage Quota Information
 */
export async function getDriveStorageQuota(
  accessToken: string
): Promise<DriveStorageQuota | null> {
  try {
    const response = await fetch(`${DRIVE_API_BASE}/about?fields=storageQuota`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.storageQuota || null;
  } catch {
    return null;
  }
}

/**
 * Format bytes into human readable format (KB, MB, GB)
 */
export function formatBytes(bytes?: string | number): string {
  if (!bytes) return '—';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${parseFloat((num / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
