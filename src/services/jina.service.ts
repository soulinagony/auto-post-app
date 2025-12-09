import axios from 'axios';

const JINA_API_SUFFIX = 'https://r.jina.ai/';

/**
 * Fetches and parses content from a given URL using the Jina AI reader API.
 * @param url The URL of the article to parse.
 * @returns A promise that resolves to the parsed markdown text.
 * @throws Will throw an error if the network request fails.
 */
export const fetchContentFromUrl = async (url: string): Promise<string> => {
  if (!url) {
    throw new Error('URL is required.');
  }

  try {
    const response = await axios.get(`${JINA_API_SUFFIX}${url}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching content from Jina AI:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch content: ${error.response?.data || error.message}`);
    }
    throw new Error('An unknown error occurred while fetching content.');
  }
};
