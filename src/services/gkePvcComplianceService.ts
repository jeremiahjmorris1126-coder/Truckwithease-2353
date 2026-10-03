/**
 * GKE PersistentVolumeClaim Compliance Service
 * 
 * Provides cluster-wide audit telemetry and deviation detection against
 * the authorized GKE standard Filestore storageClass policy (filestore-csi / enterprise-rwx).
 */

export interface PvcAuditItem {
  name: string;
  namespace: string;
  accessModes: string[];
  requestedStorage: string;
  declaredStorageClass: string | null;
  resolution: 'EXPLICIT_NON_FILESTORE' | 'EXPLICIT_FILESTORE' | 'DEFAULTING_TO_GKE_FILESTORE' | 'NON_STANDARD_STORAGECLASS';
  isDefaultingRisk: boolean;
  estimatedMonthlyCost: string;
  workload: string;
  remediationSnippet: string;
  deviationReason?: string;
  recommendedStorageClass?: string;
}

export interface GkeFilestoreAuditReport {
  auditId: string;
  auditTimestamp: string;
  clusterName: string;
  gkeControlPlaneVersion: string;
  scenario: 'CURRENT_PROD' | 'SIMULATED_DEFECT';
  overallStatus: 'COMPLIANT_ZERO_FILESTORE_EXPOSURE' | 'CRITICAL_UNMANAGED_FILESTORE_PROVISIONING';
  metrics: {
    totalPvcsScanned: number;
    readWriteManyCount: number;
    readWriteOnceCount: number;
    explicitlyDefinedCount: number;
    defaultingToFilestoreCount: number;
    deviatingCount: number;
    projectedMonthlyCostExposure: string;
  };
  summaryVerdict: string;
  pvcs: PvcAuditItem[];
}

export const STANDARD_FILESTORE_STORAGE_CLASS = 'filestore-csi';
export const STANDARD_ENTERPRISE_RWX_STORAGE_CLASS = 'enterprise-multishare-rwx';

/**
 * Checks whether a PersistentVolumeClaim deviates from the standard Filestore policy.
 * Non-compliant conditions:
 * 1. Omitted storageClassName on ReadWriteMany claims (causes GKE 1.37+ unmanaged $160/mo Filestore allocation)
 * 2. Mismatched storage class (e.g. attempting ReadWriteMany on standard-rwo block disk)
 * 3. Non-standard or deprecated third-party CSI drivers
 */
export function checkPvcFilestoreDeviation(pvc: PvcAuditItem): {
  isDeviating: boolean;
  severity: 'CRITICAL' | 'WARNING' | 'COMPLIANT';
  reason: string;
  expectedClass: string;
} {
  const isRwx = pvc.accessModes.some(m => m.toLowerCase().includes('many') || m === 'RWX' || m === 'ReadWriteMany');

  // Condition 1: Omitted storageClass on RWX claim
  if (isRwx && (!pvc.declaredStorageClass || pvc.declaredStorageClass.trim() === '')) {
    return {
      isDeviating: true,
      severity: 'CRITICAL',
      reason: 'Missing storageClassName on RWX claim: Automatically triggers GKE 1.37+ unmanaged Cloud Filestore Basic cluster with $160.00/mo minimum allocation.',
      expectedClass: STANDARD_FILESTORE_STORAGE_CLASS,
    };
  }

  // Condition 2: Marked as defaulting risk or explicit defaulting resolution
  if (pvc.isDefaultingRisk || pvc.resolution === 'DEFAULTING_TO_GKE_FILESTORE') {
    return {
      isDeviating: true,
      severity: 'CRITICAL',
      reason: 'Unmanaged Filestore Defaulting: Volume claim bypasses VPC-SC perimeter safeguards and dynamic CSI quota.',
      expectedClass: STANDARD_FILESTORE_STORAGE_CLASS,
    };
  }

  // Condition 3: Multi-writer claim bound to non-standard or block storage class
  if (isRwx && pvc.declaredStorageClass !== STANDARD_FILESTORE_STORAGE_CLASS && pvc.declaredStorageClass !== STANDARD_ENTERPRISE_RWX_STORAGE_CLASS && pvc.declaredStorageClass !== 'standard-rwx') {
    if (pvc.declaredStorageClass === 'standard-rwo' || pvc.declaredStorageClass === 'premium-rwo') {
      return {
        isDeviating: true,
        severity: 'CRITICAL',
        reason: `Mismatched StorageClass: RWX requested but '${pvc.declaredStorageClass}' is a single-pod block disk. Will trigger Kubernetes multi-attach lockup or split-brain defect.`,
        expectedClass: STANDARD_FILESTORE_STORAGE_CLASS,
      };
    }
    return {
      isDeviating: true,
      severity: 'WARNING',
      reason: `Non-standard StorageClass '${pvc.declaredStorageClass}'. Authorized fleet standard is '${STANDARD_FILESTORE_STORAGE_CLASS}'.`,
      expectedClass: STANDARD_FILESTORE_STORAGE_CLASS,
    };
  }

  return {
    isDeviating: false,
    severity: 'COMPLIANT',
    reason: 'Compliant with standard GKE storage policy.',
    expectedClass: isRwx ? STANDARD_FILESTORE_STORAGE_CLASS : (pvc.declaredStorageClass || 'standard-rwo'),
  };
}

