// Netlify Scheduled Function: triggers a fresh deploy once a day so the RSS
// feeds on the home page ("the feed") are refetched at build time.
// Set BUILD_HOOK_URL in Netlify → Site configuration → Environment variables
// to a build hook created under Build & deploy → Build hooks.
export default async () => {
  const hook = process.env.BUILD_HOOK_URL;
  if (!hook) {
    console.warn("BUILD_HOOK_URL is not set; skipping daily rebuild.");
    return new Response("BUILD_HOOK_URL not set", { status: 200 });
  }
  const res = await fetch(hook, { method: "POST" });
  console.log(`Triggered daily rebuild: ${res.status}`);
  return new Response(null, { status: res.ok ? 200 : 502 });
};

export const config = { schedule: "@daily" };
