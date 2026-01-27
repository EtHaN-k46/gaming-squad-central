import { describe, it, expect } from 'vitest';
import {
  profileUpdateSchema,
  stripHtmlAndDangerousContent,
  sanitizeText,
  normalizeUsername,
  XSS_TEST_VECTORS,
  PROFILE_LIMITS,
} from '@/lib/validation/profile';

describe('Profile Validation', () => {
  describe('stripHtmlAndDangerousContent', () => {
    it('should remove script tags', () => {
      const input = '<script>alert(1)</script>';
      const result = stripHtmlAndDangerousContent(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).not.toContain('alert');
    });

    it('should remove img tags with onerror', () => {
      const input = '<img src=x onerror=alert(1)>';
      const result = stripHtmlAndDangerousContent(input);
      expect(result).not.toContain('<img');
      expect(result).not.toContain('onerror');
    });

    it('should remove svg with onload', () => {
      const input = '<svg onload=alert(1)>';
      const result = stripHtmlAndDangerousContent(input);
      expect(result).not.toContain('<svg');
      expect(result).not.toContain('onload');
    });

    it('should remove javascript: protocol in href', () => {
      const input = '<a href="javascript:alert(1)">click</a>';
      const result = stripHtmlAndDangerousContent(input);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('<a');
    });

    it('should remove javascript in style url', () => {
      const input = '<div style="background-image: url(javascript:alert(1))">test</div>';
      const result = stripHtmlAndDangerousContent(input);
      expect(result).not.toContain('javascript:');
    });

    it('should remove expression() CSS', () => {
      const input = '<div style="width: expression(alert(1))">test</div>';
      const result = stripHtmlAndDangerousContent(input);
      expect(result).not.toContain('expression(');
    });

    it('should handle all XSS test vectors', () => {
      XSS_TEST_VECTORS.forEach((vector) => {
        const result = stripHtmlAndDangerousContent(vector);
        // After sanitization, should not contain dangerous patterns
        expect(result).not.toMatch(/<script/i);
        expect(result).not.toMatch(/javascript:/i);
        expect(result).not.toMatch(/on\w+\s*=/i);
        expect(result).not.toMatch(/expression\s*\(/i);
      });
    });

    it('should preserve normal text', () => {
      const input = 'Hello, I am a gamer! I love playing games.';
      const result = stripHtmlAndDangerousContent(input);
      expect(result).toBe(input);
    });

    it('should handle empty input', () => {
      expect(stripHtmlAndDangerousContent('')).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should remove null bytes', () => {
      const input = 'hello\0world';
      const result = sanitizeText(input);
      expect(result).toBe('helloworld');
    });

    it('should remove control characters', () => {
      const input = 'hello\x00\x08\x0B\x0Cworld';
      const result = sanitizeText(input);
      expect(result).toBe('helloworld');
    });

    it('should preserve newlines and tabs', () => {
      const input = 'hello\n\tworld';
      const result = sanitizeText(input);
      expect(result).toContain('\n');
      expect(result).toContain('\t');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeText(input);
      expect(result).toBe('hello world');
    });
  });

  describe('normalizeUsername', () => {
    it('should convert to lowercase', () => {
      expect(normalizeUsername('GameR123')).toBe('gamer123');
    });

    it('should normalize unicode', () => {
      // This tests NFKC normalization
      const result = normalizeUsername('test');
      expect(result).toBe('test');
    });

    it('should handle empty input', () => {
      expect(normalizeUsername('')).toBe('');
    });
  });

  describe('profileUpdateSchema', () => {
    it('should validate a correct profile', () => {
      const data = {
        username: 'gamer123',
        first_name: 'John',
        last_name: 'Doe',
        bio: 'I love gaming!',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject usernames that are too short', () => {
      const data = {
        username: 'ab',
        first_name: 'John',
        last_name: 'Doe',
        bio: '',
        avatar_url: '',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject usernames with invalid characters', () => {
      const data = {
        username: 'user<script>',
        first_name: 'John',
        last_name: 'Doe',
        bio: '',
        avatar_url: '',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should sanitize bio with XSS attempts', () => {
      const data = {
        username: 'gamer123',
        first_name: 'John',
        last_name: 'Doe',
        bio: '<script>alert(1)</script>Hello world',
        avatar_url: '',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bio).not.toContain('<script>');
        expect(result.data.bio).toContain('Hello world');
      }
    });

    it('should reject bio that exceeds max length', () => {
      const data = {
        username: 'gamer123',
        first_name: 'John',
        last_name: 'Doe',
        bio: 'x'.repeat(PROFILE_LIMITS.bio.max + 1),
        avatar_url: '',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject names that exceed max length', () => {
      const data = {
        username: 'gamer123',
        first_name: 'x'.repeat(PROFILE_LIMITS.firstName.max + 1),
        last_name: 'Doe',
        bio: '',
        avatar_url: '',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject javascript: URLs in avatar', () => {
      const data = {
        username: 'gamer123',
        first_name: 'John',
        last_name: 'Doe',
        bio: '',
        avatar_url: 'javascript:alert(1)',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept https URLs in avatar', () => {
      const data = {
        username: 'gamer123',
        first_name: 'John',
        last_name: 'Doe',
        bio: '',
        avatar_url: 'https://example.com/avatar.png',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should normalize username to lowercase', () => {
      const data = {
        username: 'GaMeR123',
        first_name: 'John',
        last_name: 'Doe',
        bio: '',
        avatar_url: '',
      };

      const result = profileUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('gamer123');
      }
    });
  });

  describe('XSS Test Vectors', () => {
    it('should neutralize all XSS vectors when used in bio', () => {
      XSS_TEST_VECTORS.forEach((vector, index) => {
        const data = {
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          bio: vector,
          avatar_url: '',
        };

        const result = profileUpdateSchema.safeParse(data);
        expect(result.success).toBe(true);
        
        if (result.success) {
          const sanitizedBio = result.data.bio;
          // Verify no executable patterns remain
          expect(sanitizedBio).not.toMatch(/<script/i);
          expect(sanitizedBio).not.toMatch(/javascript:/i);
          expect(sanitizedBio).not.toMatch(/vbscript:/i);
          expect(sanitizedBio).not.toMatch(/on\w+\s*=/i);
          expect(sanitizedBio).not.toMatch(/expression\s*\(/i);
        }
      });
    });
  });
});
