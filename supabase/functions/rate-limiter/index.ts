import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000 } = await req.json()

    if (!identifier) {
      return new Response(
        JSON.stringify({ error: 'Identifier is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    if (!entry || now - entry.timestamp > windowMs) {
      // New entry or expired window
      rateLimitStore.set(identifier, { count: 1, timestamp: now })
      return new Response(
        JSON.stringify({ 
          allowed: true, 
          count: 1, 
          remaining: maxAttempts - 1,
          resetTime: now + windowMs
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (entry.count >= maxAttempts) {
      // Rate limited
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          count: entry.count,
          remaining: 0,
          resetTime: entry.timestamp + windowMs,
          retryAfter: Math.ceil((entry.timestamp + windowMs - now) / 1000)
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((entry.timestamp + windowMs - now) / 1000).toString()
          } 
        }
      )
    }

    // Increment count
    entry.count++
    
    return new Response(
      JSON.stringify({ 
        allowed: true, 
        count: entry.count,
        remaining: maxAttempts - entry.count,
        resetTime: entry.timestamp + windowMs
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})