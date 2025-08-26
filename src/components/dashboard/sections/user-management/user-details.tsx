'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { getUserWithProfileAction, toggleUserStatusAction } from '@/lib/actions/user'
import { UserWithProfile } from '@/lib/prisma/user'
import { useAuthStore } from '@/stores/auth-store'
import { useDashboardStore } from '@/stores/dashboard-store'
import { ArrowLeft, Mail, Phone, User, Building, MapPin, FileText, Shield, Calendar, Edit, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react'
import { EditUserModal } from './edit-user-modal'

interface UserDetailsProps {
    userId: string
    onBack: () => void
}

export function UserDetails({ userId, onBack }: UserDetailsProps) {
    const [user, setUser] = useState<UserWithProfile | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)
    
    // Use centralized loading states
    const loading = useDashboardStore(state => state.userDetailsLoading)
    const refreshing = useDashboardStore(state => state.userDetailsRefreshing)
    const setLoading = useDashboardStore(state => state.setUserDetailsLoading)
    const setRefreshing = useDashboardStore(state => state.setUserDetailsRefreshing)
    const refreshUserData = useDashboardStore(state => state.refreshUserData)
    const refreshUserStats = useDashboardStore(state => state.refreshUserStats)
    
    // Use existing auth store permissions
    const currentUser = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)
    const canAccess = useAuthStore(state => state.canAccess)
    
    // Use centralized auth logic instead of duplicating permission checks
    const canEdit = canAccess('userManagement') && (
        currentUser?.staffRole === 'ADMINISTRATOR' || 
        currentRole === 'admin' || 
        currentRole === 'superuser' ||
        (currentUser?.staffRole === 'RECEPTIONIST' && !user?.isStaff) ||
        (currentUser?.staffRole === 'TECHNICIAN' && !user?.isStaff)
    )

    const canToggleStatus = canAccess('userManagement') && (
        currentUser?.staffRole === 'ADMINISTRATOR' || 
        currentRole === 'admin' || 
        currentRole === 'superuser'
    )

    const fetchUser = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }
            setError(null)
            
            const result = await getUserWithProfileAction(userId)
            if (result.success && result.data) {
                setUser(result.data)
            } else {
                setError(result.error || 'Failed to load user details')
            }
        } catch (err) {
            setError('Failed to load user details')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        fetchUser(true)
    }

    useEffect(() => {
        fetchUser()
    }, [userId])

    const handleToggleStatus = async () => {
        if (!user) return
        
        try {
            const result = await toggleUserStatusAction(user.id)
            if (result.success) {
                fetchUser(true) // Refresh user data with refresh indicator
                // Refresh related data in other components
                refreshUserData()
                refreshUserStats()
            } else {
                setError(result.error || 'Failed to toggle user status')
            }
        } catch (err) {
            setError('Failed to toggle user status')
        }
    }

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'Not set'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getRoleBadge = (user: UserWithProfile) => {
        if (user.isStaff && user.staffProfile) {
            const roleColors = {
                ADMINISTRATOR: 'bg-red-50 text-red-700 border-red-200',
                TECHNICIAN: 'bg-blue-50 text-blue-700 border-blue-200',
                RECEPTIONIST: 'bg-green-50 text-green-700 border-green-200'
            }
            return (
                <Badge variant="outline" className={roleColors[user.staffProfile.role]}>
                    {user.staffProfile.role}
                </Badge>
            )
        } else if (user.customerProfile) {
            return (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {user.customerProfile.role === 'COMPANY' ? 'Business Customer' : 'Individual Customer'}
                </Badge>
            )
        }
        return <Badge variant="outline">Unknown</Badge>
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-destructive">
                            <p>{error || 'User not found'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Users
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name || 'No Name'}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(user)}
                            <Badge variant={user.isActive ? "outline" : "destructive"}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    
                    {canToggleStatus && (
                        <Button variant="outline" onClick={handleToggleStatus}>
                            {user.isActive ? (
                                <>
                                    <ToggleLeft className="mr-2 h-4 w-4" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <ToggleRight className="mr-2 h-4 w-4" />
                                    Activate
                                </>
                            )}
                        </Button>
                    )}
                    
                    {canEdit && (
                        <EditUserModal 
                            user={user}
                            open={editModalOpen}
                            onOpenChange={setEditModalOpen}
                            onSuccess={() => {
                                fetchUser(true)
                                refreshUserData()
                                refreshUserStats()
                            }}
                        >
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </EditUserModal>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Email:</span>
                            <span>{user.email}</span>
                        </div>
                        
                        {user.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Phone:</span>
                                <span>{user.phone}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Preferred Contact:</span>
                            <Badge variant="outline">
                                {user.preferredContact.toString().toLowerCase()}
                            </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Created:</span>
                            <span>{formatDate(user.createdAt)}</span>
                        </div>
                        
                        {user.updatedAt && user.updatedAt !== user.createdAt && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Updated:</span>
                                <span>{formatDate(user.updatedAt)}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {user.isStaff ? (
                                <Shield className="h-5 w-5" />
                            ) : (
                                <Building className="h-5 w-5" />
                            )}
                            {user.isStaff ? 'Staff Profile' : 'Customer Profile'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.staffProfile && (
                            <>
                                <div>
                                    <span className="font-medium">Role:</span>
                                    <p className="text-muted-foreground">{user.staffProfile.role}</p>
                                </div>
                                
                                {Array.isArray(user.staffProfile.specializations) && user.staffProfile.specializations.length > 0 && (
                                    <div>
                                        <span className="font-medium">Specializations:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {user.staffProfile.specializations.map((spec, index: number) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {String(spec)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <span className="font-medium">Super User:</span>
                                    <Badge variant={user.isSuperuser ? "default" : "outline"} className="ml-2">
                                        {user.isSuperuser ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </>
                        )}

                        {user.customerProfile && (
                            <>
                                <div>
                                    <span className="font-medium">Customer Type:</span>
                                    <p className="text-muted-foreground">
                                        {user.customerProfile.role === 'COMPANY' ? 'Business' : 'Individual'}
                                    </p>
                                </div>
                                
                                {user.customerProfile.companyName && (
                                    <div className="flex items-start gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <span className="font-medium">Company:</span>
                                            <p className="text-muted-foreground">{user.customerProfile.companyName}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {user.customerProfile.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <span className="font-medium">Address:</span>
                                            <p className="text-muted-foreground">{user.customerProfile.address}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {user.customerProfile.notes && (
                                    <div className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <span className="font-medium">Notes:</span>
                                            <p className="text-muted-foreground">{user.customerProfile.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}