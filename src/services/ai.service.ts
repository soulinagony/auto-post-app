import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const POLLINATIONS_API_URL = 'https://image.pollinations.ai/prompt/';

const SYSTEM_PROMPT = `Ты опытный контент-менеджер. Твоя задача — написать информативный, фактический и краткий пост для Telegram на основе предоставленного текста. Пост не должен превышать 1024 символов. Также сгенерируй короткий, точный запрос на английском языке для генерации изображения, соответствующего тематике поста. Используй эмодзи и форматирование по минимуму, только когда они уместны и дополняют смысл, и избегай чрезмерного использования специальных символов и хэштегов.

Ответ должен быть в формате JSON:

{

  "post": "Текст поста",

  "short_image_prompt": "Краткий запрос для изображения на английском языке",

  "hashtags": ["хештег1", "хештег2", "хештег3"]

}

`

/**
 * Generates a viral Telegram post using the OpenRouter API.
 * @param apiKey The user's OpenRouter API key.
 * @param textChunk A chunk of text to base the post on.
 * @returns A promise that resolves to the generated post text.
 */
export const generatePostText = async (
  apiKey: string,
  textChunk: string
): Promise<{ post: string; imagePrompt: string }> => {
  if (!apiKey) throw new Error('OpenRouter API key is required.');
  if (!textChunk) throw new Error('Text chunk is required to generate a post.');

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'tngtech/deepseek-r1t2-chimera:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: textChunk },
        ],
        response_format: { type: 'json_object' }, // Request JSON object
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      try {
        const parsedContent = JSON.parse(content);
        let post = parsedContent.post;
        const imagePrompt = parsedContent.short_image_prompt;
        const hashtags = parsedContent.hashtags; // Extract hashtags

        // Remove any trailing ')' characters that might appear due to truncation or formatting issues.
        post = post.replace(/\)+$/, '').trim();

        // Ensure the post ends with a period if it doesn't already end with punctuation.
        if (!/[.!?]$/.test(post)) {
          post += '.';
        }

        // Append formatted hashtags to the post
        if (Array.isArray(hashtags) && hashtags.length > 0) {
          const formattedHashtags = hashtags.map((tag: string) => `#${tag.trim()}`).join(' ');
          post += `\n\n${formattedHashtags}`; // Add two newlines for separation
        }

        return { post, imagePrompt };
      } catch (jsonError) {
        console.error('Error parsing AI response as JSON:', jsonError);
        throw new Error('Invalid JSON response from AI.');
      }
    } else {
      throw new Error('No response choices from AI.');
    }
  } catch (error) {
    console.error('Error generating post text from OpenRouter:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to generate text: ${error.response?.data?.error?.message || error.message}`);
    }
    throw new Error('An unknown error occurred while generating post text.');
  }
};

/**
 * Creates a URL for a generative image based on a text prompt.
 * @param prompt The text prompt for the image.
 * @returns A URL for the generated image.
 */
export const generateImageUrl = (prompt: string): string => {
  if (!prompt) return '';
  const encodedPrompt = encodeURIComponent(prompt); // Use a slice of the prompt for URL length safety
  return `${POLLINATIONS_API_URL}${encodedPrompt}?width=1024&height=1024&nologo=true`;
};
