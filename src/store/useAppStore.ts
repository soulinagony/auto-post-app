import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  openRouterKey: string;
  telegramBotToken: string;
  channelId: string;
  sourceUrl: string;
  
  // For chunk management
  textChunks: string[];
  currentChunkIndex: number;
  generatedChunks: { post: string; imageUrl: string }[]; // Store generated content per chunk

  parsedText: string; // The text of the currently active chunk
  generatedPost: string; // The generated post for the currently active chunk
  generatedImageUrl: string; // The generated image URL for the currently active chunk
  isLoading: boolean;

  setKeys: (keys: { openRouterKey?: string; telegramBotToken?: string; channelId?: string }) => void;
  setSourceUrl: (url: string) => void;
  
  // New chunk-related setters
  setTextChunks: (chunks: string[]) => void;
  setCurrentChunkIndex: (index: number) => void;
  setGeneratedChunkContent: (index: number, post: string, imageUrl: string) => void;

  setParsedText: (text: string) => void; // Will be used to set the current chunk's text
  setGeneratedContent: (post: string, imageUrl: string) => void; // Will be used to set current chunk's generated content
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      openRouterKey: '',
      telegramBotToken: '',
      channelId: '',
      sourceUrl: '',
      
      textChunks: [],
      currentChunkIndex: 0,
      generatedChunks: [],

      parsedText: '', // Initial state for parsedText will be derived from textChunks[currentChunkIndex]
      generatedPost: '',
      generatedImageUrl: '',
      isLoading: false,

      setKeys: ({ openRouterKey, telegramBotToken, channelId }) =>
        set((state) => ({
          openRouterKey: openRouterKey ?? state.openRouterKey,
          telegramBotToken: telegramBotToken ?? state.telegramBotToken,
          channelId: channelId ?? state.channelId,
        })),
      setSourceUrl: (url) => set({ sourceUrl: url }),
      
      setTextChunks: (chunks) => set(() => {
        // Initialize generatedChunks array with empty values for new chunks
        const newGeneratedChunks = chunks.map(() => ({ post: '', imageUrl: '' }));
        return { 
          textChunks: chunks, 
          currentChunkIndex: 0, // Reset to first chunk when new chunks are set
          parsedText: chunks.length > 0 ? chunks[0] : '',
          generatedChunks: newGeneratedChunks,
          generatedPost: '', // Clear generated post
          generatedImageUrl: '', // Clear generated image
        };
      }),
      setCurrentChunkIndex: (index) => set((state) => {
        const newIndex = Math.max(0, Math.min(index, state.textChunks.length - 1));
        const currentChunkContent = state.generatedChunks[newIndex];
        return {
          currentChunkIndex: newIndex,
          parsedText: state.textChunks[newIndex],
          generatedPost: currentChunkContent ? currentChunkContent.post : '',
          generatedImageUrl: currentChunkContent ? currentChunkContent.imageUrl : '',
        };
      }),
      setGeneratedChunkContent: (index, post, imageUrl) => set((state) => {
        const newGeneratedChunks = [...state.generatedChunks];
        newGeneratedChunks[index] = { post, imageUrl };
        return { 
          generatedChunks: newGeneratedChunks,
          // Also update the currently displayed generated content if it's the active chunk
          ...(index === state.currentChunkIndex && { generatedPost: post, generatedImageUrl: imageUrl }),
        };
      }),

      setParsedText: (text) => set({ parsedText: text }), // This will now typically be called internally by setCurrentChunkIndex or setTextChunks
      setGeneratedContent: (post, imageUrl) =>
        set({ generatedPost: post, generatedImageUrl: imageUrl }), // This will now typically be called internally by setGeneratedChunkContent
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'ai-content-manager-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        openRouterKey: state.openRouterKey,
        telegramBotToken: state.telegramBotToken,
        channelId: state.channelId,
      }),
    }
  )
);
