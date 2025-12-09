import axios from 'axios';

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

// Helper function to strip Markdown formatting
const stripMarkdown = (text: string): string => {
  // Bold, italic, strikethrough, inline code
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  text = text.replace(/`(.*?)`/g, '$1');
  text = text.replace(/~~(.*?)~~/g, '$1'); // strikethrough

  // Headers (remove the # symbols and leading space)
  text = text.replace(/^#+\s/gm, '');

  // Lists (remove leading hyphens, asterisks, plus signs and numbers for ordered lists)
  text = text.replace(/^\s*(\*|\-|\+|\d+\.)\s+/gm, '');

  // Blockquotes (remove leading > and space)
  text = text.replace(/^\s*>\s?/gm, '');

  // Links (keep only the link text)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '$1');

  // Newlines within text (replace with space to prevent formatting issues)
  text = text.replace(/[\r\n]+/g, ' ');

  // Remove any remaining *purely markdown* symbols that aren't part of normal text punctuation
  // E.g., square brackets, parentheses from links that might not have been caught, backticks, tildes.
  text = text.replace(/[\[\]()`~]/g, '');

  // Remove extra spaces
  text = text.replace(/\s+/g, ' ').trim();

  return text.trim();
};

interface SendPostParams {
  botToken: string;
  chatId: string;
  photoUrl: string;
  caption: string;
}

/**
 * Sends a photo with a caption to a specified Telegram chat.
 * @param params The parameters for sending the post.
 * @returns A promise that resolves when the post is sent successfully.
 */
export const sendPostToTelegram = async ({
  botToken,
  chatId,
  photoUrl,
  caption,
}: SendPostParams): Promise<void> => {
  if (!botToken) throw new Error('Telegram Bot Token is required.');
  if (!chatId) throw new Error('Telegram Channel ID is required.');
  if (!photoUrl) throw new Error('Photo URL is required.');

  const url = `${TELEGRAM_API_URL}${botToken}/sendPhoto`;

  // Strip Markdown before processing
  let cleanedCaption = stripMarkdown(caption);

  const MAX_CAPTION_LENGTH = 1024; // Adjusted length to match Telegram's actual limit
  let processedCaption = cleanedCaption;
  if (cleanedCaption.length > MAX_CAPTION_LENGTH) {
    processedCaption = cleanedCaption.substring(0, MAX_CAPTION_LENGTH - 3) + '...';
  }

  try {
    await axios.post(url, {
      chat_id: chatId,
      photo: photoUrl,
      caption: processedCaption,
      // Removed parse_mode to send as plain text
    });
  } catch (error) {
    console.error('Error sending post to Telegram:', error);
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data?.description || 'Unknown API error';
      throw new Error(`Failed to send to Telegram: ${apiError}`);
    }
    throw new Error('An unknown error occurred while sending post to Telegram.');
  }
};
