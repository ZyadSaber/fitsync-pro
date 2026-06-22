/** No-op stand-ins for server-only Next.js modules (next/cache, next/headers). */
export function revalidatePath(_path?: string, _type?: string): void {}
export function revalidateTag(_tag?: string): void {}
export function cookies() {
  return {
    get: (_name: string) => undefined,
    getAll: () => [],
    set: () => {},
  };
}
export function headers() {
  return new Headers();
}
