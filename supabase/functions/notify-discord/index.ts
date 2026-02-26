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

    const { title, division, session_date, session_time, description } = await req.json();

    if (!title || !division || !session_date || !session_time) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        { name: '📋 Title', value: title, inline: false },
        { name: '🎮 Division', value: division, inline: true },
        { name: '📅 Date', value: formattedDate, inline: true },
        { name: '⏰ Time', value: formattedTime, inline: true },
      ],
      footer: { text: 'Head to the Attendance page to check in!' },
      timestamp: new Date().toISOString(),
    };

    if (description) {
      embed.fields.splice(1, 0, { name: '📝 Description', value: description, inline: false });
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
