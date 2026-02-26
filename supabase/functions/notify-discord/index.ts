import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (!DISCORD_WEBHOOK_URL) {
      throw new Error('DISCORD_WEBHOOK_URL is not configured');
    }

    const body = await req.json();
    const { title, division, session_date, session_time, description } = body;

    // Validate required fields exist and are strings
    if (
      typeof title !== 'string' || !title.trim() ||
      typeof division !== 'string' || !division.trim() ||
      typeof session_date !== 'string' || !session_date.trim() ||
      typeof session_time !== 'string' || !session_time.trim()
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enforce length limits
    if (title.length > 200 || division.length > 100 || session_date.length > 20 || session_time.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Field length exceeds maximum allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (description && (typeof description !== 'string' || description.length > 1000)) {
      return new Response(
        JSON.stringify({ error: 'Description must be a string under 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(session_date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Expected YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
    if (!timeRegex.test(session_time)) {
      return new Response(
        JSON.stringify({ error: 'Invalid time format. Expected HH:MM' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize text fields - trim and truncate for Discord embed limits
    const safeTitle = title.trim().slice(0, 200);
    const safeDivision = division.trim().slice(0, 100);
    const safeDescription = description ? description.trim().slice(0, 1000) : null;

    // Format date nicely
    const dateObj = new Date(session_date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format time
    const [hours, minutes] = session_time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedTime = `${h % 12 || 12}:${minutes} ${ampm}`;

    const embed = {
      title: '🏋️ New Training Session',
      color: 0xdc2626, // red-600
      fields: [
        { name: '📋 Title', value: safeTitle, inline: false },
        { name: '🎮 Division', value: safeDivision, inline: true },
        { name: '📅 Date', value: formattedDate, inline: true },
        { name: '⏰ Time', value: formattedTime, inline: true },
      ],
      footer: { text: 'Head to the Attendance page to check in!' },
      timestamp: new Date().toISOString(),
    };

    if (safeDescription) {
      embed.fields.splice(1, 0, { name: '📝 Description', value: safeDescription, inline: false });
    }

    const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      throw new Error(`Discord webhook failed [${discordRes.status}]: ${errorText}`);
    }

    // Consume response body
    await discordRes.text();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error sending Discord notification:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
