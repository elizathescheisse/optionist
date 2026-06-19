export type GuestSession = {
  guestSessionId: string;
  createdAt: string;
  lastActiveAt: string;
  storageVersion: 1;
  hasSeenGuestNotice: boolean;
  lastOpenedProjectId: string | null;
};

export const GUEST_SESSION_STORAGE_VERSION = 1;
export const GUEST_APP_STORAGE_VERSION = 1;
