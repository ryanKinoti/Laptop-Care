import {create} from 'zustand'
import {devtools} from 'zustand/middleware'
import {getServiceListAction, getServiceCategoriesAction} from '@/lib/actions/service'
import type {ServiceListItem, ServiceFilters, CategoryWithServices} from '@/lib/prisma/service'

interface ServicesState {
    // Data
    services: ServiceListItem[]
    categories: CategoryWithServices[]
    total: number
    currentPage: number

    // UI State
    loading: boolean
    error: string | null
    filters: ServiceFilters
    viewMode: 'grid' | 'list'

    // Modal State
    selectedServiceId: string | null
    isModalOpen: boolean

    // Constants
    servicesPerPage: number
}

interface ServicesActions {
    // Data Actions
    loadServices: (page?: number) => Promise<void>
    loadCategories: () => Promise<void>

    // Filter Actions
    setFilters: (filters: ServiceFilters) => void
    resetFilters: () => void

    // UI Actions
    setViewMode: (mode: 'grid' | 'list') => void
    setCurrentPage: (page: number) => void

    // Modal Actions
    openModal: (serviceId: string) => void
    closeModal: () => void

    // Utility Actions
    retry: () => void
    reset: () => void
}

type ServicesStore = ServicesState & ServicesActions

const SERVICES_PER_PAGE = 6

const initialState: ServicesState = {
    // Data
    services: [],
    categories: [],
    total: 0,
    currentPage: 1,

    // UI State
    loading: true,
    error: null,
    filters: {isActive: true},
    viewMode: 'grid',

    // Modal State
    selectedServiceId: null,
    isModalOpen: false,

    // Constants
    servicesPerPage: SERVICES_PER_PAGE,
}

export const useServicesStore = create<ServicesStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Data Actions
            loadServices: async (page?: number) => {
                const state = get()
                const targetPage = page ?? state.currentPage

                try {
                    // Set loading and update page immediately for UI responsiveness
                    set({loading: true, error: null, currentPage: targetPage})

                    const result = await getServiceListAction(
                        state.filters,
                        targetPage,
                        SERVICES_PER_PAGE
                    )

                    if (result.success && result.data) {
                        const {services, total} = result.data
                        set({
                            services,
                            total,
                            currentPage: targetPage,
                            loading: false,
                            error: null,
                        })
                    } else {
                        set({
                            loading: false,
                            error: result.error || 'Failed to load services',
                        })
                    }
                } catch (error) {
                    console.error('Load services error:', error)
                    set({
                        loading: false,
                        error: 'An unexpected error occurred',
                    })
                }
            },

            loadCategories: async () => {
                try {
                    const result = await getServiceCategoriesAction()
                    if (result.success && result.data) {
                        set({categories: result.data})
                    }
                } catch (error) {
                    console.error('Load categories error:', error)
                }
            },

            // Filter Actions
            setFilters: (filters: ServiceFilters) => {
                set({filters, currentPage: 1})
                // Auto-reload services with new filters
                get().loadServices(1)
            },

            resetFilters: () => {
                const defaultFilters: ServiceFilters = {isActive: true}
                set({filters: defaultFilters, currentPage: 1})
                get().loadServices(1)
            },

            // UI Actions
            setViewMode: (mode: 'grid' | 'list') => {
                set({viewMode: mode})
            },

            setCurrentPage: (page: number) => {
                if (page !== get().currentPage && page >= 1) {
                    get().loadServices(page)
                }
            },

            // Modal Actions
            openModal: (serviceId: string) => {
                set({
                    selectedServiceId: serviceId,
                    isModalOpen: true,
                })
            },

            closeModal: () => {
                set({
                    selectedServiceId: null,
                    isModalOpen: false,
                })
            },

            // Utility Actions
            retry: () => {
                const state = get()
                get().loadServices(state.currentPage)
            },

            reset: () => {
                set(initialState)
            },
        }),
        {
            name: 'services-store',
        }
    )
)