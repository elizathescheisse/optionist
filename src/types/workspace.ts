export type OnboardingStatus =
  | "not_started"
  | "profile_incomplete"
  | "onboarding_incomplete"
  | "complete";

export type OrgRole = "owner" | "admin" | "member" | "viewer";
export type MemberStatus = "invited" | "active" | "removed";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  job_title: string | null;
  onboarding_status: OnboardingStatus;
  default_organization_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_by: string | null;
  plan: string;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  status: MemberStatus;
  invited_by: string | null;
  joined_at: string | null;
  created_at: string;
};

export type UserSettings = {
  user_id: string;
  theme: "light" | "dark" | "system";
  default_view: string | null;
  dismissed_onboarding: boolean;
  email_notifications_enabled: boolean;
  onboarding_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type OrganizationWithRole = Organization & { role: OrgRole };

export type OnboardingData = {
  role?: string;
  useCase?: string;
  audience?: string;
  decisionStyle?: string;
  workspaceName?: string;
  comparingFirst?: string;
  completedAt?: string;
};
