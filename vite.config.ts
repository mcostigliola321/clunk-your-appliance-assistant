import { fileURLToPath, URL } from "node:url";

import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), mcpPlugin()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
