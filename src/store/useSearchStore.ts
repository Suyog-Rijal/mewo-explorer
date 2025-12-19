import { create } from 'zustand'
type Store = {
    searchKeyword: string;
    searchPath: string;
    setSearchKeyword: (newKeyword: string) => void;
    setSearchPath: (newPath: string) => void;
};

const useSearchStore = create<Store>((set) => ({
    searchKeyword: '',
    searchPath: '',
    setSearchKeyword: (newKeyword: string) => set({ searchKeyword: newKeyword }),
    setSearchPath: (newPath: string) => set({ searchPath: newPath }),
}));

export default useSearchStore;