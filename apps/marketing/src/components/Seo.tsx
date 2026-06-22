/**
 * React 19 hoists <title>/<meta> rendered anywhere in the tree into <head>,
 * so this works for both SSR (initial HTML) and client navigation.
 */
export default function Seo({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </>
  );
}
