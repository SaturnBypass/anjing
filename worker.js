export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Define bot patterns
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /googlebot/i, /bingbot/i, /yandex/i,
      /baidu/i, /slurp/i, /duckduckgo/i, /facebookexternalhit/i,
      /facebookads/i, /facebook-ads/i, /fb_iab/i, /fbclid/i, /fb-messenger/i,
      /twitterbot/i, /rogerbot/i, /linkedinbot/i, /embedly/i,
      /quora link preview/i, /showyoubot/i, /outbrain/i, /pinterest/i,
      /slackbot/i, /vkshare/i, /w3c_validator/i, /whatsapp/i, /flipboard/i,
      /tumblr/i, /bitlybot/i, /skypeuripreview/i, /nuzzel/i, /discord/i,
      /viber/i, /telegram/i, /applebot/i, /semrushbot/i, /pinterestbot/i,
      /ahrefsbot/i, /crawl/i, /wget/i, /curl/i, /HeadlessChrome/i,
      /Lighthouse/i, /Googlebot/i, /Mediapartners/i, /APIs-Google/i
    ];

    // Common headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // Handle OPTIONS (CORS preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Handle bot check
    if (path.startsWith("/check-bot")) {
      const userAgent = url.searchParams.get("useragent");

      if (!userAgent) {
        return new Response(
          JSON.stringify({ error: "Missing useragent parameter" }),
          { status: 400, headers }
        );
      }

      const isBot = botPatterns.some(pattern => pattern.test(userAgent));

      return new Response(
        JSON.stringify({
          "user-agent": userAgent,
          "bot": isBot
        }, null, 2),
        { headers }
      );
    }

    // Handle IP check (Menggunakan API GeoIP dari Vercel)
    if (path.startsWith("/check-ip")) {
      let ip = url.searchParams.get("ip");

      if (!ip) {
        return new Response(
          JSON.stringify({ error: "IP address not found" }),
          { status: 400, headers }
        );
      }

      try {
        // Fetch data dari API eksternal
        const response = await fetch(`https://geoip-eta.vercel.app/check-ip?ip=${ip}`);
        const data = await response.json();

        return new Response(JSON.stringify(data, null, 2), { headers });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch geoip data" }),
          { status: 500, headers }
        );
      }
    }

    // Handle unknown routes
    return new Response(
      JSON.stringify({ error: "Not Found" }),
      { status: 404, headers }
    );
  }
};
