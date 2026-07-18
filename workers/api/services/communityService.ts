import { CommunityRepository } from '../repositories/CommunityRepository';

export interface CreateGroupInput {
  name: string;
  description?: string;
  kind?: 'project' | 'interest' | 'learning' | 'general';
}

export interface CreatePostInput {
  groupId: string;
  title?: string;
  body: string;
  kind?: 'update' | 'question' | 'resource' | 'milestone';
}

export class CommunityService {
  constructor(private readonly repository: CommunityRepository) {}

  async createGroup(input: CreateGroupInput & { createdBy: string }) {
    const kind = input.kind ?? 'general';
    const group = await this.repository.createGroup({
      name: input.name,
      description: input.description,
      kind,
      createdBy: input.createdBy,
    });
    // Creator is the first member with admin role.
    await this.repository.addMember({ groupId: group.id, userId: input.createdBy, role: 'admin' });
    return group;
  }

  async listGroups() {
    return this.repository.listGroups();
  }

  async joinGroup(groupId: string, userId: string) {
    const isAlreadyMember = await this.repository.isMember(groupId, userId);
    if (isAlreadyMember) {
      return { ok: true, message: 'Already a member' };
    }
    const member = await this.repository.addMember({ groupId, userId });
    return { ok: true, member };
  }

  async shareProgress(input: CreatePostInput & { userId: string }) {
    const isMember = await this.repository.isMember(input.groupId, input.userId);
    if (!isMember) {
      throw new Error('Must join the group before posting');
    }
    const kind = input.kind ?? 'update';
    return this.repository.createPost({
      groupId: input.groupId,
      userId: input.userId,
      title: input.title,
      body: input.body,
      kind,
    });
  }

  async listGroupPosts(groupId: string, userId: string) {
    const isMember = await this.repository.isMember(groupId, userId);
    if (!isMember) {
      throw new Error('Must join the group to view posts');
    }
    return this.repository.listPosts(groupId);
  }
}
