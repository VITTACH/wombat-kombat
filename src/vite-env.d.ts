/// <reference types="vite/client" />
interface TelegramUser {
    id: string;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

interface TelegramWebApp {
    initDataUnsafe: {
        user?: TelegramUser;
    };
}

interface Window {
    Telegram: {
        WebApp: TelegramWebApp;
    };
}