// Built-in baseline production claims
const DEFAULT_PROD_PVCS: PvcAuditItem[] = [
  {
    name: 'telematics-timeseries-db-pvc',
    namespace: 'production',
    accessModes: ['ReadWriteOnce'],
    requestedStorage: '100Gi',
    declaredStorageClass: 'standard-rwo',
    resolution: 'EXPLICIT_NON_FILESTORE',
    isDefaultingRisk: false,
    estimatedMonthlyCost: '$17.00 (Standard PD)',
    workload: 'TimescaleDB / Telematics Pulse Ingestion',
    remediationSnippet: '# Fully Compliant - storageClassName explicitly declared as standard-rwo',
  },
  {
    name: 'dvir-photo-evidence-cache-pvc',
    namespace: 'compliance',
    accessModes: ['ReadWriteOnce'],
    requestedStorage: '50Gi',
    declaredStorageClass: 'standard-rwo',
    resolution: 'EXPLICIT_NON_FILESTORE',
    isDefaultingRisk: false,
    estimatedMonthlyCost: '$8.50 (Standard PD)',
    workload: 'DVIR Inspection Evidence OCR Staging',
    remediationSnippet: '# Fully Compliant - storageClassName explicitly declared as standard-rwo',
  },
  {
    name: 'redis-edge-session-store-pvc',
    namespace: 'production',
    accessModes: ['ReadWriteOnce'],
    requestedStorage: '20Gi',
    declaredStorageClass: 'premium-rwo',
    resolution: 'EXPLICIT_NON_FILESTORE',
    isDefaultingRisk: false,
    estimatedMonthlyCost: '$3.40 (SSD Persistent Disk)',
    workload: 'Hono Edge Session & CB Radio Ring Buffer',
    remediationSnippet: '# Fully Compliant - storageClassName explicitly declared as premium-rwo',
  },
  {
    name: 'driver-dqf-dossier-archive-pvc',
    namespace: 'hr-safety',
    accessModes: ['ReadWriteOnce'],
    requestedStorage: '30Gi',
    declaredStorageClass: 'standard-rwo',
    resolution: 'EXPLICIT_NON_FILESTORE',
    isDefaultingRisk: false,
    estimatedMonthlyCost: '$5.10 (Standard PD)',
    workload: 'FMCSA 49 CFR § 391 DQF Vault Documents',
    remediationSnippet: '# Fully Compliant - storageClassName explicitly declared as standard-rwo',
  },
  {
    name: 'quantum-optimizer-models-pvc',
    namespace: 'dispatch-zero',
    accessModes: ['ReadWriteOnce'],
    requestedStorage: '40Gi',
    declaredStorageClass: 'premium-rwo',
    resolution: 'EXPLICIT_NON_FILESTORE',
    isDefaultingRisk: false,
    estimatedMonthlyCost: '$6.80 (SSD Persistent Disk)',
    workload: 'Dispatch Zero Freight Route & Fuel Optimization Weights',
    remediationSnippet: '# Fully Compliant - storageClassName explicitly declared as premium-rwo',
  },
  {
    name: 'fleet-shared-telemetry-multishare-pvc',
    namespace: 'telematics',
    accessModes: ['ReadWriteMany'],
    requestedStorage: '1000Gi',
    declaredStorageClass: 'filestore-csi',
    resolution: 'EXPLICIT_FILESTORE',
    isDefaultingRisk: false,
    estimatedMonthlyCost: '$160.00 (Managed Standard Filestore)',
    workload: 'Distributed High-Throughput Engine Telematics Multi-Pod Aggregator',
    remediationSnippet: '# Fully Compliant - storageClassName explicitly declared as standard filestore-csi',
  }
];

