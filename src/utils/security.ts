// Security utilities for input validation and sanitization

export class SecurityValidator {
  // Input validation patterns
  private static patterns = {
    email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    username: /^[a-zA-Z0-9_-]{3,30}$/,
    alphanumericWithSpaces: /^[a-zA-Z0-9\s-_.]{1,100}$/,
    alphanumeric: /^[a-zA-Z0-9]{1,50}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    noScriptTags: /^(?!.*<script|.*javascript:|.*vbscript:|.*onclick|.*onerror|.*onload).*$/i
  };

  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    return this.patterns.email.test(email);
  }

  // Validate username format
  static validateUsername(username: string): boolean {
    return this.patterns.username.test(username);
  }

  // Validate text input (names, titles, etc.)
  static validateText(text: string, maxLength = 100): boolean {
    if (!text || text.length > maxLength) return false;
    return this.patterns.alphanumericWithSpaces.test(text) && 
           this.patterns.noScriptTags.test(text);
  }

  // Validate URL format
  static validateUrl(url: string): boolean {
    if (!url) return true; // Optional URLs are valid
    return this.patterns.url.test(url);
  }

  // Password strength validation
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length === 64;
  }
}

// Rate limiting utility
export class RateLimiter {
  private static attempts: Map<string, { count: number; timestamp: number }> = new Map();
  
  static isRateLimited(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now - attempt.timestamp > windowMs) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return false;
    }
    
    if (attempt.count >= maxAttempts) {
      return true;
    }
    
    attempt.count++;
    return false;
  }
  
  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Auth state cleanup for security
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};