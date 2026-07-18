import {
  createGroupController,
  createGroupPostController,
  joinGroupController,
  listGroupPostsController,
  listGroupsController,
} from '../controllers/community';
import { requirePermission } from '../middleware/permission';

export function createCommunityRoutes() {
  return [
    {
      method: 'GET',
      path: '/community/groups',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listGroupsController(context),
    },
    {
      method: 'POST',
      path: '/community/groups',
      handler: requirePermission('community.groups.create', (_params: Record<string, string> | undefined, input: unknown, context: any) => createGroupController(input as any, context)),
    },
    {
      method: 'POST',
      path: '/community/groups/:id/join',
      handler: requirePermission('community.groups.join', (params: Record<string, string> | undefined, _input: unknown, context: any) => joinGroupController({ groupId: params?.id ?? '' }, context)),
    },
    {
      method: 'GET',
      path: '/community/groups/:id/posts',
      handler: requirePermission('community.posts.read', (params: Record<string, string> | undefined, _input: unknown, context: any) => listGroupPostsController({ groupId: params?.id ?? '' }, context)),
    },
    {
      method: 'POST',
      path: '/community/groups/:id/posts',
      handler: requirePermission('community.posts.create', (params: Record<string, string> | undefined, input: unknown, context: any) => createGroupPostController({ ...(input as any), groupId: params?.id ?? '' }, context)),
    },
  ];
}
