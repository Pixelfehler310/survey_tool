import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'light', // default to light, or we could detect system preference
            toggleTheme: () => set((state) => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(newTheme);
                return { theme: newTheme };
            }),
            setTheme: (theme) => {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
                set({ theme });
            },
            initTheme: () => {
                const theme = useThemeStore.getState().theme;
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
            }
        }),
        {
            name: 'theme-storage',
        }
    )
);

export default useThemeStore;
