import { create } from 'zustand'
type Store = {
    path: string;
    setPath: (newPath: string) => void;
};

const usePathStore = create<Store>((set) => ({
    path: '',
    setPath: (newPath: string) => set({ path: newPath }),
}));

export default usePathStore;