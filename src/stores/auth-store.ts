import {create} from 'zustand'
import {devtools} from 'zustand/middleware'
import {useSession} from 'next-auth/react'
import type {Session} from 'next-auth'
import React from 'react'

// Extended user type with only the ADDITIONAL role information we're adding to session
// NextAuth already provides id, name, email, image through DefaultSession["user"]
export interface AuthUser {
    // Only our custom fields beyond what NextAuth provides
    isStaff: boolean
    isSuperuser: boolean
    isActive: boolean
    
    // Role information (only present when applicable)
    staffRole?: 'ADMINISTRATOR' | 'TECHNICIAN' | 'RECEPTIONIST'
    customerRole?: 'INDIVIDUAL' | 'COMPANY'
}

// Permission levels based on your role hierarchy
export type PermissionLevel = 'guest' | 'customer' | 'staff' | 'admin' | 'superuser'

// Role-based access control configuration
export interface RoleConfig {
    level: PermissionLevel
    permissions: string[]
    canAccess: {
        dashboard: boolean
        adminPanel: boolean
        staffTools: boolean
        customerOrders: boolean
        userManagement: boolean
        serviceManagement: boolean
        reporting: boolean
    }
}

// Authentication state interface
interface AuthState {
    // Session data
    user: AuthUser | null
    session: Session | null
    status: 'loading' | 'authenticated' | 'unauthenticated'
    
    // Role and permission data
    currentRole: PermissionLevel
    permissions: string[]
    roleConfig: RoleConfig | null
    
    // UI state
    isInitialized: boolean
    lastActivity: Date | null
    
    // Error handling
    error: string | null
}

// Authentication actions interface
interface AuthActions {
    // Session management
    setSession: (session: Session | null, status: AuthState['status']) => void
    clearSession: () => void
    updateLastActivity: () => void
    
    // Role and permission methods
    hasPermission: (permission: string) => boolean
    hasAnyPermission: (permissions: string[]) => boolean
    hasRole: (role: PermissionLevel) => boolean
    canAccess: (resource: keyof RoleConfig['canAccess']) => boolean
    
    // Utility methods
    isAuthenticated: () => boolean
    isStaff: () => boolean
    isAdmin: () => boolean
    isSuperuser: () => boolean
    isCustomer: () => boolean
    
    // Error handling
    setError: (error: string | null) => void
    clearError: () => void
    
    // Initialization
    initialize: () => void
    reset: () => void
}

type AuthStore = AuthState & AuthActions

// Role configuration mapping
const ROLE_CONFIGS: Record<PermissionLevel, RoleConfig> = {
    guest: {
        level: 'guest',
        permissions: ['view:public'],
        canAccess: {
            dashboard: false,
            adminPanel: false,
            staffTools: false,
            customerOrders: false,
            userManagement: false,
            serviceManagement: false,
            reporting: false,
        }
    },
    customer: {
        level: 'customer',
        permissions: ['view:public', 'view:services', 'create:order', 'view:own_orders', 'update:own_profile'],
        canAccess: {
            dashboard: true,
            adminPanel: false,
            staffTools: false,
            customerOrders: true,
            userManagement: false,
            serviceManagement: false,
            reporting: false,
        }
    },
    staff: {
        level: 'staff',
        permissions: [
            'view:public', 'view:services', 'view:orders', 'update:orders', 
            'view:customers', 'create:service_notes', 'view:staff_dashboard'
        ],
        canAccess: {
            dashboard: true,
            adminPanel: false,
            staffTools: true,
            customerOrders: true,
            userManagement: false,
            serviceManagement: true,
            reporting: false,
        }
    },
    admin: {
        level: 'admin',
        permissions: [
            'view:public', 'view:services', 'view:orders', 'update:orders', 'delete:orders',
            'view:customers', 'create:customers', 'update:customers', 'view:staff',
            'create:services', 'update:services', 'delete:services', 'view:admin_panel',
            'create:service_notes', 'view:staff_dashboard', 'view:reports'
        ],
        canAccess: {
            dashboard: true,
            adminPanel: true,
            staffTools: true,
            customerOrders: true,
            userManagement: true,
            serviceManagement: true,
            reporting: true,
        }
    },
    superuser: {
        level: 'superuser',
        permissions: ['*'], // All permissions
        canAccess: {
            dashboard: true,
            adminPanel: true,
            staffTools: true,
            customerOrders: true,
            userManagement: true,
            serviceManagement: true,
            reporting: true,
        }
    }
}

// Helper function to determine user role level
const getUserRoleLevel = (user: AuthUser | null): PermissionLevel => {
    if (!user) return 'guest'
    
    if (user.isSuperuser && user.staffRole === 'ADMINISTRATOR') {
        return 'superuser'
    }
    
    if (user.isStaff && user.staffRole === 'ADMINISTRATOR') {
        return 'admin'
    }
    
    if (user.isStaff) {
        return 'staff'
    }
    
    return 'customer'
}

// Helper function to extract only our additional user data from the current session.
// NextAuth session already provides id, name, email, image
const extractUserFromSession = (session: Session | null): AuthUser | null => {
    if (!session?.user) return null
    
    const sessionUser = session.user as any
    
    return {
        // Only extract our custom fields
        isStaff: sessionUser.isStaff || false,
        isSuperuser: sessionUser.isSuperuser || false,
        isActive: sessionUser.isActive ?? true,
        
        // Role information
        staffRole: sessionUser.staffRole,
        customerRole: sessionUser.customerRole,
    }
}

