export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const redirect_uri = url.origin + "/callback";

      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.CLIENT_ID}&redirect_uri=${redirect_uri}&scope=repo`;

      return Response.redirect(githubAuthUrl, 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.CLIENT_ID,
          client_secret: env.CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response("Error getting access token: " + tokenData.error, { status: 400 });
      }

      return new Response(JSON.stringify(tokenData), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
