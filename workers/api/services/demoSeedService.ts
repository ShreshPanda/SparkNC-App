import { BaseRepository } from '../repositories/baseRepository';

declare const crypto: Crypto;

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function textToBuffer(text: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(text);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 = btoa(binary);
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveKey(password: string, salt: string, iterations: number): Promise<ArrayBuffer> {
  const passwordKey = await crypto.subtle.importKey('raw', textToBuffer(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: bytesToBuffer(base64UrlToBytes(salt)), iterations, hash: 'SHA-256' },
    passwordKey,
    KEY_BITS,
  );
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const bits = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2:${PBKDF2_ITERATIONS}:${bytesToBase64Url(new Uint8Array(bits))}`;
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return bytesToBase64Url(bytes);
}

export interface DemoSeedResult {
  schoolId: string;
  adminEmail: string;
  ambassadorEmail: string;
  studentEmails: string[];
  demoPassword: string;
  counts: Record<string, number>;
}

export class DemoSeedService extends BaseRepository {
  async seed(db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }): Promise<DemoSeedResult> {
    const demoPassword = 'sparknc-demo';
    const schoolId = 'school-sparknc-demo';
    const adminId = 'user-admin-demo';
    const ambassadorId = 'user-ambassador-demo';
    const studentIds = [
      'user-student-ava',
      'user-student-jordan',
      'user-student-morgan',
      'user-student-taylor',
      'user-student-riley',
    ];

    await this.clearDemoData(db);
    await this.seedSchool(db, schoolId);

    const adminEmail = 'admin@sparknc.demo';
    const ambassadorEmail = 'ambassador@sparknc.demo';
    const studentEmails = ['ava@sparknc.demo', 'jordan@sparknc.demo', 'morgan@sparknc.demo', 'taylor@sparknc.demo', 'riley@sparknc.demo'];

    await this.seedUser(db, adminId, adminEmail, 'Admin Demo', 'admin', schoolId, demoPassword, 0, 0);
    await this.seedUser(db, ambassadorId, ambassadorEmail, 'Ambassador Demo', 'ambassador', schoolId, demoPassword, 0, 0);

    for (let i = 0; i < studentIds.length; i += 1) {
      const xp = [1240, 850, 2100, 420, 1560][i];
      const streak = [12, 3, 30, 1, 18][i];
      await this.seedUser(db, studentIds[i], studentEmails[i], ['Ava Demo', 'Jordan Demo', 'Morgan Demo', 'Taylor Demo', 'Riley Demo'][i], 'student', schoolId, demoPassword, xp, streak);
    }

    const counts: Record<string, number> = {};
    counts.tasks = await this.seedTasks(db, studentIds);
    counts.goals = await this.seedGoals(db, studentIds);
    counts.events = await this.seedEvents(db, schoolId, adminId);
    counts.announcements = await this.seedAnnouncements(db, adminId);
    counts.messages = await this.seedMessages(db, studentIds, ambassadorId);
    counts.notifications = await this.seedNotifications(db, studentIds);
    counts.achievements = await this.seedAchievements(db, studentIds);
    counts.journeyEvents = await this.seedJourneyEvents(db, studentIds);
    counts.portfolioRecords = await this.seedPortfolioRecords(db, studentIds);
    counts.growthEvents = await this.seedGrowthEvents(db, studentIds);
    counts.feedback = await this.seedFeedback(db, studentIds);
    counts.featureRequests = await this.seedFeatureRequests(db, studentIds);
    counts.impactReports = await this.seedImpactReports(db, schoolId, adminId);
    counts.recommendations = await this.seedRecommendations(db, schoolId, adminId);
    counts.ambassadorAssignments = await this.seedAmbassadorAssignments(db, ambassadorId, studentIds);
    counts.aiMemories = await this.seedAIMemories(db, studentIds);
    counts.sparkMoments = await this.seedSparkMoments(db, studentIds);
    counts.activityLogs = await this.seedActivityLogs(db, studentIds);

    return {
      schoolId,
      adminEmail,
      ambassadorEmail,
      studentEmails,
      demoPassword,
      counts,
    };
  }

  private async clearDemoData(db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }): Promise<void> {
    const demoIds = [
      'school-sparknc-demo',
      'user-admin-demo',
      'user-ambassador-demo',
      'user-student-ava',
      'user-student-jordan',
      'user-student-morgan',
      'user-student-taylor',
      'user-student-riley',
    ];
    const userIds = demoIds.filter((id) => id.startsWith('user-'));
    const userList = userIds.map(() => '?').join(',');

    const tableDeletions: { table: string; conditions: string[] }[] = [
      { table: 'activity_logs', conditions: [`user_id IN (${userList})`] },
      { table: 'ai_memories', conditions: [`user_id IN (${userList})`] },
      { table: 'ambassador_assignments', conditions: [`ambassador_id IN (${userList})`, `student_id IN (${userList})`] },
      { table: 'announcements', conditions: [`created_by IN (${userList})`] },
      { table: 'conversation_participants', conditions: [`user_id IN (${userList})`] },
      { table: 'conversations', conditions: ["id LIKE 'conversation-school-sparknc-demo%'"] },
      { table: 'events', conditions: ["id LIKE 'event-school-sparknc-demo%'", `created_by IN (${userList})`] },
      { table: 'feature_requests', conditions: ["id LIKE 'feature-school-sparknc-demo%'", `created_by IN (${userList})`] },
      { table: 'goals', conditions: [`user_id IN (${userList})`] },
      { table: 'growth_events', conditions: [`user_id IN (${userList})`] },
      { table: 'impact_reports', conditions: ["id LIKE 'impact-report-school-sparknc-demo%'"] },
      { table: 'improvement_recommendations', conditions: ["id LIKE 'recommendation-school-sparknc-demo%'"] },
      { table: 'journey_events', conditions: [`user_id IN (${userList})`] },
      { table: 'messages', conditions: [`sender_id IN (${userList})`] },
      { table: 'notifications', conditions: [`user_id IN (${userList})`] },
      { table: 'portfolio', conditions: [`user_id IN (${userList})`] },
      { table: 'spark_moments', conditions: [`user_id IN (${userList})`] },
      { table: 'student_feedback', conditions: [`user_id IN (${userList})`] },
      { table: 'tasks', conditions: [`user_id IN (${userList})`] },
      { table: 'user_achievements', conditions: [`user_id IN (${userList})`] },
      { table: 'achievements', conditions: ["id LIKE 'achievement-school-sparknc-demo%'"] },
      { table: 'users', conditions: [`id IN (${userList})`] },
      { table: 'schools', conditions: ["id = 'school-sparknc-demo'"] },
    ];

    for (const { table, conditions } of tableDeletions) {
      try {
        await db.prepare(`DELETE FROM ${table} WHERE ${conditions.join(' OR ')}`).bind(...userIds).run();
      } catch {
        // Table may not exist or column mismatch; continue cleanup.
      }
    }
  }

  private async seedSchool(db: any, schoolId: string): Promise<void> {
    const now = this.now();
    await db
      .prepare('INSERT OR REPLACE INTO schools (id, name, slug, city, country, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(schoolId, 'SparkNC Demo School', 'sparknc-demo', 'Raleigh', 'USA', now, now)
      .run();
  }

  private async seedUser(
    db: any,
    id: string,
    email: string,
    name: string,
    role: string,
    schoolId: string,
    password: string,
    xp: number,
    streak: number,
  ): Promise<void> {
    const salt = randomSalt();
    const passwordHash = await hashPassword(password, salt);
    const now = this.now();
    await db
      .prepare(
        'INSERT OR REPLACE INTO users (id, email, name, role, school_id, xp_total, current_streak, longest_streak, last_activity_at, created_at, updated_at, password_hash, password_salt, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(id, email.toLowerCase(), name, role, schoolId, xp, streak, Math.max(streak, streak + 5), now, now, now, passwordHash, salt, 1)
      .run();
  }

  private async seedTasks(db: any, studentIds: string[]): Promise<number> {
    let count = 0;
    const titles = [
      'Complete onboarding reflection',
      'Set weekly goals',
      'Attend SparkNC kickoff',
      'Read program guide',
      'Join community channel',
      'Submit feedback check-in',
      'Complete leadership module',
      'Plan semester project',
      'Mentor a peer',
      'Celebrate a milestone',
    ];
    const categories = ['Onboarding', 'Planning', 'Event', 'Learning', 'Community', 'Feedback', 'Leadership', 'Project', 'Mentorship', 'Reflection'];
    const now = this.now();
    for (const studentId of studentIds) {
      for (let i = 0; i < 4; i += 1) {
        const completed = i < 2;
        const id = `task-${studentId}-${i}`;
        await db
          .prepare(
            'INSERT OR REPLACE INTO tasks (id, user_id, title, description, category, completed, xp_reward, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(id, studentId, titles[i], `Demo task ${i + 1}`, categories[i], completed ? 1 : 0, 25, now, now)
          .run();
        count += 1;
      }
    }
    return count;
  }

  private async seedGoals(db: any, studentIds: string[]): Promise<number> {
    let count = 0;
    const titles = ['Build a consistent weekly habit', 'Connect with 3 peers', 'Complete leadership module', 'Earn 500 XP'];
    const now = this.now();
    for (const studentId of studentIds) {
      for (let i = 0; i < titles.length; i += 1) {
        const completed = i < 1;
        const id = `goal-${studentId}-${i}`;
        await db
          .prepare(
            'INSERT OR REPLACE INTO goals (id, user_id, title, description, progress, completed, xp_reward, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(id, studentId, titles[i], `Demo goal ${i + 1}`, completed ? 100 : [40, 60, 20, 10][i], completed ? 1 : 0, 100, now, now)
          .run();
        count += 1;
      }
    }
    return count;
  }

  private async seedEvents(db: any, schoolId: string, adminId: string): Promise<number> {
    const events = [
      { title: 'SparkNC Kickoff', startsAt: '2026-08-15T18:00:00.000Z', endsAt: '2026-08-15T19:30:00.000Z', location: 'Student Union' },
      { title: 'Goal-Setting Workshop', startsAt: '2026-08-22T17:00:00.000Z', endsAt: '2026-08-22T18:00:00.000Z', location: 'Room 204' },
      { title: 'Ambassador Office Hours', startsAt: '2026-08-25T16:00:00.000Z', endsAt: '2026-08-25T17:00:00.000Z', location: 'Zoom' },
      { title: 'Community Celebration', startsAt: '2026-09-05T19:00:00.000Z', endsAt: '2026-09-05T20:30:00.000Z', location: 'Auditorium' },
    ];
    const now = this.now();
    let count = 0;
    for (let i = 0; i < events.length; i += 1) {
      const id = `event-school-sparknc-demo-${i}`;
      await db
        .prepare(
          'INSERT OR REPLACE INTO events (id, title, description, starts_at, ends_at, location, created_by, school_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(id, events[i].title, 'Demo event created for DC1.', events[i].startsAt, events[i].endsAt ?? null, events[i].location ?? null, adminId, schoolId, now, now)
        .run();
      count += 1;
    }
    return count;
  }

  private async seedAnnouncements(db: any, adminId: string): Promise<number> {
    const announcements = [
      { title: 'Welcome to SparkNC', body: 'We are excited to launch the pilot. Complete your onboarding and set your first goal this week.', scope: 'global' },
      { title: 'Ambassador Office Hours', body: 'Office hours are now open every Tuesday and Thursday afternoon. Drop in for support.', scope: 'global' },
      { title: 'Goal-Setting Workshop', body: 'Join us for a guided goal-setting workshop next Thursday.', scope: 'school' },
    ];
    const now = this.now();
    let count = 0;
    for (let i = 0; i < announcements.length; i += 1) {
      const id = `announcement-school-sparknc-demo-${i}`;
      await db
        .prepare('INSERT OR REPLACE INTO announcements (id, title, body, scope, created_by, school_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(id, announcements[i].title, announcements[i].body, announcements[i].scope, adminId, null, now, now)
        .run();
      count += 1;
    }
    return count;
  }

  private async seedMessages(db: any, studentIds: string[], ambassadorId: string): Promise<number> {
    const conversationId = 'conversation-school-sparknc-demo';
    const now = this.now();
    await db
      .prepare('INSERT OR REPLACE INTO conversations (id, created_at, updated_at) VALUES (?, ?, ?)')
      .bind(conversationId, now, now)
      .run();

    const participants = [...studentIds.slice(0, 2), ambassadorId];
    for (const userId of participants) {
      await db
        .prepare('INSERT OR REPLACE INTO conversation_participants (conversation_id, user_id, created_at) VALUES (?, ?, ?)')
        .bind(conversationId, userId, now)
        .run();
    }

    const messages = [
      { sender: ambassadorId, body: 'Hi everyone! Welcome to the SparkNC pilot. How can I help you this week?' },
      { sender: studentIds[0], body: 'Hi! I am excited to set my first goal.' },
      { sender: studentIds[1], body: 'Thanks for checking in. I will attend the workshop on Thursday.' },
    ];

    let count = 0;
    for (let i = 0; i < messages.length; i += 1) {
      const id = `message-school-sparknc-demo-${i}`;
      const recipient = messages[i].sender === ambassadorId ? studentIds[0] : ambassadorId;
      await db
        .prepare(
          'INSERT OR REPLACE INTO messages (id, conversation_id, sender_id, recipient_id, body, read_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(id, conversationId, messages[i].sender, recipient, messages[i].body, i === messages.length - 1 ? 'sent' : 'read', now)
        .run();
      count += 1;
    }
    return count;
  }

  private async seedNotifications(db: any, studentIds: string[]): Promise<number> {
    const notifications = [
      { title: 'Welcome to SparkNC', body: 'Set your first goal and earn 25 XP.', kind: 'info' },
      { title: 'Event reminder', body: 'SparkNC Kickoff starts in 24 hours.', kind: 'reminder' },
      { title: 'Streak at risk', body: 'Complete a task today to keep your streak alive.', kind: 'warning' },
      { title: 'Achievement unlocked', body: 'You earned First Steps.', kind: 'achievement' },
    ];
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      for (let i = 0; i < notifications.length; i += 1) {
        const id = `notification-${studentId}-${i}`;
        await db
          .prepare(
            'INSERT OR REPLACE INTO notifications (id, user_id, title, body, kind, is_read, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(id, studentId, notifications[i].title, notifications[i].body, notifications[i].kind, i < 2 ? 1 : 0, now, now)
          .run();
        count += 1;
      }
    }
    return count;
  }

  private async seedAchievements(db: any, studentIds: string[]): Promise<number> {
    const achievements = [
      { key: 'first_steps', title: 'First Steps', description: 'Completed your first task.', category: 'tasks', criteria: '{"tasksCompleted": 1}', points: 25 },
      { key: 'goal_setter', title: 'Goal Setter', description: 'Created your first goal.', category: 'goals', criteria: '{"goalsCreated": 1}', points: 50 },
      { key: 'consistent', title: 'Consistent', description: 'Maintained a 7-day streak.', category: 'streaks', criteria: '{"streakDays": 7}', points: 100 },
      { key: 'community_member', title: 'Community Member', description: 'Attended your first event.', category: 'events', criteria: '{"eventsAttended": 1}', points: 75 },
    ];
    const now = this.now();
    let count = 0;
    for (let i = 0; i < achievements.length; i += 1) {
      const id = `achievement-school-sparknc-demo-${i}`;
      await db
        .prepare('INSERT OR REPLACE INTO achievements (id, achievement_key, title, description, category, criteria, points, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(id, achievements[i].key, achievements[i].title, achievements[i].description, achievements[i].category, achievements[i].criteria, achievements[i].points, now)
        .run();
      count += 1;
    }
    for (const studentId of studentIds) {
      for (let i = 0; i < 2; i += 1) {
        await db
          .prepare('INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, unlocked_at, metadata) VALUES (?, ?, ?, ?, ?)')
          .bind(`ua-${studentId}-${i}`, studentId, `achievement-school-sparknc-demo-${i}`, now, '{}')
          .run();
      }
    }
    return count;
  }

  private async seedJourneyEvents(db: any, studentIds: string[]): Promise<number> {
    const events = [
      { title: 'Joined SparkNC', description: 'Created your account and started the journey.', category: 'milestone', badge: undefined },
      { title: 'Created first goal', description: 'Defined your first personal goal.', category: 'goal', badge: undefined },
      { title: 'Completed first project', description: 'Shipped your first task or project.', category: 'milestone', badge: '🏆' },
      { title: 'Earned first badge', description: 'Earned the First Steps achievement.', category: 'achievement', badge: '🎖️' },
      { title: 'Attended community event', description: 'Connected with peers at a SparkNC event.', category: 'event', badge: undefined },
      { title: 'Improved consistency', description: 'Built a stronger daily habit.', category: 'reflection', badge: undefined },
    ];
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      for (let i = 0; i < events.length; i += 1) {
        const id = `journey-${studentId}-${i}`;
        const date = new Date();
        date.setMonth(date.getMonth() - (events.length - i));
        await db
          .prepare('INSERT OR REPLACE INTO journey_events (id, user_id, date, title, description, category, badge, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(id, studentId, date.toISOString(), events[i].title, events[i].description, events[i].category, events[i].badge ?? null, now)
          .run();
        count += 1;
      }
    }
    return count;
  }

  private async seedPortfolioRecords(db: any, studentIds: string[]): Promise<number> {
    const records: { type: string; title: string; description: string; date?: string; metadata?: string }[] = [
      { type: 'project', title: 'Community Impact Project', description: 'Led a fundraising campaign.', date: '2025-11-15' },
      { type: 'goal', title: 'Complete 20 tasks', description: 'Built consistent study habits.', date: '2025-10-30' },
      { type: 'achievement', title: 'First Steps', description: 'Unlocked first achievement.', date: '2025-09-20' },
      { type: 'event', title: 'SparkNC Kickoff', description: 'Attended program kickoff.', date: '2025-09-10' },
      { type: 'skill', title: 'Public Speaking', description: 'Practiced through peer presentations.' },
      { type: 'skill', title: 'Project Management', description: 'Led a semester project team.' },
      { type: 'certificate', title: 'Leadership Foundations', description: 'Completed leadership foundations.', date: '2025-12-01' },
      { type: 'community', title: 'Ambassador', description: 'Served as a peer ambassador.', metadata: 'leader' },
      { type: 'community', title: 'Top Contributor', description: 'Recognized for community impact.' },
    ];
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      for (let i = 0; i < records.length; i += 1) {
        const id = `portfolio-${studentId}-${i}`;
        await db
          .prepare('INSERT OR REPLACE INTO portfolio (user_id, type, id, title, description, date, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(studentId, records[i].type, id, records[i].title, records[i].description, records[i].date ?? null, records[i].metadata ?? null)
          .run();
        count += 1;
      }
    }
    return count;
  }

  private async seedGrowthEvents(db: any, studentIds: string[]): Promise<number> {
    const events = [
      { eventType: 'milestone', title: 'Joined SparkNC', description: 'Started the SparkNC journey.', metadata: '{}' },
      { eventType: 'goal', title: 'First goal created', description: 'Set a personal growth goal.', metadata: '{}' },
      { eventType: 'task', title: 'First task completed', description: 'Earned XP and started a streak.', metadata: '{"xp": 25}' },
      { eventType: 'achievement', title: 'First badge earned', description: 'Unlocked the First Steps achievement.', metadata: '{}' },
      { eventType: 'event', title: 'Attended kickoff', description: 'Joined the SparkNC kickoff event.', metadata: '{}' },
    ];
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      for (let i = 0; i < events.length; i += 1) {
        const id = `growth-${studentId}-${i}`;
        const date = new Date();
        date.setMonth(date.getMonth() - (events.length - i));
        await db
          .prepare('INSERT OR REPLACE INTO growth_events (id, user_id, event_type, title, description, occurred_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id, studentId, events[i].eventType, events[i].title, events[i].description, date.toISOString(), events[i].metadata)
          .run();
        count += 1;
      }
    }
    return count;
  }

  private async seedFeedback(db: any, studentIds: string[]): Promise<number> {
    const items = [
      { category: 'Weekly check-in', rating: 5, feedbackText: 'Loving the community events so far.' },
      { category: 'Feature suggestion', rating: 4, feedbackText: 'Would love a dark mode option.' },
      { category: 'Event feedback', rating: 5, feedbackText: 'The kickoff was inspiring and well organized.' },
    ];
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      for (let i = 0; i < items.length; i += 1) {
        const id = `feedback-${studentId}-${i}`;
        await db
          .prepare('INSERT OR REPLACE INTO student_feedback (id, user_id, category, rating, feedback_text, sentiment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id, studentId, items[i].category, items[i].rating, items[i].feedbackText, 'positive', now)
          .run();
        count += 1;
      }
    }
    return count;
  }

  private async seedFeatureRequests(db: any, studentIds: string[]): Promise<number> {
    const items = [
      { title: 'Dark mode', description: 'A dark theme for late-night sessions.', category: 'App improvement', status: 'Submitted', votes: 12 },
      { title: 'Group challenges', description: 'Team-based weekly challenges.', category: 'Engagement', status: 'Under Review', votes: 7 },
      { title: 'Calendar sync', description: 'Export events to personal calendar.', category: 'Productivity', status: 'Open', votes: 4 },
    ];
    const now = this.now();
    let count = 0;
    for (let i = 0; i < items.length; i += 1) {
      const id = `feature-school-sparknc-demo-${i}`;
      await db
        .prepare(
          'INSERT OR REPLACE INTO feature_requests (id, created_by, title, description, category, status, votes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(id, studentIds[0], items[i].title, items[i].description, items[i].category, items[i].status, items[i].votes, now)
        .run();
      count += 1;
    }
    return count;
  }

  private async seedImpactReports(db: any, schoolId: string, adminId: string): Promise<number> {
    const now = this.now();
    const reports = [
      { reportType: 'monthly', periodStart: '2026-06-01', periodEnd: '2026-06-30' },
      { reportType: 'monthly', periodStart: '2026-07-01', periodEnd: '2026-07-31' },
    ];
    let count = 0;
    for (let i = 0; i < reports.length; i += 1) {
      const id = `impact-report-school-sparknc-demo-${i}`;
      await db
        .prepare(
          'INSERT OR REPLACE INTO impact_reports (id, scope, scope_id, report_type, period_start, period_end, metrics, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(id, 'school', schoolId, reports[i].reportType, reports[i].periodStart, reports[i].periodEnd, '{}', adminId, now)
        .run();
      count += 1;
    }
    return count;
  }

  private async seedRecommendations(db: any, schoolId: string, adminId: string): Promise<number> {
    const now = this.now();
    const items = [
      { recommendationType: 'engagement', title: 'Increase reminder frequency for deadlines', description: 'Students with daily reminders complete 22% more tasks.' },
      { recommendationType: 'event_planning', title: 'Schedule more Thursday events', description: 'Thursday events show the highest attendance.' },
      { recommendationType: 'retention', title: 'Re-engage inactive students', description: 'Send a personalized check-in after 3 inactive days.' },
    ];
    let count = 0;
    for (let i = 0; i < items.length; i += 1) {
      const id = `recommendation-school-sparknc-demo-${i}`;
      await db
        .prepare(
          'INSERT OR REPLACE INTO improvement_recommendations (id, scope, scope_id, recommendation_type, title, description, status, evidence, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(id, 'school', schoolId, items[i].recommendationType, items[i].title, items[i].description, 'pending', JSON.stringify({ source: 'demo', createdBy: adminId }), now)
        .run();
      count += 1;
    }
    return count;
  }

  private async seedAmbassadorAssignments(db: any, ambassadorId: string, studentIds: string[]): Promise<number> {
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      const id = `assignment-${ambassadorId}-${studentId}`;
      await db
        .prepare('INSERT OR REPLACE INTO ambassador_assignments (id, ambassador_id, student_id, created_at) VALUES (?, ?, ?, ?)')
        .bind(id, ambassadorId, studentId, now)
        .run();
      count += 1;
    }
    return count;
  }

  private async seedAIMemories(db: any, studentIds: string[]): Promise<number> {
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      const memories = [
        { role: 'user', content: 'How am I doing this week?', context: 'How am I doing' },
        { role: 'assistant', content: 'You are making steady progress. Keep completing one task per day to maintain your streak.', context: 'progress summary' },
      ];
      for (let i = 0; i < memories.length; i += 1) {
        const id = `ai-memory-${studentId}-${i}`;
        await db
          .prepare('INSERT OR REPLACE INTO ai_memories (id, user_id, role, content, context, created_at) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, studentId, memories[i].role, memories[i].content, memories[i].context, now)
          .run();
        count += 1;
      }
    }
    return count;
  }

  private async seedSparkMoments(db: any, studentIds: string[]): Promise<number> {
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      const id = `spark-moment-${studentId}-0`;
      await db
        .prepare(
          'INSERT OR REPLACE INTO spark_moments (id, user_id, type, title, description, xp_threshold, tasks_threshold, triggered_at, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(id, studentId, 'milestone', 'First task completed', 'You completed your first SparkNC task and earned XP.', 0, 1, now, '{}', now)
        .run();
      count += 1;
    }
    return count;
  }

  private async seedActivityLogs(db: any, studentIds: string[]): Promise<number> {
    const now = this.now();
    let count = 0;
    for (const studentId of studentIds) {
      const activities = ['login', 'task_complete', 'goal_create', 'event_view'];
      for (let i = 0; i < activities.length; i += 1) {
        const id = `activity-${studentId}-${i}`;
        await db
          .prepare('INSERT OR REPLACE INTO activity_logs (id, user_id, activity_type, entity_type, entity_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id, studentId, activities[i], 'demo', `${activities[i]}-${i}`, JSON.stringify({ source: 'seed' }), now)
          .run();
        count += 1;
      }
    }
    return count;
  }
}
