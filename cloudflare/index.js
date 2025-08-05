export default {
  async fetch(request) {
    const url = new URL(request.url);

    const client_id = "Ov23liHhBJ2OIvs4V06t";
    const client_secret = "b12f5531c2dadc996a48c892b4dd271b632af6e8";
    const redirect_uri = "https://decap-oauth-proxy.it-e3f.workers.dev/callback";

    if (url.pathname === "/auth") {
      const state = crypto.randomUUID();
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(
        redirect_uri
      )}&state=${state}&scope=repo`;
      return Response.redirect(githubAuthUrl, 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id,
          client_secret,
          code,
          redirect_uri,
          state,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(JSON.stringify(tokenData), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          token: tokenData.access_token,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response("Not found", { status: 404 });
  },
};
