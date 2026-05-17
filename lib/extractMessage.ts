export default function extractMessage(err: unknown, prefix: string): string {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "object"
        ? JSON.stringify(err, null, 2)
        : String(err);
  console.error(prefix, message);
  return message;
}
