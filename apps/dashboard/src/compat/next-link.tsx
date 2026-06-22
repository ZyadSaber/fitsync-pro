/** Replacement for `next/link` — maps `href` to react-router's `to`. */
import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";

type NextLinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & {
  href: string;
  prefetch?: boolean;
};

export default function Link({ href, prefetch: _prefetch, ...rest }: NextLinkProps) {
  return <RouterLink to={href} {...rest} />;
}
