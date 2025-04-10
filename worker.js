export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Define bot patterns
    const botPatterns = [
  /googlebot/i, // Pola untuk Googlebot
  /google-site-verification/i, // Pola untuk Google-Site-Verification
  /google-inspectiontool/i, // Pola untuk Google-InspectionTool
  /googlebot-mobile/i, // Pola untuk Googlebot-Mobile
  /googlebot-news/i, // Pola untuk Googlebot-News
  /bot/i, /crawler/i, /spider/i, /bingbot/i, /yandex/i,
  /baidu/i, /slurp/i, /duckduckgo/i, /facebookexternalhit/i,
  /facebookads/i, /facebook-ads/i, /fb_iab/i, /fbclid/i, /fb-messenger/i,
  /twitterbot/i, /rogerbot/i, /linkedinbot/i, /embedly/i,
  /quora link preview/i, /showyoubot/i, /outbrain/i, /pinterest/i,
  /slackbot/i, /vkshare/i, /w3c_validator/i, /whatsapp/i, /flipboard/i,
  /tumblr/i, /bitlybot/i, /skypeuripreview/i, /nuzzel/i, /discord/i,
  /viber/i, /telegram/i, /applebot/i, /semrushbot/i, /pinterestbot/i,
  /ahrefsbot/i, /crawl/i, /wget/i, /curl/i, /HeadlessChrome/i,
  /Lighthouse/i, /Mediapartners/i, /APIs-Google/i
];

    // Define device patterns
    const mobilePatterns = [
  /Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i,
  /Windows Phone/i, /Mobile/i, /Opera Mini/i, /IEMobile/i, /Kindle/i,
  /Silk/i, /Fennec/i, /Maemo/i, /MeeGo/i, /PlayBook/i, /BB10/i,
  /Palm/i, /Nokia/i, /SamsungBrowser/i, /UCWEB/i, /UCBrowser/i,
  /Obigo/i, /Blazer/i, /Dolphin/i, /Bada/i, /Tizen/i, /NetFront/i,
  /Midori/i, /OneBrowser/i, /CoolPad/i, /Huawei/i, /Xiaomi/i,
  /Vivo/i, /Oppo/i, /Realme/i, /Infinix/i, /Tecno/i, /Alcatel/i,
  /ZTE/i, /Lenovo/i, /SonyEricsson/i, /Motorola/i
];
    
    const desktopPatterns = [
  /Windows NT/i, /Macintosh/i, /Linux x86_64/i, /X11/i, /Ubuntu/i,
  /Fedora/i, /Debian/i, /Red Hat/i, /FreeBSD/i, /OpenBSD/i,
  /Mac OS X/i, /Chrome OS/i, /Intel Mac OS X/i, /Windows 98/i,
  /Windows XP/i, /Windows Vista/i, /Windows 7/i, /Windows 8/i,
  /Windows 10/i, /Windows 11/i, /CrOS/i
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

    // Handle device check
    if (path.startsWith("/check-device")) {
      const userAgent = url.searchParams.get("useragent");

      if (!userAgent) {
        return new Response(
          JSON.stringify({ error: "Missing useragent parameter" }),
          { status: 400, headers }
        );
      }

      const isMobile = mobilePatterns.some(pattern => pattern.test(userAgent));
      const isDesktop = desktopPatterns.some(pattern => pattern.test(userAgent));

      return new Response(
        JSON.stringify({
          "user-agent": userAgent,
          "mobile": isMobile,
          "desktop": isDesktop
        }, null, 2),
        { headers }
      );
    }

    // Handle IP check (Menggunakan API GeoIP dari Vercel)
    if (path.startsWith("/check-ip")) {
      let ip = url.searchParams.get("ip") || request.headers.get("CF-Connecting-IP");

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
