import assert from 'node:assert/strict';
import { TaskRepository } from '../repositories/TaskRepository';
import { GoalRepository } from '../repositories/GoalRepository';

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  due_date: string | null;
  completed: number;
  xp_reward: number;
  created_at: string;
  updated_at: string;
};

type GoalRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  progress: number;
  completed: number;
  xp_reward: number;
  created_at: string;
  updated_at: string;
};

class InMemoryStatement {
  private query: string;
  private bindArgs: unknown[];
  private db: InMemoryD1;

  constructor(query: string, bindArgs: unknown[], db: InMemoryD1) {
    this.query = query;
    this.bindArgs = bindArgs;
    this.db = db;
  }

  async run() {
    if (this.query.includes('INSERT INTO tasks')) {
      const [
        id,
        userId,
        title,
        description,
        category,
        dueDate,
        completed,
        xpReward,
        createdAt,
        updatedAt,
      ] = this.bindArgs as [
        string,
        string,
        string,
        string | null,
        string | null,
        string | null,
        number,
        number,
        string,
        string,
      ];

      this.db.tasks.push({
        id,
        user_id: userId,
        title,
        description,
        category,
        due_date: dueDate,
        completed,
        xp_reward: xpReward,
        created_at: createdAt,
        updated_at: updatedAt,
      });
      return { success: true };
    }

    if (this.query.includes('INSERT INTO goals')) {
      const [
        id,
        userId,
        title,
        description,
        progress,
        completed,
        xpReward,
        createdAt,
        updatedAt,
      ] = this.bindArgs as [
        string,
        string,
        string,
        string | null,
        number,
        number,
        number,
        string,
        string,
      ];

      this.db.goals.push({
        id,
        user_id: userId,
        title,
        description,
        progress,
        completed,
        xp_reward: xpReward,
        created_at: createdAt,
        updated_at: updatedAt,
      });
      return { success: true };
    }

    if (this.query.includes('UPDATE tasks')) {
      const [
        updatedAt,
        completed,
        xpReward,
        title,
        description,
        category,
        dueDate,
        id,
        userId,
      ] = this.bindArgs as [
        string,
        number,
        number,
        string,
        string | null,
        string | null,
        string | null,
        string,
        string,
      ];

      const row = this.db.tasks.find((t) => t.id === id && t.user_id === userId);
      if (row) {
        row.updated_at = updatedAt;
        row.completed = completed;
        row.xp_reward = xpReward;
        row.title = title;
        row.description = description;
        row.category = category;
        row.due_date = dueDate;
      }
      return { success: true };
    }

    if (this.query.includes('UPDATE goals')) {
      const [
        updatedAt,
        progress,
        completed,
        xpReward,
        title,
        description,
        id,
        userId,
      ] = this.bindArgs as [
        string,
        number,
        number,
        number,
        string,
        string | null,
        string,
        string,
      ];

      const row = this.db.goals.find((g) => g.id === id && g.user_id === userId);
      if (row) {
        row.updated_at = updatedAt;
        row.progress = progress;
        row.completed = completed;
        row.xp_reward = xpReward;
        row.title = title;
        row.description = description;
      }
      return { success: true };
    }

    if (this.query.includes('DELETE FROM tasks')) {
      const [id, userId] = this.bindArgs as [string, string];
      this.db.tasks = this.db.tasks.filter((t) => !(t.id === id && t.user_id === userId));
      return { success: true };
    }

    return { success: true };
  }

  async first() {
    if (this.query.includes('SELECT') && this.query.includes('FROM tasks')) {
      const [userId] = this.bindArgs as [string];
      return this.db.tasks.find((t) => t.user_id === userId) ?? null;
    }

    if (this.query.includes('SELECT') && this.query.includes('FROM goals')) {
      const [userId] = this.bindArgs as [string];
      return this.db.goals.find((g) => g.user_id === userId) ?? null;
    }

    return null;
  }

  async all() {
    if (this.query.includes('SELECT') && this.query.includes('FROM tasks')) {
      const [userId] = this.bindArgs as [string];
      return { results: this.db.tasks.filter((t) => t.user_id === userId) };
    }

    if (this.query.includes('SELECT') && this.query.includes('FROM goals')) {
      const [userId] = this.bindArgs as [string];
      return { results: this.db.goals.filter((g) => g.user_id === userId) };
    }

    return { results: [] };
  }
}

class InMemoryD1 {
  tasks: TaskRow[] = [];
  goals: GoalRow[] = [];

  prepare(query: string) {
    const db = this;
    return {
      bind: (...values: unknown[]) => new InMemoryStatement(query, values, db),
    };
  }
}

async function main() {
  const db = new InMemoryD1() as any;
  const taskRepository = new TaskRepository(db);
  const goalRepository = new GoalRepository(db);

  const createdTask = await taskRepository.createTask(
    {
      title: 'Ship onboarding checklist',
      description: 'Complete the onboarding flow',
      category: 'productivity',
      dueDate: '2026-07-20T00:00:00.000Z',
      completed: false,
      xpReward: 50,
    },
    'user-1',
  );

  assert.equal(createdTask.title, 'Ship onboarding checklist');
  assert.equal(createdTask.userId, 'user-1');

  const tasks = await taskRepository.listTasks('user-1');
  assert.equal(tasks.length, 1);

  const updatedTask = await taskRepository.updateTask(
    createdTask.id,
    {
      title: 'Ship onboarding checklist',
      description: 'Complete the onboarding flow',
      category: 'productivity',
      dueDate: '2026-07-20T00:00:00.000Z',
      completed: true,
      xpReward: 75,
    },
    'user-1',
  );
  assert.equal(updatedTask?.completed, true);
  assert.equal(updatedTask?.xpReward, 75);

  const deleted = await taskRepository.deleteTask(createdTask.id, 'user-1');
  assert.equal(deleted, true);

  const createdGoal = await goalRepository.createGoal(
    {
      title: 'Launch SparkNC beta',
      description: 'Prepare the beta release',
      progress: 25,
      completed: false,
      xpReward: 120,
    },
    'user-1',
  );

  assert.equal(createdGoal.title, 'Launch SparkNC beta');

  const goals = await goalRepository.listGoals('user-1');
  assert.equal(goals.length, 1);

  console.log('persistence test passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

