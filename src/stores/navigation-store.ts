import {create} from 'zustand'

interface NavigationState {
    isMobile: boolean
    isMenuOpen: boolean
    setIsMobile: (isMobile: boolean) => void
    setIsMenuOpen: (isOpen: boolean) => void
    toggleMenu: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
    isMobile: false,
    isMenuOpen: false,
    setIsMobile: (isMobile) => set({isMobile}),
    setIsMenuOpen: (isOpen) => set({isMenuOpen: isOpen}),
    toggleMenu: () => set((state) => ({isMenuOpen: !state.isMenuOpen})),
}))