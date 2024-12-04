const TelegramBot = require('telegram-bot-api');
const dns = require('dns').promises;
const { URL } = require('url'); // Import URL module for parsing

// Your bot's token
const api = new TelegramBot({
  token: '8173034297:AAEMPqgabe68vbo3dCLk7tpmiMhd2COJUUY',
});

// Function to resolve domain to IP addresses
async function getIP(domain) {
  try {
    const ipv4 = await dns.resolve4(domain).catch(() => []);
    const ipv6 = await dns.resolve6(domain).catch(() => []);
    return { ipv4, ipv6 };
  } catch (error) {
    return null; // Return null if resolution fails
  }
}

// Extract domain from URL
function extractDomain(input) {
  try {
    const url = new URL(input);
    return url.host; // Return the hostname (e.g., "domain.com")
  } catch (error) {
    return input; // If not a valid URL, return the original input
  }
}

// Handle user messages
api.on('message', async (message) => {
  if (!message.text) return;

  const text = message.text.trim();

  // Handle /start command
  if (text === '/start') {
    api.sendMessage({
      chat_id: message.chat.id,
      text: `
<b>Welcome to the Website to IP Bot!</b>
Send a domain name or URL to retrieve its IPv4 and IPv6 addresses.

Developer: <a href="https://t.me/febrykullbet">@febrykullbet</a>
      `,
      parse_mode: 'HTML',
    });
    return;
  }

  // Extract domain from input
  const domain = extractDomain(text);

  // Validate extracted domain
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
    return; // Ignore invalid domain input
  }

  const ipData = await getIP(domain);

  if (ipData) {
    const { ipv4, ipv6 } = ipData;

    // If no IP addresses found, silently pass
    if (ipv4.length === 0 && ipv6.length === 0) {
      return; // Do nothing
    }

    // Prepare response
    let response = '';

    if (ipv6.length > 0) {
      response += ipv6.map((ip) => `<code>${ip} ${domain}</code>`).join('\n');
    }

    if (ipv4.length > 0) {
      response += (response ? '\n' : '') + ipv4.map((ip) => `<code>${ip} ${domain}</code>`).join('\n');
    }

    // Send response
    api.sendMessage({
      chat_id: message.chat.id,
      text: response.trim()},
      parse_mode: 'HTML',
    });
  }
});

// Handle errors
api.on('error', (error) => {
  console.log('An error occurred:', error);
});

// Start the bot
console.log('Bot is running!');
