interface WebMcpToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

interface WebMcpTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (inputObject: Record<string, unknown>) => Promise<unknown>;
  annotations?: WebMcpToolAnnotations;
}

interface WebMcpRegisterToolOptions {
  signal?: AbortSignal;
  exposedTo?: string[];
}

interface WebMcpModelContext {
  registerTool(tool: WebMcpTool, options?: WebMcpRegisterToolOptions): Promise<void>;
}

interface Document {
  readonly modelContext?: WebMcpModelContext;
}
