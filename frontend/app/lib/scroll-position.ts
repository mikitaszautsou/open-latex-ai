const SCROLL_POSITION_KEY = 'chat_scroll_positions';

export const saveScrollPosition = (chatId: string, position: number) => {
  const positions = JSON.parse(localStorage.getItem(SCROLL_POSITION_KEY) || '{}');
  positions[chatId] = position;
  localStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(positions));
};

export const getScrollPosition = (chatId: string): number => {
  const positions = JSON.parse(localStorage.getItem(SCROLL_POSITION_KEY) || '{}');
  return positions[chatId] || 0;
};