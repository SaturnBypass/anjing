// Cloudflare Worker for bot detection and IP geolocation

// List of common bot user agent patterns (including Facebook Ads)
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baidu/i,
  /slurp/i,
  /duckduckgo/i,
  /facebookexternalhit/i,
  /facebookads/i,
  /facebook-ads/i,
  /fb_iab/i,
  /fbclid/i,
  /fb-messenger/i,
  /twitterbot/i,
  /rogerbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest/i,
  /slackbot/i,
  /vkshare/i,
  /w3c_validator/i,
  /whatsapp/i,
  /flipboard/i,
  /tumblr/i,
  /bitlybot/i,
  /skypeuripreview/i,
  /nuzzel/i,
  /discord/i,
  /viber/i,
  /telegram/i,
  /applebot/i,
  /whatsapp/i,
  /semrushbot/i,
  /pinterestbot/i,
  /ahrefsbot/i,
  /crawl/i,
  /wget/i,
  /curl/i,
  /HeadlessChrome/i,
  /Lighthouse/i,
  /Googlebot/i,
  /Mediapartners/i,
  /APIs-Google/i
];

// Function to check if a user agent is a bot
function isBot(userAgent) {
  if (!userAgent) return false;
  
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

// Handler for the main worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  
  // Handle /check-bot endpoint
  if (path.startsWith('/check-bot')) {
    const params = url.searchParams;
    const userAgent = params.get('useragent');
    
    if (!userAgent) {
      return new Response(
        JSON.stringify({ error: 'Missing useragent parameter' }), 
        { status: 400, headers }
      );
    }
    
    const result = {
      'user-agent': userAgent,
      'bot': isBot(userAgent)
    };
    
    return new Response(JSON.stringify(result, null, 2), { headers });
  }
  
  // Handle /check-ip endpoint
  if (path.startsWith('/check-ip')) {
    const params = url.searchParams;
    const ip = params.get('ip');
    
    if (!ip) {
      return new Response(
        JSON.stringify({ error: 'Missing ip parameter' }), 
        { status: 400, headers }
      );
    }
    
    try {
      // Use Cloudflare's built-in CF object to get country information
      const country = request.cf && request.cf.country ? request.cf.country : 'unknown';
      
      // For the case where IP is provided in the query but we need to use CF's detection
      let detectedCountry = country;
      
      // If the IP is not the same as the request IP, we need to make a separate lookup
      const requestIP = request.headers.get('CF-Connecting-IP');
      if (ip !== requestIP) {
        // We can only get country for the current request IP using CF object
        // For other IPs, we note that this is just the request country
        detectedCountry = 'unknown';
      }
      
      const result = {
        'ip': ip,
        'country': detectedCountry
      };
      
      return new Response(JSON.stringify(result, null, 2), { headers });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to process IP information', details: error.message }), 
        { status: 500, headers }
      );
    }
  }
  
  // Handle unknown routes
  return new Response(
    JSON.stringify({ error: 'Not Found' }), 
    { status: 404, headers }
  );
}
