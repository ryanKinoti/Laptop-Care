'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { updateUserAction } from '@/lib/actions/user'
import { UserWithProfile } from '@/lib/prisma/user'
import { useAuthStore } from '@/stores/auth-store'
import { StaffRole, CustomerRole } from '@prisma/client'
import { Loader2 } from 'lucide-react'

interface EditUserModalProps {
    user: UserWithProfile
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function EditUserModal({ user, children, open, onOpenChange, onSuccess }: EditUserModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.phone || '',
        isActive: user.isActive,
        staffRole: user.staffProfile?.role || '',
        customerRole: user.customerProfile?.role || 'INDIVIDUAL',
        companyName: user.customerProfile?.companyName || '',
        address: user.customerProfile?.address || '',
        notes: user.customerProfile?.notes || ''
    })

    const currentUser = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)
    
    const canEditStaffRole = currentUser?.staffRole === 'ADMINISTRATOR' || 
                            currentRole === 'admin' || 
                            currentRole === 'superuser'
    
    const canEditStatus = currentUser?.staffRole === 'ADMINISTRATOR' || 
                         currentRole === 'admin' || 
                         currentRole === 'superuser'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return

        try {
            setLoading(true)
            setError(null)

            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Name is required')
            }

            const updateData: {
                name?: string
                phone?: string
                isActive?: boolean
                staffRole?: StaffRole
                customerRole?: CustomerRole
                companyName?: string
                address?: string
                notes?: string
            } = {
                name: formData.name.trim(),
                phone: formData.phone.trim() || undefined,
            }

            // Only include fields that the current user can edit
            if (canEditStatus) {
                updateData.isActive = formData.isActive
            }

            if (user.staffProfile && canEditStaffRole) {
                updateData.staffRole = formData.staffRole as StaffRole
            }

            if (user.customerProfile) {
                updateData.customerRole = formData.customerRole as CustomerRole
                updateData.companyName = formData.customerRole === 'COMPANY' 
                    ? formData.companyName.trim() || undefined 
                    : undefined
                updateData.address = formData.address.trim() || undefined
                updateData.notes = formData.notes.trim() || undefined
            }

            const result = await updateUserAction(user.id, updateData)

            if (result.success) {
                onSuccess?.()
                onOpenChange?.(false)
            } else {
                setError(result.error || 'Failed to update user')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user information. Only editable fields are shown based on your permissions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    {canEditStatus && (
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select 
                                value={formData.isActive ? 'active' : 'inactive'} 
                                onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'active' }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {user.staffProfile && canEditStaffRole && (
                        <div className="space-y-2">
                            <Label htmlFor="staffRole">Staff Role</Label>
                            <Select 
                                value={formData.staffRole} 
                                onValueChange={(value) => setFormData(prev => ({ ...prev, staffRole: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                                    <SelectItem value="TECHNICIAN">Technician</SelectItem>
                                    <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {user.customerProfile && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="customerRole">Customer Type</Label>
                                <Select 
                                    value={formData.customerRole} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, customerRole: value as CustomerRole }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                        <SelectItem value="COMPANY">Company</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.customerRole === 'COMPANY' && (
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                        placeholder="Acme Corporation"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="123 Main St, City, State 12345"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional notes about this customer..."
                                />
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}