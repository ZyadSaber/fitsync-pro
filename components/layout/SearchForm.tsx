"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function SearchForm({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden sm:block">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none">
        <Icon name="search" size={14} />
      </span>
      <input
        name="search"
        defaultValue={searchParams.get("search") ?? ""}
        className="fs-input pl-8 w-[180px] md:w-[220px]"
        placeholder={placeholder}
      />
    </form>
  );
}
