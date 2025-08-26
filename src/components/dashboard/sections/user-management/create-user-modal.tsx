'use client'

import { useState } from 'react'
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
import { createUserAction } from '@/lib/actions/user'
import { useAuthStore } from '@/stores/auth-store'
import { StaffRole, CustomerRole } from '@prisma/client'
import { Loader2 } from 'lucide-react'

interface CreateUserModalProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateUserModal({ children, open, onOpenChange, onSuccess }: CreateUserModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        isStaff: false,
        staffRole: '' as StaffRole | '',
        customerRole: 'INDIVIDUAL' as CustomerRole,
        companyName: '',
        address: '',
        notes: ''
    })

    const user = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)
    
    const canCreateStaff = user?.staffRole === 'ADMINISTRATOR' || 
                          currentRole === 'admin' || 
                          currentRole === 'superuser'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return

        try {
            setLoading(true)
            setError(null)

            // Validate required fields
            if (!formData.email.trim()) {
                throw new Error('Email is required')
            }
            if (!formData.name.trim()) {
                throw new Error('Name is required')
            }
            if (formData.isStaff && !formData.staffRole) {
                throw new Error('Staff role is required for staff users')
            }

            const userData = {
                email: formData.email.trim(),
                name: formData.name.trim(),
                phone: formData.phone.trim() || undefined,
                isStaff: formData.isStaff,
                staffRole: formData.isStaff ? formData.staffRole as StaffRole : undefined,
                customerRole: !formData.isStaff ? formData.customerRole : undefined,
                companyName: !formData.isStaff && formData.customerRole === 'COMPANY' 
                    ? formData.companyName.trim() || undefined : undefined,
                address: !formData.isStaff ? formData.address.trim() || undefined : undefined,
                notes: !formData.isStaff ? formData.notes.trim() || undefined : undefined,
            }

            const result = await createUserAction(userData)

            if (result.success) {
                // Reset form
                setFormData({
                    email: '',
                    name: '',
                    phone: '',
                    isStaff: false,
                    staffRole: '',
                    customerRole: 'INDIVIDUAL',
                    companyName: '',
                    address: '',
                    notes: ''
                })
                
                onSuccess?.()
                onOpenChange?.(false)
            } else {
                setError(result.error || 'Failed to create user')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create user')
        } finally {
            setLoading(false)
        }
    }

    const handleAccountTypeChange = (value: string) => {
        const isStaff = value === 'staff'
        setFormData(prev => ({
            ...prev,
            isStaff,
            staffRole: isStaff ? prev.staffRole : '',
            customerRole: isStaff ? 'INDIVIDUAL' : prev.customerRole
        }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Add a new user to the system. Fill in the required information below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

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

                    <div className="space-y-2">
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select value={formData.isStaff ? 'staff' : 'customer'} onValueChange={handleAccountTypeChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                {canCreateStaff && <SelectItem value="staff">Staff</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.isStaff && (
                        <div className="space-y-2">
                            <Label htmlFor="staffRole">Staff Role *</Label>
                            <Select value={formData.staffRole} onValueChange={(value) => 
                                setFormData(prev => ({ ...prev, staffRole: value as StaffRole }))
                            }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                                    <SelectItem value="TECHNICIAN">Technician</SelectItem>
                                    {canCreateStaff && <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {!formData.isStaff && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="customerRole">Customer Type</Label>
                                <Select value={formData.customerRole} onValueChange={(value) => 
                                    setFormData(prev => ({ ...prev, customerRole: value as CustomerRole }))
                                }>
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
                            Create User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}