import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";

/** Render the marketing app to an HTML string for the given request URL. */
export function render(url: string): { html: string } {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
  return { html };
}
