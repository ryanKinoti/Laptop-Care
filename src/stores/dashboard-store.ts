import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type DashboardSection = 'overview' | 'users' | 'services' | 'inventory'
export type UserManagementSection = 'overview' | 'data-table' | 'details'
export type ServiceManagementSection = 'overview' | 'services' | 'categories' | 'service-details' | 'category-details'

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
    
    // Service Management specific states
    serviceManagementSection: ServiceManagementSection
    selectedServiceId: string | null
    selectedServiceCategoryId: string | null
    serviceOverviewLoading: boolean
    servicesLoading: boolean
    servicesRefreshing: boolean
    categoriesLoading: boolean
    categoriesRefreshing: boolean
    serviceDetailsLoading: boolean
    serviceDetailsRefreshing: boolean
    categoryDetailsLoading: boolean
    categoryDetailsRefreshing: boolean
    
    // Data refresh keys for force updates
    userDataRefreshKey: number
    userStatsRefreshKey: number
    serviceDataRefreshKey: number
    serviceStatsRefreshKey: number
    categoryDataRefreshKey: number
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
    
    // Service Management actions
    setServiceManagementSection: (section: ServiceManagementSection) => void
    setSelectedServiceId: (serviceId: string | null) => void
    setSelectedServiceCategoryId: (categoryId: string | null) => void
    setServiceOverviewLoading: (loading: boolean) => void
    setServicesLoading: (loading: boolean) => void
    setServicesRefreshing: (refreshing: boolean) => void
    setCategoriesLoading: (loading: boolean) => void
    setCategoriesRefreshing: (refreshing: boolean) => void
    setServiceDetailsLoading: (loading: boolean) => void
    setServiceDetailsRefreshing: (refreshing: boolean) => void
    setCategoryDetailsLoading: (loading: boolean) => void
    setCategoryDetailsRefreshing: (refreshing: boolean) => void
    
    // Data refresh actions
    refreshUserData: () => void
    refreshUserStats: () => void
    refreshServiceData: () => void
    refreshServiceStats: () => void
    refreshCategoryData: () => void
    
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
    
    // Service Management states
    serviceManagementSection: 'overview',
    selectedServiceId: null,
    selectedServiceCategoryId: null,
    serviceOverviewLoading: false,
    servicesLoading: false,
    servicesRefreshing: false,
    categoriesLoading: false,
    categoriesRefreshing: false,
    serviceDetailsLoading: false,
    serviceDetailsRefreshing: false,
    categoryDetailsLoading: false,
    categoryDetailsRefreshing: false,
    
    // Refresh keys
    userDataRefreshKey: 0,
    userStatsRefreshKey: 0,
    serviceDataRefreshKey: 0,
    serviceStatsRefreshKey: 0,
    categoryDataRefreshKey: 0,
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

            // Service Management actions
            setServiceManagementSection: (section: ServiceManagementSection) => {
                set({ serviceManagementSection: section })
            },

            setSelectedServiceId: (serviceId: string | null) => {
                set({ selectedServiceId: serviceId })
            },

            setSelectedServiceCategoryId: (categoryId: string | null) => {
                set({ selectedServiceCategoryId: categoryId })
            },

            setServiceOverviewLoading: (loading: boolean) => {
                set({ serviceOverviewLoading: loading })
            },

            setServicesLoading: (loading: boolean) => {
                set({ servicesLoading: loading })
            },

            setServicesRefreshing: (refreshing: boolean) => {
                set({ servicesRefreshing: refreshing })
            },

            setCategoriesLoading: (loading: boolean) => {
                set({ categoriesLoading: loading })
            },

            setCategoriesRefreshing: (refreshing: boolean) => {
                set({ categoriesRefreshing: refreshing })
            },

            setServiceDetailsLoading: (loading: boolean) => {
                set({ serviceDetailsLoading: loading })
            },

            setServiceDetailsRefreshing: (refreshing: boolean) => {
                set({ serviceDetailsRefreshing: refreshing })
            },

            setCategoryDetailsLoading: (loading: boolean) => {
                set({ categoryDetailsLoading: loading })
            },

            setCategoryDetailsRefreshing: (refreshing: boolean) => {
                set({ categoryDetailsRefreshing: refreshing })
            },

            // Data refresh actions
            refreshUserData: () => {
                set(state => ({ userDataRefreshKey: state.userDataRefreshKey + 1 }))
            },

            refreshUserStats: () => {
                set(state => ({ userStatsRefreshKey: state.userStatsRefreshKey + 1 }))
            },

            refreshServiceData: () => {
                set(state => ({ serviceDataRefreshKey: state.serviceDataRefreshKey + 1 }))
            },

            refreshServiceStats: () => {
                set(state => ({ serviceStatsRefreshKey: state.serviceStatsRefreshKey + 1 }))
            },

            refreshCategoryData: () => {
                set(state => ({ categoryDataRefreshKey: state.categoryDataRefreshKey + 1 }))
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