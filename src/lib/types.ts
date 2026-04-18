export type CaptureType = 'text' | 'link' | 'image' | 'voice';
export type CaptureStatus = 'processing' | 'clustered';
export type ClusterCategory = 'project' | 'topic';

export interface Cluster {
  id: string;
  name: string;
  label: string;
  category: ClusterCategory;
  color: string;
  description: string;
  synthesis: string;
  nextStep: string;
  /**
   * Optional Lucide icon name for user-created clusters. Built-in clusters
   * have their icon hard-coded by id in Sidebar.tsx; anything with this
   * field falls back through the dynamic icon registry.
   */
  icon?: string;
  /** Marks clusters created at runtime by the user. */
  custom?: boolean;
}

export interface Capture {
  id: string;
  content: string;
  type: CaptureType;
  clusterId: string;
  inferenceReason: string;
  timestamp: Date;
  tags: string[];
  status: CaptureStatus;
  /**
   * Completion is orthogonal to `status` — a capture can be clustered AND
   * completed. Presence of this timestamp is the source of truth; absence
   * means the capture is still live/pending.
   */
  completedAt?: Date;
  imageUrl?: string;
  imagePreview?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDomain?: string;
}
