export const MAX_NAME_LENGTH = 80;
export const INAPPROPRIATE_LANGUAGE_ERROR = "Please remove inappropriate language before sending.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_PATTERN =
  /(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|io|co|us|uk|ca|au|in|dev|app|site|xyz)\b)/i;
const NAME_ALLOWED_PATTERN = /^[\p{L}]+(?:[\s'-]+[\p{L}]+)*$/u;

/**
 * Conservative whole-word list of obvious profanity and slurs.
 * Add or remove entries here; matching is case-insensitive and
 * uses letter/number boundaries to avoid substring false positives.
 */
const BANNED_WORDS = [
  "asshole",
  "bastard",
  "bitch",
  "bollocks",
  "bullshit",
  "cunt",
  "dick",
  "fag",
  "faggot",
  "fuck",
  "fucked",
  "fucking",
  "motherfucker",
  "nigger",
  "prick",
  "shit",
  "shithead",
  "slut",
  "twat",
  "whore",
] as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function bannedWordPattern() {
  return new RegExp(
    `(^|[^\\p{L}\\p{N}_])(${BANNED_WORDS.map(escapeRegExp).join("|")})(?=$|[^\\p{L}\\p{N}_])`,
    "iu",
  );
}

export function containsBannedWord(value: string) {
  return bannedWordPattern().test(value);
}

export function profanityError(value: string) {
  return containsBannedWord(value) ? INAPPROPRIATE_LANGUAGE_ERROR : undefined;
}

export function validateName(value: string) {
  const trimmedName = value.trim();

  if (!trimmedName) return "Name is required.";
  if (trimmedName.length < 2) return "Name must be at least 2 characters.";
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or less.`;
  }
  if (URL_PATTERN.test(trimmedName)) return "Name cannot include links or URLs.";
  if (!NAME_ALLOWED_PATTERN.test(trimmedName)) {
    return "Name can only use letters, spaces, hyphens, and apostrophes.";
  }
  if (containsBannedWord(trimmedName)) return INAPPROPRIATE_LANGUAGE_ERROR;

  return undefined;
}

export function validateEmail(value: string) {
  const normalizedEmail = value.trim();

  if (!normalizedEmail) return "Email is required.";
  if (/\s/.test(normalizedEmail) || !EMAIL_PATTERN.test(normalizedEmail.toLowerCase())) {
    return "Enter a valid email address.";
  }
  if (containsBannedWord(normalizedEmail)) return INAPPROPRIATE_LANGUAGE_ERROR;

  return undefined;
}
