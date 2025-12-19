import { create } from 'zustand'
type Store = {
    showDetail: boolean;
    setShowDetail: (status: boolean) => void;
};

const useShowDetailStore = create<Store>((set) => ({
    showDetail: false,
    setShowDetail: (status: boolean) => set({ showDetail: status }),
}));

export default useShowDetailStore;