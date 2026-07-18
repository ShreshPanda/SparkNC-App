import { describe, it, expect } from 'vitest';
import { AuditLogService } from '../api/services/auditLogService';

interface AuditLogCall {
  actorId: string | undefined;
  action: string;
  entityType: string | undefined;
  entityId: string | undefined;
  metadata: Record<string, unknown> | undefined;
}

function createFakeRepository() {
  const calls: AuditLogCall[] = [];
  return {
    calls,
    async log(actorId: string | undefined, action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>) {
      calls.push({ actorId, action, entityType, entityId, metadata });
      return { id: `audit-${calls.length}`, actorId, action, entityType, entityId, metadata: JSON.stringify(metadata), createdAt: new Date().toISOString() };
    },
    async list() {
      return [];
    },
  };
}

describe('AuditLogService', () => {
  it('sanitizes sensitive metadata before persisting', async () => {
    const fake = createFakeRepository();
    const service = new AuditLogService(fake as any);

    await service.log('user-1', 'login', 'session', 'session-1', {
      token: 'secret-token',
      password: 'secret-password',
      safeField: 'keep',
      nested: { apiToken: 'nested-secret' },
    });

    expect(fake.calls.length).toBe(1);
    const logged = fake.calls[0].metadata;
    expect(logged?.token).toBe('[REDACTED]');
    expect(logged?.password).toBe('[REDACTED]');
    expect(logged?.safeField).toBe('keep');
    expect((logged?.nested as any)?.apiToken).toBe('[REDACTED]');
  });

  it('passes actor and action through to repository', async () => {
    const fake = createFakeRepository();
    const service = new AuditLogService(fake as any);

    await service.log('user-2', 'events.create', 'event', 'event-1');

    expect(fake.calls[0].actorId).toBe('user-2');
    expect(fake.calls[0].action).toBe('events.create');
    expect(fake.calls[0].entityType).toBe('event');
    expect(fake.calls[0].entityId).toBe('event-1');
  });
});
