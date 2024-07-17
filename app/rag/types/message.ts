export type Message = {
  content: string;
  role: "human" | "ai";
  runId?: string;
  traceUrl?: string;
};
