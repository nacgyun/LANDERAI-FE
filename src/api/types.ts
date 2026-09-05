export type Industry =
  | 'cafe'
  | 'restaurant'
  | 'medical'
  | 'education'
  | 'shopping'
  | 'fitness_beauty'
  | 'it'
  | 'professional_service'
  | 'other';

export interface CreateRequestInput {
  industry: Industry;
  sub_industry: string;
  target: string;
  style: string;
  goal: string;
  additional_context?: string;
  language: string;
}

export type RequestStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type CurrentStep =
  | 'EMBEDDING'
  | 'DESIGN_PLAN'
  | 'LANDING_PAGE_VARIANT'
  | 'PERSIST_RESULT'
  | 'DONE';

export interface RequestState {
  request_id: string;
  status: RequestStatus;
  current_step: CurrentStep | null;
  progress: number;
  project_id: string | null;
  error_type: string | null;
  error_message: string | null;
  workflow_execution_arn: string | null;
  workflow_start_date: string | null;
  landing_result_id: string | null;
  selection_status: 'NOT_SELECTED' | 'SELECTED';
  chosen_variant: 'A' | 'B' | null;
  latest_revision_id: string | null;
  published_revision_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateRequestResponse {
  request_id: string;
  status: RequestStatus;
  current_step: CurrentStep | null;
  progress: number;
  project_id: string | null;
  created_at: string;
  workflow_execution_arn: string;
  workflow_start_date: string;
}

export interface RequestListItem extends RequestState {
  industry: Industry;
  sub_industry: string;
  target: string;
  style: string;
  goal: string;
}

export interface RequestListResponse {
  items: RequestListItem[];
  total: number;
}

export interface CurrentUserResponse {
  user_id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  last_active_project_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile_source: 'landerai' | 'clerk_fallback';
}

export interface UserInitializationResponse {
  initialized: boolean;
  user_id: string;
  role: string;
}

export interface VariantPreview {
  preview_url: string;
  html_s3_bucket: string;
  html_s3_key: string;
}

export interface PreviewUrlsResponse {
  request_id: string;
  status: RequestStatus;
  expires_in: number;
  variants: {
    A: VariantPreview;
    B: VariantPreview;
  };
}

export interface VariantSelectionResponse {
  request_id: string;
  status: RequestStatus;
  selection_status: 'NOT_SELECTED' | 'SELECTED';
  chosen_variant: 'A' | 'B' | null;
  selected_design_plan_id: string | null;
  design_plan_vector_key: string | null;
  latest_revision_id: string | null;
  published_revision_id: string | null;
}

export interface DownloadUrlResponse {
  request_id: string;
  variant: 'A' | 'B';
  filename: string;
  download_url: string;
  expires_in: number;
}

export type RevisionStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface LandingPageRevision {
  revision_id: string;
  request_id: string;
  source_revision_id: string | null;
  revision_prompt: string | null;
  source_type: 'VARIANT' | 'REVISION';
  source_variant: 'A' | 'B' | null;
  html_s3_bucket: string | null;
  html_s3_key: string | null;
  created_at: string;
  updated_at: string;
  processing_started_at: string | null;
  status: RevisionStatus;
  error_type: string | null;
  error_message: string | null;
}

export interface RevisionListResponse {
  items: LandingPageRevision[];
  total: number;
}

export interface CreateRevisionInput {
  source_revision_id: string;
  revision_prompt: string;
}

export interface RevisionPreviewUrlResponse {
  request_id: string;
  revision_id: string;
  preview_url: string;
  expires_in: number;
}
