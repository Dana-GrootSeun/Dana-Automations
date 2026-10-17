// Cloudflare static assets answer Range requests with the whole file (200).
// Safari and every iPhone browser then refuse to play the video, so for .mp4
// files this slices the asset and returns 206 Partial Content.
// Our videos are a few MB, so reading the whole file into memory is fine.
export default {
  async fetch(request, env) {
    const range = request.headers.get("range");
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m || request.method !== "GET" || (m[1] === "" && m[2] === "")) return env.ASSETS.fetch(request);

    const full = await env.ASSETS.fetch(new Request(request.url, { method: "GET" }));
    if (!full.ok) return full;
    const body = await full.arrayBuffer();
    const size = body.byteLength;

    let start, end;
    if (m[1] === "") { start = Math.max(0, size - Number(m[2])); end = size - 1; } // bytes=-500
    else { start = Number(m[1]); end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1); }

    const headers = new Headers(full.headers);
    headers.set("accept-ranges", "bytes");
    if (start >= size || start > end) {
      headers.set("content-range", `bytes */${size}`);
      headers.delete("content-length");
      return new Response(null, { status: 416, headers });
    }
    headers.set("content-range", `bytes ${start}-${end}/${size}`);
    headers.set("content-length", String(end - start + 1));
    return new Response(body.slice(start, end + 1), { status: 206, headers });
  },
};
