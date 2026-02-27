export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  warehouseId?: string;
  warehouseName?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = 'warehouse_owner' | 'warehouse_manager' | 'quick_commerce';

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  warehouseId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentUtilization: number;
  zones: string[];
  managerId?: string;
  ownerId: string;
}

export interface Permissions {
  canViewInventory: boolean;
  canEditInventory: boolean;
  canDispatchBatch: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canViewSensors: boolean;
  canConfigureAlerts: boolean;
}

export const rolePermissions: Record<UserRole, Permissions> = {
  warehouse_owner: {
    canViewInventory: true,
    canEditInventory: true,
    canDispatchBatch: true,
    canViewReports: true,
    canManageUsers: true,
    canViewSensors: true,
    canConfigureAlerts: true,
  },
  warehouse_manager: {
    canViewInventory: true,
    canEditInventory: true,
    canDispatchBatch: true,
    canViewReports: true,
    canManageUsers: false,
    canViewSensors: true,
    canConfigureAlerts: true,
  },
  quick_commerce: {
    canViewInventory: true,
    canEditInventory: false,
    canDispatchBatch: false,
    canViewReports: false,
    canManageUsers: false,
    canViewSensors: false,
    canConfigureAlerts: false,
  },
};
