import { z } from 'zod';

/**
 * Security-focused validation schemas for user profile data
 * 
 * Key security measures:
 * - Strict regex patterns to prevent injection attacks
 * - Length limits to prevent DoS via large payloads
 * - HTML/script stripping for plain text fields
 * - Unicode normalization for usernames to prevent homoglyph attacks
 */

// Pattern for usernames: alphanumeric, underscores, hyphens, dots only
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,30}$/;

// Pattern for names: letters (including unicode), spaces, hyphens, apostrophes
const NAME_PATTERN = /^[\p{L}\s'-]{1,64}$/u;

// Maximum lengths for fields
export const PROFILE_LIMITS = {
  username: { min: 3, max: 30 },
  firstName: { min: 1, max: 64 },
  lastName: { min: 1, max: 64 },
  bio: { min: 0, max: 2000 },
  avatarUrl: { max: 500 },
} as const;

/**
 * Strips all HTML tags and dangerous content from a string
 * Used for bio and other free-text fields
 */
export function stripHtmlAndDangerousContent(input: string): string {
  if (!input) return '';

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, '')
    // Remove data: protocol (can contain scripts)
    .replace(/data:/gi, 'data-blocked:')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove expression() CSS (IE)
    .replace(/expression\s*\(/gi, '')
    // Remove url() with javascript
    .replace(/url\s*\(\s*['"]?\s*javascript:/gi, 'url(blocked:')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 * while preserving readability
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Normalizes unicode for username to prevent homoglyph attacks
 * e.g., "аdmin" (Cyrillic 'а') vs "admin" (Latin 'a')
 */
export function normalizeUsername(username: string): string {
  if (!username) return '';
  
  // Normalize to NFKC form for compatibility
  return username.normalize('NFKC').toLowerCase();
}

/**
 * Zod schema for username validation
 */
export const usernameSchema = z
  .string()
  .min(PROFILE_LIMITS.username.min, `Username must be at least ${PROFILE_LIMITS.username.min} characters`)
  .max(PROFILE_LIMITS.username.max, `Username must be at most ${PROFILE_LIMITS.username.max} characters`)
  .regex(USERNAME_PATTERN, 'Username can only contain letters, numbers, underscores, hyphens, and dots')
  .transform(normalizeUsername);

/**
 * Zod schema for first/last name validation
 */
export const nameSchema = z
  .string()
  .min(PROFILE_LIMITS.firstName.min, 'Name is required')
  .max(PROFILE_LIMITS.firstName.max, `Name must be at most ${PROFILE_LIMITS.firstName.max} characters`)
  .regex(NAME_PATTERN, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform(sanitizeText);

/**
 * Optional name schema (for updates where field may be empty)
 */
export const optionalNameSchema = z
  .string()
  .max(PROFILE_LIMITS.firstName.max, `Name must be at most ${PROFILE_LIMITS.firstName.max} characters`)
  .transform(sanitizeText)
  .optional()
  .or(z.literal(''));

/**
 * Zod schema for bio validation - plain text only, no HTML
 */
export const bioSchema = z
  .string()
  .max(PROFILE_LIMITS.bio.max, `Bio must be at most ${PROFILE_LIMITS.bio.max} characters`)
  .transform(stripHtmlAndDangerousContent);

/**
 * Zod schema for avatar URL validation
 */
export const avatarUrlSchema = z
  .string()
  .max(PROFILE_LIMITS.avatarUrl.max, 'Avatar URL is too long')
  .refine(
    (url) => {
      if (!url) return true; // Empty is valid
      try {
        const parsed = new URL(url);
        // Only allow https URLs (and http for localhost dev)
        return parsed.protocol === 'https:' || 
               (parsed.protocol === 'http:' && parsed.hostname === 'localhost');
      } catch {
        return false;
      }
    },
    { message: 'Invalid avatar URL' }
  )
  .optional()
  .or(z.literal(''));

/**
 * Complete profile update schema
 */
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .max(PROFILE_LIMITS.username.max)
    .transform((val) => val ? normalizeUsername(sanitizeText(val)) : '')
    .refine(
      (val) => !val || USERNAME_PATTERN.test(val),
      { message: 'Username can only contain letters, numbers, underscores, hyphens, and dots (3-30 chars)' }
    ),
  first_name: z
    .string()
    .max(PROFILE_LIMITS.firstName.max, `First name must be at most ${PROFILE_LIMITS.firstName.max} characters`)
    .transform(sanitizeText),
  last_name: z
    .string()
    .max(PROFILE_LIMITS.lastName.max, `Last name must be at most ${PROFILE_LIMITS.lastName.max} characters`)
    .transform(sanitizeText),
  bio: bioSchema,
  avatar_url: avatarUrlSchema,
});

/**
 * Type for validated profile data
 */
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

/**
 * Validates profile data and returns sanitized values or error
 */
export function validateProfileUpdate(data: unknown): {
  success: boolean;
  data?: ProfileUpdateData;
  errors?: { field: string; message: string }[];
} {
  const result = profileUpdateSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

/**
 * XSS test vectors for security testing
 * These should all be neutralized by the sanitization
 */
export const XSS_TEST_VECTORS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<a href="javascript:alert(1)">click</a>',
  '<div style="background-image: url(javascript:alert(1))">test</div>',
  '"><script>alert(1)</script>',
  "'-alert(1)-'",
  '<IMG SRC="javascript:alert(\'XSS\');">',
  '<IMG SRC=javascript:alert(&quot;XSS&quot;)>',
  '<IMG SRC=`javascript:alert("XSS")`>',
  '<BODY ONLOAD=alert(\'XSS\')>',
  '<INPUT TYPE="IMAGE" SRC="javascript:alert(\'XSS\');">',
  '<LINK REL="stylesheet" HREF="javascript:alert(\'XSS\');">',
  '<META HTTP-EQUIV="refresh" CONTENT="0;url=javascript:alert(\'XSS\');">',
  '<STYLE>@import\'javascript:alert("XSS")\';</STYLE>',
  '<!--[if gte IE 4]><SCRIPT>alert(\'XSS\');</SCRIPT><![endif]-->',
  '<BASE HREF="javascript:alert(\'XSS\');//">',
  '<OBJECT TYPE="text/x-scriptlet" DATA="javascript:alert(\'XSS\');">',
  '<EMBED SRC="javascript:alert(\'XSS\');">',
  '<FRAMESET><FRAME SRC="javascript:alert(\'XSS\');"></FRAMESET>',
  '<TABLE BACKGROUND="javascript:alert(\'XSS\')">',
  '<DIV STYLE="background-image: expression(alert(\'XSS\'))">',
  '<DIV STYLE="width: expression(alert(\'XSS\'));">',
  'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
  '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',
  '<math><maction actiontype="statusline#http://google.com" xlink:href="javascript:alert(1)">CLICKME',
  '<isindex action="javascript:alert(1)" type=submit value=click>',
] as const;
