import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // R2 cache can be added later if we want longer-lived incremental caching.
});
