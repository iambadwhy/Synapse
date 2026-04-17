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
  imageUrl?: string;
  imagePreview?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDomain?: string;
}
