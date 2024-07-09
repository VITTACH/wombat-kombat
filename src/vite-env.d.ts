/// <reference types="vite/client" />
interface Window {
    Telegram: {
        WebApp: {
            initDataUnsafe: {
                user?: {
                    username?: string;
                };
            };
            ready: () => void;
            expand: () => void;
        };
    };
}