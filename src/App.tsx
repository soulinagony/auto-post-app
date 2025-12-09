import './App.css';
import toast, { Toaster } from 'react-hot-toast';
import { EditorSection } from './components/EditorSection';
import { InputSection } from './components/InputSection';
import { SettingsPanel } from './components/SettingsPanel';
import { useAppStore } from './store/useAppStore';
import { fetchContentFromUrl } from './services/jina.service';
import { generatePostText, generateImageUrl } from './services/ai.service';
import { sendPostToTelegram } from './services/telegram.service';
import { useState } from 'react'; // Import useState
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import icons for toggle button

function App() {
  const {
    setLoading,
    setSourceUrl,
    openRouterKey,
    telegramBotToken,
    channelId,
    isLoading, // Destructure isLoading
    
    // Chunk-related state and setters
    textChunks,
    currentChunkIndex,
    generatedChunks,
    parsedText, // This now reflects the content of textChunks[currentChunkIndex]
    generatedPost, // This now reflects the content of generatedChunks[currentChunkIndex].post
    generatedImageUrl, // This now reflects the content of generatedChunks[currentChunkIndex].imageUrl

    setTextChunks,
    setCurrentChunkIndex,
    setGeneratedChunkContent,
  } = useAppStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for settings panel visibility

  const CHUNK_SIZE = 5000; // Drastically reduced chunk size for debugging

  const handleRegenerate = async () => { // Removed 'text' parameter as it will use current chunk
    const currentTextChunk = textChunks[currentChunkIndex];

    if (!currentTextChunk) {
      toast.error('Нет контента в текущем сегменте для генерации поста.');
      return;
    }
    if (!openRouterKey) {
      toast.error('Введите OpenRouter API ключ в настройках.');
      setLoading(false); // Stop loading if key is missing
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Генерация поста для сегмента ${currentChunkIndex + 1}...`);

    console.log('Sending text chunk to AI. Length:', currentTextChunk.length); // Debugging log

    try {
      const { post, imagePrompt } = await generatePostText(openRouterKey, currentTextChunk);
      const imageUrl = generateImageUrl(imagePrompt);
      setGeneratedChunkContent(currentChunkIndex, post, imageUrl); // Store generated content for this chunk
      toast.success(`Пост для сегмента ${currentChunkIndex + 1} успешно сгенерирован!`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(`Ошибка генерации: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchArticle = async (url: string) => {
    setLoading(true);
    setSourceUrl(url);
    const toastId = toast.loading('Идет загрузка и обработка контента...');

    try {
      const markdown = await fetchContentFromUrl(url);
      console.log('Fetched markdown length:', markdown.length); // Debugging log
      
      // Simple chunking logic: split into chunks of CHUNK_SIZE
      const chunks: string[] = [];
      for (let i = 0; i < markdown.length; i += CHUNK_SIZE) {
        chunks.push(markdown.substring(i, i + CHUNK_SIZE));
      }
      console.log('Number of chunks created:', chunks.length); // Debugging log
      
      setTextChunks(chunks); // Set all chunks in the store
      
      if (chunks.length > 0) {
        if (chunks.length > 1) {
          toast(`Контент разбит на ${chunks.length} сегментов. Сейчас отображается первый.`);
        }
      } else {
        toast('Контент не найден или пуст.');
      }
      
      toast.success('Контент успешно загружен!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(`Не удалось загрузить контент: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClick = () => {
    const currentTextChunk = textChunks[currentChunkIndex];
    if (currentTextChunk) {
      handleRegenerate();
    } else {
      toast.error('Нет контента в текущем сегменте для генерации поста.');
    }
  };

  const handlePublish = async () => {
    const currentGenerated = generatedChunks[currentChunkIndex];
    if (!currentGenerated || !currentGenerated.post || !currentGenerated.imageUrl) {
      toast.error('Нет сгенерированного контента для публикации в текущем сегменте.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading(`Публикация сегмента ${currentChunkIndex + 1} в Telegram...`);
    try {
      await sendPostToTelegram({
        botToken: telegramBotToken,
        chatId: channelId,
        photoUrl: currentGenerated.imageUrl,
        caption: currentGenerated.post,
      });
      toast.success(`Пост для сегмента ${currentChunkIndex + 1} успешно опубликован!`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(`Ошибка публикации: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousChunk = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex(currentChunkIndex - 1);
      toast(`Переключение на сегмент ${currentChunkIndex}.`); // Adjusted toast message
    } else {
      toast('Это первый сегмент.');
    }
  };

  const handleNextChunk = () => {
    if (currentChunkIndex < textChunks.length - 1) {
      setCurrentChunkIndex(currentChunkIndex + 1);
      toast(`Переключение на сегмент ${currentChunkIndex + 2}.`); // Adjusted toast message
    } else {
      toast('Это последний сегмент.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-2 sm:p-4 font-sans text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8 max-w-screen-lg mx-auto">
        {/* Removed aside element for SettingsPanel */}

        <main className="w-full lg:flex-1 flex flex-col gap-4">
          <InputSection onFetchArticle={handleFetchArticle} onGeneratePost={handleGenerateClick} />
          <EditorSection
            onRegenerate={handleRegenerate}
            onPublish={handlePublish}
            onNextChunk={handleNextChunk}
            onPreviousChunk={handlePreviousChunk}
            currentChunkIndex={currentChunkIndex}
            totalChunks={textChunks.length}
            currentParsedText={parsedText}
            currentGeneratedPost={generatedPost}
            currentGeneratedImageUrl={generatedImageUrl}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* Collapsible Settings Panel at the bottom */}
      <div className="max-w-screen-lg mx-auto mt-4 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-t-xl text-white font-bold text-lg hover:bg-gray-700 transition-colors"
        >
          <span>Настройки</span>
          {isSettingsOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isSettingsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 border-t border-gray-700">
            <SettingsPanel />
          </div>
        </div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
          },
        }}
      />
    </div>
  );
}

export default App;
