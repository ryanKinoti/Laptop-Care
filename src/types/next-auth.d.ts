import {DefaultSession, DefaultUser} from "next-auth"
import {StaffRole, CustomerRole} from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: {
            isStaff: boolean
            isSuperuser: boolean
            isActive: boolean
            staffRole?: StaffRole
            customerRole?: CustomerRole
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        isStaff: boolean
        isSuperuser: boolean
        isActive: boolean
        staffRole?: StaffRole
        customerRole?: CustomerRole
    }
}