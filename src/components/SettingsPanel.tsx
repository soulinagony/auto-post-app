import { useAppStore } from '../store/useAppStore';
import { KeyRound, Bot, Hash } from 'lucide-react';

export const SettingsPanel = () => {
  const { openRouterKey, telegramBotToken, channelId, setKeys } = useAppStore();

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeys({ [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Настройки</h2>
      <div className="space-y-4">
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <input
            type="password"
            name="openRouterKey"
            value={openRouterKey}
            onChange={handleKeyChange}
            placeholder="OpenRouter API Key"
            className="w-full bg-black/30 text-white rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-telegramBlue-500"
          />
        </div>
        <div className="relative">
          <Bot className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <input
            type="password"
            name="telegramBotToken"
            value={telegramBotToken}
            onChange={handleKeyChange}
            placeholder="Telegram Bot Token"
            className="w-full bg-black/30 text-white rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-telegramBlue-500"
          />
        </div>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            name="channelId"
            value={channelId}
            onChange={handleKeyChange}
            placeholder="Telegram Channel ID (e.g., @mychannel)"
            className="w-full bg-black/30 text-white rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-telegramBlue-500"
          />
        </div>
      </div>
    </div>
  );
};
