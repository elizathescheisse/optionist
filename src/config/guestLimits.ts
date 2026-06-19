/** Guest-mode quotas — adjust here without touching store logic. */
export const GUEST_LIMITS = {
  maxProjects: 3,
  maxDecisions: 5,
  maxOptions: 10,
} as const;