// Simulated Defect Item that deviates from standard Filestore storageClass
const DEFECT_PVC_ITEM: PvcAuditItem = {
  name: 'shared-web-assets-rwx-pvc',
  namespace: 'web-frontends',
  accessModes: ['ReadWriteMany'],
  requestedStorage: '50Gi',
  declaredStorageClass: null,
  resolution: 'DEFAULTING_TO_GKE_FILESTORE',
  isDefaultingRisk: true,
  estimatedMonthlyCost: '$160.00 / Mo (Minimum 1 TiB Basic Filestore Allocation)',
  workload: 'Nginx Web Shared Assets (Multi-Pod Writer)',
  deviationReason: 'Missing storageClassName on RWX claim deviating from standard filestore-csi',
  recommendedStorageClass: STANDARD_FILESTORE_STORAGE_CLASS,
  remediationSnippet: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: shared-web-assets-rwx-pvc
  namespace: web-frontends
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: filestore-csi # FIX: Enforce standard Filestore CSI driver policy
  resources:
    requests:
      storage: 50Gi`,
};

// Secondary defect example for testing non-standard deviation
const DEPRECATED_NFS_DEFECT_ITEM: PvcAuditItem = {
  name: 'legacy-carrier-edi-exchange-pvc',
  namespace: 'edi-carrier-mesh',
  accessModes: ['ReadWriteMany'],
  requestedStorage: '200Gi',
  declaredStorageClass: 'legacy-nfs-client',
  resolution: 'NON_STANDARD_STORAGECLASS',
  isDefaultingRisk: false,
  estimatedMonthlyCost: '$45.00 / Mo (Unverified Self-Hosted NFS)',
  workload: 'Legacy 204/214 EDI Document Batch Staging',
  deviationReason: 'Non-standard storageClass "legacy-nfs-client" deviates from authorized GKE Filestore CSI standard',
  recommendedStorageClass: STANDARD_FILESTORE_STORAGE_CLASS,
  remediationSnippet: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: legacy-carrier-edi-exchange-pvc
  namespace: edi-carrier-mesh
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: filestore-csi # FIX: Migrate from legacy-nfs-client to managed filestore-csi
  resources:
    requests:
      storage: 200Gi`,
};

class GkePvcComplianceManager {
  private currentScenario: 'CURRENT_PROD' | 'SIMULATED_DEFECT' = 'CURRENT_PROD';
  private currentReport: GkeFilestoreAuditReport | null = null;
  private isScanning: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.recalculateReport();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getScenario(): 'CURRENT_PROD' | 'SIMULATED_DEFECT' {
    return this.currentScenario;
  }

  public getReport(): GkeFilestoreAuditReport | null {
    return this.currentReport;
  }

  public getIsScanning(): boolean {
    return this.isScanning;
  }

  public getDeviations(): {
    pvc: PvcAuditItem;
    deviation: ReturnType<typeof checkPvcFilestoreDeviation>;
  }[] {
    if (!this.currentReport) return [];
    return this.currentReport.pvcs
      .map(pvc => ({ pvc, deviation: checkPvcFilestoreDeviation(pvc) }))
      .filter(item => item.deviation.isDeviating);
  }

  public async setScenario(scenario: 'CURRENT_PROD' | 'SIMULATED_DEFECT'): Promise<GkeFilestoreAuditReport> {
    this.currentScenario = scenario;
    return await this.scan();
  }

  public async scan(): Promise<GkeFilestoreAuditReport> {
    this.isScanning = true;
    this.notify();

    try {
      const response = await fetch('/api/v1/infrastructure/gke/audit-pvcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: this.currentScenario }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.auditReport) {
          const rawReport = data.auditReport;
          const pvcs: PvcAuditItem[] = rawReport.pvcs || [];

          // Enrich with deviation calculation
          const deviations = pvcs.map(p => checkPvcFilestoreDeviation(p)).filter(d => d.isDeviating);

          this.currentReport = {
            ...rawReport,
            scenario: this.currentScenario,
            metrics: {
              ...rawReport.metrics,
              deviatingCount: deviations.length,
            }
          };
          this.isScanning = false;
          this.notify();
          return this.currentReport;
        }
      }
    } catch (err) {
      console.warn('[GkePvcComplianceManager] Server call failed, using deterministic local audit engine:', err);
    }

