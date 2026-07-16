import {
  User as UserProfile,
  Task as TaskItem,
  Goal as GoalItem,
  Message as MessageThread,
  Event as EventItem,
} from '../shared/types';

const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const workerUrl = runtimeEnv.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL ?? 'http://localhost:8787';

export const cloudflareService = {
  async healthCheck() {
    const response = await fetch(`${workerUrl}/health`);
    return response.json();
  },

  async getUserProfile(id: string): Promise<UserProfile | null> {
    const response = await fetch(`${workerUrl}/users/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  },

  async listTasks(): Promise<TaskItem[]> {
    const response = await fetch(`${workerUrl}/tasks`);
    if (!response.ok) {
      return [];
    }
    return response.json();
  },

  async listGoals(): Promise<GoalItem[]> {
    const response = await fetch(`${workerUrl}/goals`);
    if (!response.ok) {
      return [];
    }
    return response.json();
  },

  async listMessages(): Promise<MessageThread[]> {
    const response = await fetch(`${workerUrl}/messages`);
    if (!response.ok) {
      return [];
    }
    return response.json();
  },

  async listEvents(): Promise<EventItem[]> {
    const response = await fetch(`${workerUrl}/events`);
    if (!response.ok) {
      return [];
    }
    return response.json();
  },
};
