// cloudflare/index.js
var index_default = {
  async fetch(request) {
    const url = new URL(request.url);
    console.log(`Request: ${url.pathname}${url.search}`);
    const CLIENT_ID = "Ov23liHhBJ2OIvs4V06t";
    const CLIENT_SECRET = "b12f5531c2dadc996a48c892b4dd271b632af6e8";
    const REDIRECT_URI = "https://decap-oauth-proxy.it-e3f.workers.dev/callback";
    const ADMIN_URL = "https://spazio-genesi.github.io/sito_sg_decap/admin/";
    if (url.pathname === "/auth") {
      const state = crypto.randomUUID();
      const scope = url.searchParams.get("scope") || "repo";
      const authUrl = new URL("https://github.com/login/oauth/authorize");
      authUrl.searchParams.set("client_id", CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("scope", scope);
      console.log(`Redirecting to GitHub: ${authUrl.toString()}`);
      return Response.redirect(authUrl.toString(), 302);
    }
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing authorization code", { status: 400 });
      console.log("Exchanging code for token...");
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Decap-CMS-OAuth-Proxy"
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI
        })
      });
      const tokenData = await tokenResponse.json();
      console.log("Token data received:", tokenData);
      if (!tokenData.access_token) {
        return new Response(`Authentication failed: ${tokenData.error_description || "No access token"}`, {
          status: 401
        });
      }
      const redirectUrl = new URL(ADMIN_URL);
      redirectUrl.hash = `access_token=${tokenData.access_token}&token_type=${tokenData.token_type}&expires_in=${tokenData.expires_in || 3600}`;
      console.log(`Redirecting to CMS: ${redirectUrl.toString()}`);
      return Response.redirect(redirectUrl.toString(), 302);
    }
    return new Response("Endpoint not found", { status: 404 });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
