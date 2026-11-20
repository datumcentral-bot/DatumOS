import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

// ─── YouTube Data API v3 integration ───────────────────────────────────────
// Reads YOUTUBE_API_KEY (+ optional YOUTUBE_CHANNEL_ID / YOUTUBE_CHANNEL_HANDLE)
// from the environment. The key is never echoed back in any response.
//
//   GET /api/youtube  ->  { connected, channel, videos, reason? }
//
// Always answers 200 with connected:false + a human-readable `reason` when the
// integration is unavailable, so the Integrations UI can render a real state
// instead of a fabricated one. Only auth failures are non-200.

export const dynamic = "force-dynamic";

const API = "https://www.googleapis.com/youtube/v3";

async function yt(resource, params, key) {
  const url = new URL(`${API}/${resource}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const reason =
      body?.error?.errors?.[0]?.reason ||
      body?.error?.message ||
      `YouTube API HTTP ${res.status}`;
    const err = new Error(reason);
    err.status = res.status;
    throw err;
  }
  return body;
}

function unavailable(reason) {
  return NextResponse.json({
    connected: false,
    reason,
    channel: null,
    videos: [],
    fetchedAt: new Date().toISOString(),
  });
}

export async function GET(req) {
  try {
    await requireRole("DIRECTOR");
  } catch (err) {
    return errorResponse(err, req)
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return unavailable("YOUTUBE_API_KEY is not set");
  if (!key.startsWith("AIza")) return unavailable("YOUTUBE_API_KEY is not a YouTube Data API key");

  try {
    // ── 1. resolve the channel (by ID, else by handle) ─────────────────────
    const part = "snippet,contentDetails,statistics";
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    const handle = process.env.YOUTUBE_CHANNEL_HANDLE || "@datumproductions";

    const ch = channelId
      ? await yt("channels", { part, id: channelId }, key)
      : await yt("channels", { part, forHandle: handle }, key);

    const item = ch?.items?.[0];
    if (!item) return unavailable(`No channel found for ${channelId || handle}`);

    // ── 2. newest uploads via the channel's uploads playlist ───────────────
    const uploads = item.contentDetails?.relatedPlaylists?.uploads;
    const list = uploads
      ? await yt("playlistItems", { part: "contentDetails", playlistId: uploads, maxResults: 12 }, key)
      : { items: [] };

    const ids = (list.items || [])
      .map((i) => i?.contentDetails?.videoId)
      .filter(Boolean);

    // ── 3. enrich with titles, dates and stats ─────────────────────────────
    let videos = [];
    if (ids.length) {
      const vr = await yt(
        "videos",
        { part: "snippet,statistics,contentDetails", id: ids.join(","), maxResults: 12 },
        key
      );
      videos = (vr.items || []).map((v) => ({
        id: v.id,
        title: v.snippet?.title || "",
        publishedAt: v.snippet?.publishedAt || null,
        thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || null,
        duration: v.contentDetails?.duration || null,
        views: Number(v.statistics?.viewCount || 0),
        likes: Number(v.statistics?.likeCount || 0),
        url: `https://www.youtube.com/watch?v=${v.id}`,
      }));
    }

    const subs = item.statistics?.subscriberCount;
    const count = item.statistics?.videoCount;

    return NextResponse.json({
      connected: true,
      reason: null,
      channel: {
        id: item.id,
        title: item.snippet?.title || null,
        handle: item.snippet?.customUrl || null,
        thumbnail: item.snippet?.thumbnails?.default?.url || null,
        subscribers: subs === undefined || subs === null ? null : Number(subs),
        videoCount: count === undefined || count === null ? null : Number(count),
        url: `https://www.youtube.com/channel/${item.id}`,
      },
      videos,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Quota exhaustion, bad key, handle not found, network — all surface here.
    // Only reasons yt() constructed itself (YouTube's enum-style reason or
    // "YouTube API HTTP <status>") are echoed; unexpected error text can
    // carry URLs or parse fragments, so it becomes a generic state.
    const reason = err?.status ? String(err.message).slice(0, 200) : "Integration unavailable";
    return unavailable(reason);
  }
}
