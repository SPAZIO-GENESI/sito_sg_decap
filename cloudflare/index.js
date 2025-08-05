export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Use vars from wrangler.toml
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = {
      CLIENT_ID: "Ov23liHhBJ2OIvs4V06t",
      CLIENT_SECRET: "b12f5531c2dadc996a48c892b4dd271b632af6e8",
      REDIRECT_URI: "https://decap-oauth-proxy.it-e3f.workers.dev/callback"
    };

    if (url.pathname === "/auth") {
      const state = crypto.randomUUID();
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&state=${state}&scope=repo`;
      return Response.redirect(githubAuthUrl, 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      
      // Add error handling for missing code/state
      
      // Add this verification step:
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${tokenData.access_token}`
        }
      });
      if (!userResponse.ok) {
        console.error("Token verification failed:", await userResponse.text());
        return new Response("Invalid token", { status: 400 });
      }
      
      if (!code || !state) {
        return new Response("Missing code or state", { status: 400 });
      }

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
          state,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error("GitHub OAuth error:", tokenData.error);
        return new Response(JSON.stringify(tokenData), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verify we got an access token
      if (!tokenData.access_token) {
        return new Response("No access token received", { status: 400 });
      }

      const cmsRedirectUrl = `https://spazio-genesi.github.io/sito_sg_decap/admin/#access_token=${tokenData.access_token}&token_type=${tokenData.token_type}`;
      
      return Response.redirect(cmsRedirectUrl, 302);
    }

    return new Response("Not found", { status: 404 });
  },
};