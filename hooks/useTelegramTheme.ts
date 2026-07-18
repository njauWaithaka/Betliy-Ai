import { useEffect } from "react";

export function useTelegramTheme() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();

    // Match Telegram's native header to the UI
    tg.setHeaderColor("#081122");
    tg.setBackgroundColor("#081122");
  }, []);
}
