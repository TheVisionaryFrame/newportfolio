export const CONTACT_MESSAGE_STATUSES = ["new", "read", "replied", "archived"] as const;

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export type ContactMessage = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  social_handle: string | null;
  preferred_contact: string | null;
  brand_name: string | null;
  website: string | null;
  budget_range: string | null;
  campaign_goal: string | null;
  timeline: string | null;
  status: ContactMessageStatus;
};

export type ContactMessageInsert = {
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  social_handle?: string | null;
  preferred_contact?: string | null;
  brand_name?: string | null;
  website?: string | null;
  budget_range?: string | null;
  campaign_goal?: string | null;
  timeline?: string | null;
  status?: ContactMessageStatus;
};

export type ContactMessageUpdate = Partial<
  Omit<ContactMessage, "id" | "created_at" | "updated_at">
>;

export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function previewText(value: string, max = 120): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

export function formatMessageDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
