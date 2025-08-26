import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type DashboardSection = 'overview' | 'users' | 'services' | 'inventory'
export type UserManagementSection = 'overview' | 'data-table' | 'details'

interface DashboardState {
    activeSection: DashboardSection
    subSection?: string
    selectedItem?: string
    
    // Global loading states
    isLoading: boolean
    error: string | null
    
    // User Management specific states
    userManagementSection: UserManagementSection
    selectedUserId: string | null
    userOverviewLoading: boolean
    userDataTableLoading: boolean
    userDataTableRefreshing: boolean
    userDetailsLoading: boolean
    userDetailsRefreshing: boolean
    
    // Data refresh keys for force updates
    userDataRefreshKey: number
    userStatsRefreshKey: number
}

interface DashboardActions {
    setActiveSection: (section: DashboardSection) => void
    setSubSection: (subSection: string | undefined) => void
    setSelectedItem: (item: string | undefined) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    
    // User Management actions
    setUserManagementSection: (section: UserManagementSection) => void
    setSelectedUserId: (userId: string | null) => void
    setUserOverviewLoading: (loading: boolean) => void
    setUserDataTableLoading: (loading: boolean) => void
    setUserDataTableRefreshing: (refreshing: boolean) => void
    setUserDetailsLoading: (loading: boolean) => void
    setUserDetailsRefreshing: (refreshing: boolean) => void
    
    // Data refresh actions
    refreshUserData: () => void
    refreshUserStats: () => void
    
    reset: () => void
}

type DashboardStore = DashboardState & DashboardActions

const initialState: DashboardState = {
    activeSection: 'overview',
    subSection: undefined,
    selectedItem: undefined,
    isLoading: false,
    error: null,
    
    // User Management states
    userManagementSection: 'overview',
    selectedUserId: null,
    userOverviewLoading: false,
    userDataTableLoading: false,
    userDataTableRefreshing: false,
    userDetailsLoading: false,
    userDetailsRefreshing: false,
    
    // Refresh keys
    userDataRefreshKey: 0,
    userStatsRefreshKey: 0,
}

export const useDashboardStore = create<DashboardStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setActiveSection: (section: DashboardSection) => {
                set({
                    activeSection: section,
                    subSection: undefined,
                    selectedItem: undefined,
                    error: null,
                })
            },

            setSubSection: (subSection: string | undefined) => {
                set({ subSection, selectedItem: undefined })
            },

            setSelectedItem: (item: string | undefined) => {
                set({ selectedItem: item })
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading })
            },

            setError: (error: string | null) => {
                set({ error })
            },

            // User Management actions
            setUserManagementSection: (section: UserManagementSection) => {
                set({ userManagementSection: section })
            },

            setSelectedUserId: (userId: string | null) => {
                set({ selectedUserId: userId })
            },

            setUserOverviewLoading: (loading: boolean) => {
                set({ userOverviewLoading: loading })
            },

            setUserDataTableLoading: (loading: boolean) => {
                set({ userDataTableLoading: loading })
            },

            setUserDataTableRefreshing: (refreshing: boolean) => {
                set({ userDataTableRefreshing: refreshing })
            },

            setUserDetailsLoading: (loading: boolean) => {
                set({ userDetailsLoading: loading })
            },

            setUserDetailsRefreshing: (refreshing: boolean) => {
                set({ userDetailsRefreshing: refreshing })
            },

            // Data refresh actions
            refreshUserData: () => {
                set(state => ({ userDataRefreshKey: state.userDataRefreshKey + 1 }))
            },

            refreshUserStats: () => {
                set(state => ({ userStatsRefreshKey: state.userStatsRefreshKey + 1 }))
            },

            reset: () => {
                set(initialState)
            },
        }),
        {
            name: 'dashboard-store',
        }
    )
)