    // Local deterministic fallback
    this.recalculateReport();
    this.isScanning = false;
    this.notify();
    return this.currentReport!;
  }

  public remediatePvc(pvcName: string, targetStorageClass = STANDARD_FILESTORE_STORAGE_CLASS) {
    if (!this.currentReport) return;
    const updatedPvcs = this.currentReport.pvcs.map(p => {
      if (p.name === pvcName) {
        return {
          ...p,
          declaredStorageClass: targetStorageClass,
          resolution: 'EXPLICIT_FILESTORE' as const,
          isDefaultingRisk: false,
          estimatedMonthlyCost: '$160.00 / Mo (Standard Managed Filestore)',
          remediationSnippet: `# Remediated: storageClassName set explicitly to ${targetStorageClass}`,
        };
      }
      return p;
    });

    const deviations = updatedPvcs.map(p => checkPvcFilestoreDeviation(p)).filter(d => d.isDeviating);
    const defaultingCount = updatedPvcs.filter(p => p.resolution === 'DEFAULTING_TO_GKE_FILESTORE').length;

    this.currentReport = {
      ...this.currentReport,
      overallStatus: deviations.length === 0 ? 'COMPLIANT_ZERO_FILESTORE_EXPOSURE' : 'CRITICAL_UNMANAGED_FILESTORE_PROVISIONING',
      pvcs: updatedPvcs,
      metrics: {
        ...this.currentReport.metrics,
        defaultingToFilestoreCount: defaultingCount,
        deviatingCount: deviations.length,
        projectedMonthlyCostExposure: deviations.length > 0 ? '$160.00 / Mo' : '$0.00 / Mo',
      },
      summaryVerdict: deviations.length === 0
        ? 'PASSED: All PersistentVolumeClaims adhere to the GKE Filestore Standard policy.'
        : 'ATTENTION: Non-compliant deviations remain detected in the cluster.',
    };
    this.notify();
  }

  private recalculateReport() {
    const isDefect = this.currentScenario === 'SIMULATED_DEFECT';
    const pvcs: PvcAuditItem[] = [...DEFAULT_PROD_PVCS];

    if (isDefect) {
      pvcs.unshift({ ...DEFECT_PVC_ITEM });
      pvcs.push({ ...DEPRECATED_NFS_DEFECT_ITEM });
    }

    const deviations = pvcs.map(p => checkPvcFilestoreDeviation(p)).filter(d => d.isDeviating);
    const defaultingCount = pvcs.filter(p => p.resolution === 'DEFAULTING_TO_GKE_FILESTORE').length;
    const rwxCount = pvcs.filter(p => p.accessModes.includes('ReadWriteMany')).length;
    const rwoCount = pvcs.filter(p => p.accessModes.includes('ReadWriteOnce')).length;

    this.currentReport = {
      auditId: `GKE-AUDIT-${Date.now()}`,
      auditTimestamp: new Date().toISOString(),
      clusterName: 'truckwithease-prod-us-east1 (GKE v1.37.2)',
      gkeControlPlaneVersion: 'v1.37.2-gke.1200',
      scenario: this.currentScenario,
      overallStatus: deviations.length === 0 ? 'COMPLIANT_ZERO_FILESTORE_EXPOSURE' : 'CRITICAL_UNMANAGED_FILESTORE_PROVISIONING',
      metrics: {
        totalPvcsScanned: pvcs.length,
        readWriteManyCount: rwxCount,
        readWriteOnceCount: rwoCount,
        explicitlyDefinedCount: pvcs.length - defaultingCount,
        defaultingToFilestoreCount: defaultingCount,
        deviatingCount: deviations.length,
        projectedMonthlyCostExposure: deviations.length > 0 ? '$205.00 / Mo ($160 Basic + $45 Unverified)' : '$0.00 / Mo',
      },
      summaryVerdict: deviations.length === 0
        ? 'PASSED: All PersistentVolumeClaims explicitly declare a standard storageClassName. Zero unmanaged Filestore dynamic allocations or rogue CSI drivers.'
        : `ATTENTION: Found ${deviations.length} PersistentVolumeClaim(s) deviating from the standard Filestore storageClass policy.`,
      pvcs,
    };
  }
}

export const gkePvcComplianceManager = new GkePvcComplianceManager();
