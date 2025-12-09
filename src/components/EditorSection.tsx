import { useAppStore } from '../store/useAppStore'; // Keep useAppStore to potentially update generated content directly if needed
import { RefreshCcw, Send, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react'; // Added ChevronLeft
import { clsx } from 'clsx';

interface EditorSectionProps {
  onRegenerate: () => void;
  onPublish: () => void;
  onNextChunk: () => void;
  onPreviousChunk: () => void; // New prop for previous chunk
  currentChunkIndex: number; // Current chunk index for display and logic
  totalChunks: number; // Total number of chunks for display and logic
  currentParsedText: string; // The raw text of the current chunk
  currentGeneratedPost: string; // The generated post for the current chunk
  currentGeneratedImageUrl: string; // The generated image URL for the current chunk
  isLoading: boolean; // Loading state passed from App.tsx
}

export const EditorSection = ({
  onRegenerate,
  onPublish,
  onNextChunk,
  onPreviousChunk, // Destructure new prop
  currentChunkIndex,
  totalChunks,
  currentParsedText,
  currentGeneratedPost,
  currentGeneratedImageUrl,
  isLoading,
}: EditorSectionProps) => {
  const { setGeneratedChunkContent } = useAppStore(); // Keep setGeneratedChunkContent for direct text editing

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // When text is changed, update the generated content for the current chunk directly in the store
    setGeneratedChunkContent(currentChunkIndex, e.target.value, currentGeneratedImageUrl);
  };

  const isFirstChunk = currentChunkIndex === 0;
  const isLastChunk = currentChunkIndex === totalChunks - 1 || totalChunks === 0; // totalChunks === 0 for empty state
  const hasMultipleChunks = totalChunks > 1;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Image Column */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full bg-black/30 rounded-lg flex items-center justify-center p-4 text-center">
            {currentGeneratedImageUrl ? (
              <img src={currentGeneratedImageUrl} alt="Generated" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-white/40">
                <ImageIcon className="mx-auto mb-2" size={50} />
                <p className="text-sm">Изображение для поста появится здесь</p>
              </div>
            )}
          </div>
        </div>

        {/* Text and Actions Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Редактор Поста
              {hasMultipleChunks && (
                <span className="text-base text-white/60 ml-2">
                  (Сегмент {currentChunkIndex + 1} из {totalChunks})
                </span>
              )}
            </h2>
            <button
              onClick={onRegenerate}
              disabled={isLoading || !currentParsedText} // Use currentParsedText for enabling
              className="p-2 rounded-full bg-telegramBlue-600 hover:bg-telegramBlue-700 disabled:bg-telegramBlue-900/50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center"
              title="Регенерировать пост"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
          <textarea
            value={currentGeneratedPost} // Use generatedPost from props
            onChange={handleTextChange}
            className="w-full flex-grow bg-black/30 text-white rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-telegramBlue-500 disabled:opacity-50"            
            placeholder={
              !currentParsedText // Use currentParsedText for placeholder logic
                ? 'Сначала загрузите статью...'
                : 'Ожидание генерации поста...'
            }
            disabled={isLoading} // Disable editing if loading
          />
          {hasMultipleChunks && (
            <div className="flex justify-between mt-2">
              <button
                onClick={onPreviousChunk}
                disabled={isLoading || isFirstChunk}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                <ChevronLeft size={18} />
                Предыдущий
              </button>
              <button
                onClick={onNextChunk}
                disabled={isLoading || isLastChunk}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Следующий
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          <button
            onClick={onPublish}
            disabled={isLoading || !currentGeneratedPost} // Use currentGeneratedPost for enabling
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-colors"
          >
            <Send size={18} />
            Опубликовать
          </button>
        </div>
      </div>
    </div>
  );
};