const initialState: AuthState = {
    user: null,
    session: null,
    status: 'loading',
    currentRole: 'guest',
    permissions: [],
    roleConfig: null,
    isInitialized: false,
    lastActivity: null,
    error: null,
}

export const useAuthStore = create<AuthStore>()(
    devtools(
        (set, get) => ({
            ...initialState,
            
            // Session management
            setSession: (session: Session | null, status: AuthState['status']) => {
                const user = extractUserFromSession(session)
                const currentRole = getUserRoleLevel(user)
                const roleConfig = ROLE_CONFIGS[currentRole]
                
                set({
                    session,
                    user,
                    status,
                    currentRole,
                    roleConfig,
                    permissions: roleConfig.permissions,
                    isInitialized: true,
                    lastActivity: new Date(),
                    error: null,
                })
            },
            
            clearSession: () => {
                set({
                    ...initialState,
                    status: 'unauthenticated',
                    currentRole: 'guest',
                    roleConfig: ROLE_CONFIGS.guest,
                    permissions: ROLE_CONFIGS.guest.permissions,
                    isInitialized: true,
                })
            },
            
            updateLastActivity: () => {
                set({ lastActivity: new Date() })
            },
            
            // Permission checks
            hasPermission: (permission: string) => {
                const state = get()
                if (state.permissions.includes('*')) return true
                return state.permissions.includes(permission)
            },
            
            hasAnyPermission: (permissions: string[]) => {
                const state = get()
                if (state.permissions.includes('*')) return true
                return permissions.some(permission => state.permissions.includes(permission))
            },
            
            hasRole: (role: PermissionLevel) => {
                const state = get()
                const roleLevels: PermissionLevel[] = ['guest', 'customer', 'staff', 'admin', 'superuser']
                const currentLevel = roleLevels.indexOf(state.currentRole)
                const requiredLevel = roleLevels.indexOf(role)
                return currentLevel >= requiredLevel
            },
            
            canAccess: (resource: keyof RoleConfig['canAccess']) => {
                const state = get()
                return state.roleConfig?.canAccess[resource] || false
            },
            
            // Utility methods
            isAuthenticated: () => {
                const state = get()
                return state.status === 'authenticated' && !!state.user
            },
            
            isStaff: () => {
                const state = get()
                return state.user?.isStaff || false
            },
            
            isAdmin: () => {
                const state = get()
                return ['admin', 'superuser'].includes(state.currentRole)
            },
            
            isSuperuser: () => {
                const state = get()
                return state.currentRole === 'superuser'
            },
            
            isCustomer: () => {
                const state = get()
                return state.currentRole === 'customer'
            },
            
            // Error handling
            setError: (error: string | null) => {
                set({ error })
            },
            
            clearError: () => {
                set({ error: null })
            },
            
            // Initialization
            initialize: () => {
                set({ isInitialized: true })
            },
            
            reset: () => {
                set(initialState)
            },
        }),
        {
            name: 'auth-store',
        }
    )
)

// Custom hook that syncs NextAuth session with Zustand store
export const useAuthSync = () => {
    const { data: session, status } = useSession()
    const setSession = useAuthStore(state => state.setSession)
    const clearSession = useAuthStore(state => state.clearSession)
    const updateLastActivity = useAuthStore(state => state.updateLastActivity)
    const isInitialized = useAuthStore(state => state.isInitialized)
    
    // Sync session changes
    React.useEffect(() => {
        if (status === 'loading') return
        
        if (session) {
            setSession(session, 'authenticated')
        } else {
            clearSession()
        }
    }, [session, status, setSession, clearSession])
    
    // Update activity tracking on user interaction
    React.useEffect(() => {
        const handleActivity = () => {
            if (session) {
                updateLastActivity()
            }
        }
        
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
        events.forEach(event => {
            document.addEventListener(event, handleActivity, true)
        })
        
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true)
            })
        }
    }, [session, updateLastActivity])
    
    return { isInitialized, status }
}

// Export permission constants for easy access
export const PERMISSIONS = {
    // Public permissions
    VIEW_PUBLIC: 'view:public',
    
    // Service permissions
    VIEW_SERVICES: 'view:services',
    CREATE_SERVICES: 'create:services',
    UPDATE_SERVICES: 'update:services',
    DELETE_SERVICES: 'delete:services',
    
    // Order permissions
    VIEW_ORDERS: 'view:orders',
    CREATE_ORDER: 'create:order',
    UPDATE_ORDERS: 'update:orders',
    DELETE_ORDERS: 'delete:orders',
    VIEW_OWN_ORDERS: 'view:own_orders',
    
    // User permissions
    VIEW_CUSTOMERS: 'view:customers',
    CREATE_CUSTOMERS: 'create:customers',
    UPDATE_CUSTOMERS: 'update:customers',
    VIEW_STAFF: 'view:staff',
    
    // Profile permissions
    UPDATE_OWN_PROFILE: 'update:own_profile',
    
    // Admin permissions
    VIEW_ADMIN_PANEL: 'view:admin_panel',
    VIEW_STAFF_DASHBOARD: 'view:staff_dashboard',
    CREATE_SERVICE_NOTES: 'create:service_notes',
    VIEW_REPORTS: 'view:reports',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]