/**
 * Constants and injected scripts that couple the native shell to the hosted
 * Benefits Assistant web app.
 */

/** The deployed Benefits Assistant. Updates ship via the GitHub Pages CI. */
export const SITE_URL = "https://pai45.github.io/claim/";

/**
 * Everything under this prefix stays in the WebView. The home screen embeds
 * `/claim/employee-benefits/index.html` in an iframe, and on Android
 * `onShouldStartLoadWithRequest` fires for subframes too, so the prefix has to
 * cover the iframe as well as top-level routes.
 */
export const SITE_URL_PREFIX = "https://pai45.github.io/claim";

/** Hash the web app uses to mark the chat overlay open. */
export const CLAIMS_HASH = "#claims";

/** Message shape posted from the page to the shell. */
export type BridgeMessage = { type: "hash"; hash: string };

/**
 * Reports the current hash to the shell so the Android back button can close
 * the chat overlay.
 *
 * The overlay is opened with `history.replaceState(null, "", "#claims")`, which
 * fires neither `hashchange` nor `popstate`, so listening for those events
 * alone would never observe it. History is patched to emit on every call.
 */
export const HASH_BRIDGE_JS = `
(function () {
  if (window.__benefitsAssistantBridge) return;
  window.__benefitsAssistantBridge = true;

  var post = function () {
    if (!window.ReactNativeWebView) return;
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'hash', hash: window.location.hash || '' })
    );
  };

  ['pushState', 'replaceState'].forEach(function (name) {
    var original = window.history[name];
    if (typeof original !== 'function') return;
    window.history[name] = function () {
      var result = original.apply(this, arguments);
      post();
      return result;
    };
  });

  window.addEventListener('hashchange', post);
  window.addEventListener('popstate', post);
  post();
})();
true;
`;

/**
 * Closes the chat overlay, mirroring the web app's own close handler and then
 * forcing its `hashchange` listener to re-sync (the listener ignores the event
 * object, so a plain Event is enough and avoids HashChangeEvent support risk).
 */
export const CLOSE_CLAIMS_JS = `
(function () {
  if ((window.location.hash || '').toLowerCase() !== '${CLAIMS_HASH}') return;
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search
  );
  window.dispatchEvent(new Event('hashchange'));
})();
true;
`;

/** True for URLs the WebView should load itself rather than hand to the OS. */
export function isInternalUrl(url: string): boolean {
  if (url.startsWith(SITE_URL_PREFIX)) return true;
  // Bill and licence previews are created in-page with URL.createObjectURL.
  return (
    url.startsWith("blob:") || url.startsWith("data:") || url === "about:blank"
  );
}
