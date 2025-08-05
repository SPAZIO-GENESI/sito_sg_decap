export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      console.log(`Incoming request to: ${url.pathname}`);

      // Use environment variables
      const CLIENT_ID = "Ov23liHhBJ2OIvs4V06t";
      const CLIENT_SECRET = "b12f5531c2dadc996a48c892b4dd271b632af6e8";
      const REDIRECT_URI = "https://decap-oauth-proxy.it-e3f.workers.dev/callback";


    if (url.pathname === "/auth") {
      const state = crypto.randomUUID();
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&state=${state}&scope=repo`;
      return Response.redirect(githubAuthUrl, 302);
    }

      if (url.pathname === "/callback") {
        console.log("Callback received. Full URL:", url.toString());
        
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        
        if (!code) {
          throw new Error("Missing authorization code");
        }
        if (!state) {
          throw new Error("Missing state parameter");
        }

        console.log("Exchanging code for token...");
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Cloudflare-Worker"
          },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI
          }),
        });

        console.log(`GitHub response status: ${tokenResponse.status}`);
        const tokenData = await tokenResponse.json();
        console.log("Token data:", JSON.stringify(tokenData));

        if (!tokenData.access_token) {
          throw new Error("No access token received: " + (tokenData.error_description || tokenData.error));
        }

        const cmsRedirectUrl = `https://spazio-genesi.github.io/sito_sg_decap/admin/#access_token=${tokenData.access_token}&token_type=${tokenData.token_type}`;
        console.log("Redirecting to:", cmsRedirectUrl);
        return Response.redirect(cmsRedirectUrl, 302);
      }

      return new Response("Not found", { status: 404 });

    } catch (error) {
      console.error("ERROR:", error.message);
      console.error("Stack:", error.stack);
      return new Response(`Server Error: ${error.message}`, { 
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
};