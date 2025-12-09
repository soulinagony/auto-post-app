import { useState } from 'react';
import { Link, LoaderCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface InputSectionProps {
  onFetchArticle: (url: string) => void;
  onGeneratePost: () => void;
}

export const InputSection = ({ onFetchArticle, onGeneratePost }: InputSectionProps) => {
  const [url, setUrl] = useState('');
  const { isLoading, parsedText } = useAppStore((state) => ({
    isLoading: state.isLoading,
    parsedText: state.parsedText,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onFetchArticle(url);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Источник Контента</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative flex items-center">
          <Link className="absolute left-3 text-white/50" size={20} />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full bg-black/30 text-white rounded-l-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-telegramBlue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-telegramBlue-600 hover:bg-telegramBlue-700 disabled:bg-telegramBlue-900/50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-r-md transition-colors duration-300 flex items-center justify-center"
            disabled={isLoading || !url}
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" size={24} />
            ) : (
              'Загрузить'
            )}
          </button>
        </div>
      </form>
      <button
        onClick={onGeneratePost}
        className="w-full bg-telegramBlue-600 hover:bg-telegramBlue-700 disabled:bg-telegramBlue-900/50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md transition-colors duration-300 flex items-center justify-center"
        disabled={isLoading || !parsedText}
      >
        {isLoading ? (
          <LoaderCircle className="animate-spin mr-2" size={20} />
        ) : null}
        Сгенерировать Пост
      </button>
    </div>
  );
};
