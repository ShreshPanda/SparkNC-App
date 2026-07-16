export type SparkRole = 'student' | 'ambassador' | 'lab_leader' | 'location_manager' | 'board_member' | 'admin';

export type SparkPermission = 'read' | 'write' | 'manage' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: SparkRole;
  schoolId?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: SparkRole;
  description?: string;
  permissions: SparkPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  progress: number;
  completed: boolean;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  threadId?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  activityType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}
