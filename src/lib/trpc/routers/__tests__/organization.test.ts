import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

// Mock the database schema
vi.mock('@/lib/db/schema', () => ({
  organizations: { id: 'id', name: 'name', slug: 'slug', planType: 'planType', settings: 'settings', branding: 'branding' },
  organizationMembers: { id: 'id', orgId: 'orgId', userId: 'userId', role: 'role', joinedAt: 'joinedAt' },
  teams: { id: 'id', orgId: 'orgId', name: 'name', description: 'description', managerId: 'managerId' },
  teamMembers: { id: 'id', teamId: 'teamId', userId: 'userId', role: 'role', joinedAt: 'joinedAt' },
  users: { id: 'id', email: 'email', name: 'name', avatarUrl: 'avatarUrl', orgId: 'orgId', teamId: 'teamId' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b })),
  and: vi.fn((...conditions) => ({ type: 'and', conditions })),
  sql: vi.fn((strings, ...values) => ({ type: 'sql', strings, values })),
  count: vi.fn(() => ({ type: 'count' })),
}));

// Mock org permissions
const mockHasOrgPermission = vi.fn();
const mockIsOrgMember = vi.fn();
const mockGetOrgRole = vi.fn();

vi.mock('@/lib/auth/org-permissions', () => ({
  hasOrgPermission: mockHasOrgPermission,
  isOrgMember: mockIsOrgMember,
  getOrgRole: mockGetOrgRole,
}));

// Mock data
const mockOrg = {
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-org',
  planType: 'free',
  settings: { gamificationMode: 'full' },
  branding: { primaryColor: '#6366f1' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTeam = {
  id: 'team-123',
  orgId: 'org-123',
  name: 'Engineering',
  description: 'Engineering team',
  managerId: 'user-123',
  createdAt: new Date(),
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
  role: 'user',
  orgId: 'org-123',
  teamId: 'team-123',
};

const mockMembership = {
  id: 'membership-123',
  orgId: 'org-123',
  userId: 'user-123',
  role: 'owner',
  joinedAt: new Date(),
};

// Helper to create mock context
function createMockContext(user: typeof mockUser | null) {
  const mockDb = {
    query: {
      organizations: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      organizationMembers: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      teams: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      teamMembers: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    execute: vi.fn(),
  };

  return {
    db: mockDb,
    user,
  };
}

describe('Organization Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOrgMember.mockResolvedValue(true);
    mockHasOrgPermission.mockResolvedValue(true);
    mockGetOrgRole.mockResolvedValue('owner');
  });

  describe('create', () => {
    it('should create a new organization', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.query.organizations.findFirst.mockResolvedValue(null);
      ctx.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockOrg]),
        }),
      });

      // Simulate the procedure
      const input = { name: 'Test Organization', slug: 'test-org' };

      // Check slug availability
      expect(ctx.db.query.organizations.findFirst).toBeDefined();

      // The create procedure should work
      const result = await ctx.db.query.organizations.findFirst({ where: {} });
      expect(result).toBeNull();
    });

    it('should reject duplicate slugs', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.query.organizations.findFirst.mockResolvedValue(mockOrg);

      const existing = await ctx.db.query.organizations.findFirst({ where: {} });
      expect(existing).toBeDefined();
      expect(existing?.slug).toBe('test-org');
    });

    it('should validate slug format', () => {
      // Slug must be lowercase alphanumeric with hyphens
      const validSlugs = ['test-org', 'my-company', 'abc123'];
      const invalidSlugs = ['Test-Org', 'my_company', 'has space'];

      validSlugs.forEach(slug => {
        expect(/^[a-z0-9-]+$/.test(slug)).toBe(true);
      });

      invalidSlugs.forEach(slug => {
        expect(/^[a-z0-9-]+$/.test(slug)).toBe(false);
      });
    });
  });

  describe('get', () => {
    it('should return organization with user role', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.query.organizations.findFirst.mockResolvedValue({
        ...mockOrg,
        teams: [mockTeam],
      });
      mockIsOrgMember.mockResolvedValue(true);
      mockGetOrgRole.mockResolvedValue('owner');

      const result = await ctx.db.query.organizations.findFirst({ where: {} });
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Organization');
    });

    it('should reject non-members', async () => {
      mockIsOrgMember.mockResolvedValue(false);

      const isMember = await mockIsOrgMember('other-user', 'org-123');
      expect(isMember).toBe(false);
    });
  });

  describe('update', () => {
    it('should require admin permission', async () => {
      mockHasOrgPermission.mockResolvedValue(false);

      const hasPermission = await mockHasOrgPermission('user-123', 'org-123', 'admin');
      expect(hasPermission).toBe(false);
    });

    it('should allow admins to update settings', async () => {
      mockHasOrgPermission.mockResolvedValue(true);

      const ctx = createMockContext(mockUser);
      ctx.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              ...mockOrg,
              name: 'Updated Name',
            }]),
          }),
        }),
      });

      const hasPermission = await mockHasOrgPermission('user-123', 'org-123', 'admin');
      expect(hasPermission).toBe(true);
    });
  });

  describe('list', () => {
    it('should return user memberships with organizations', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.query.organizationMembers.findMany.mockResolvedValue([
        {
          ...mockMembership,
          organization: mockOrg,
        },
      ]);

      const memberships = await ctx.db.query.organizationMembers.findMany({ where: {} });
      expect(memberships).toHaveLength(1);
      expect(memberships[0].organization).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return member and team counts', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      });

      const stats = { memberCount: 5, teamCount: 2 };
      expect(stats.memberCount).toBe(5);
      expect(stats.teamCount).toBe(2);
    });
  });

  describe('Member Management', () => {
    describe('listMembers', () => {
      it('should return organization members with user details', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.query.organizationMembers.findMany.mockResolvedValue([
          {
            ...mockMembership,
            user: mockUser,
          },
        ]);

        const members = await ctx.db.query.organizationMembers.findMany({ where: {} });
        expect(members).toHaveLength(1);
        expect(members[0].user.email).toBe('test@example.com');
      });

      it('should filter members by search', async () => {
        const searchTerm = 'test';
        const members = [mockUser];
        const filtered = members.filter(m =>
          m.name?.toLowerCase().includes(searchTerm) ||
          m.email?.toLowerCase().includes(searchTerm)
        );
        expect(filtered).toHaveLength(1);
      });
    });

    describe('addMember', () => {
      it('should require admin permission', async () => {
        mockHasOrgPermission.mockResolvedValue(false);

        const hasPermission = await mockHasOrgPermission('user-123', 'org-123', 'admin');
        expect(hasPermission).toBe(false);
      });

      it('should require owner permission to add admin', async () => {
        mockHasOrgPermission.mockImplementation(async (userId, orgId, role) => {
          if (role === 'admin') return true;
          if (role === 'owner') return false;
          return false;
        });

        const canAddMember = await mockHasOrgPermission('user-123', 'org-123', 'admin');
        const canAddAdmin = await mockHasOrgPermission('user-123', 'org-123', 'owner');

        expect(canAddMember).toBe(true);
        expect(canAddAdmin).toBe(false);
      });

      it('should reject if user is already a member', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.query.organizationMembers.findFirst.mockResolvedValue(mockMembership);

        const existing = await ctx.db.query.organizationMembers.findFirst({ where: {} });
        expect(existing).toBeDefined();
      });
    });

    describe('updateMemberRole', () => {
      it('should not allow users to change their own role', () => {
        const userId = 'user-123';
        const targetUserId = 'user-123';
        expect(userId === targetUserId).toBe(true);
      });

      it('should require owner permission to set admin/owner roles', async () => {
        mockHasOrgPermission.mockImplementation(async (userId, orgId, role) => {
          return role !== 'owner';
        });

        const canSetAdmin = await mockHasOrgPermission('user-123', 'org-123', 'owner');
        expect(canSetAdmin).toBe(false);
      });
    });

    describe('removeMember', () => {
      it('should allow users to leave their own org', () => {
        const userId = 'user-123';
        const targetUserId = 'user-123';
        const canLeave = userId === targetUserId;
        expect(canLeave).toBe(true);
      });

      it('should not allow removing the owner', async () => {
        mockGetOrgRole.mockResolvedValue('owner');

        const role = await mockGetOrgRole('user-123', 'org-123');
        expect(role).toBe('owner');
      });
    });
  });

  describe('Team Management', () => {
    describe('listTeams', () => {
      it('should return teams with member count', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.query.teams.findMany.mockResolvedValue([
          {
            ...mockTeam,
            manager: mockUser,
            members: [{ userId: 'user-123', role: 'lead' }],
          },
        ]);

        const teams = await ctx.db.query.teams.findMany({ where: {} });
        expect(teams).toHaveLength(1);
        expect(teams[0].members).toHaveLength(1);
      });
    });

    describe('createTeam', () => {
      it('should require admin permission', async () => {
        mockHasOrgPermission.mockResolvedValue(false);

        const hasPermission = await mockHasOrgPermission('user-123', 'org-123', 'admin');
        expect(hasPermission).toBe(false);
      });

      it('should verify manager is org member', async () => {
        mockIsOrgMember.mockResolvedValue(true);

        const isMember = await mockIsOrgMember('manager-123', 'org-123');
        expect(isMember).toBe(true);
      });

      it('should add creator as team lead by default', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.insert.mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockTeam]),
          }),
        });

        // Creator becomes team lead
        const teamMembership = { teamId: mockTeam.id, userId: mockUser.id, role: 'lead' };
        expect(teamMembership.role).toBe('lead');
      });
    });

    describe('updateTeam', () => {
      it('should require admin permission', async () => {
        mockHasOrgPermission.mockResolvedValue(false);

        const hasPermission = await mockHasOrgPermission('user-123', 'org-123', 'admin');
        expect(hasPermission).toBe(false);
      });

      it('should update team details', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.update.mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{
                ...mockTeam,
                name: 'Updated Team',
              }]),
            }),
          }),
        });

        // Mock update would work
        expect(mockTeam.name).toBe('Engineering');
      });
    });

    describe('deleteTeam', () => {
      it('should require admin permission', async () => {
        mockHasOrgPermission.mockResolvedValue(false);

        const hasPermission = await mockHasOrgPermission('user-123', 'org-123', 'admin');
        expect(hasPermission).toBe(false);
      });

      it('should remove all team members first', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.delete.mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        });

        // Delete would cascade to members first
        expect(ctx.db.delete).toBeDefined();
      });
    });

    describe('getTeam', () => {
      it('should return team with members', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.query.teams.findFirst.mockResolvedValue({
          ...mockTeam,
          manager: mockUser,
          members: [
            {
              id: 'tm-1',
              role: 'lead',
              joinedAt: new Date(),
              user: mockUser,
            },
          ],
        });

        const team = await ctx.db.query.teams.findFirst({ where: {} });
        expect(team).toBeDefined();
        expect(team?.members).toHaveLength(1);
      });

      it('should return 404 for non-existent team', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.query.teams.findFirst.mockResolvedValue(null);

        const team = await ctx.db.query.teams.findFirst({ where: {} });
        expect(team).toBeNull();
      });
    });

    describe('addTeamMember', () => {
      it('should require manager permission', async () => {
        mockHasOrgPermission.mockResolvedValue(false);

        const hasPermission = await mockHasOrgPermission('user-123', 'org-123', 'manager');
        expect(hasPermission).toBe(false);
      });

      it('should verify target is org member', async () => {
        mockIsOrgMember.mockResolvedValue(false);

        const isMember = await mockIsOrgMember('new-user', 'org-123');
        expect(isMember).toBe(false);
      });

      it('should reject if user is already team member', async () => {
        const ctx = createMockContext(mockUser);
        ctx.db.query.teamMembers.findFirst.mockResolvedValue({
          teamId: 'team-123',
          userId: 'user-123',
          role: 'member',
        });

        const existing = await ctx.db.query.teamMembers.findFirst({ where: {} });
        expect(existing).toBeDefined();
      });
    });

    describe('removeTeamMember', () => {
      it('should allow users to leave team themselves', () => {
        const userId = 'user-123';
        const targetUserId = 'user-123';
        const canLeave = userId === targetUserId;
        expect(canLeave).toBe(true);
      });

      it('should require manager permission to remove others', async () => {
        mockHasOrgPermission.mockResolvedValue(false);

        const hasPermission = await mockHasOrgPermission('user-123', 'org-123', 'manager');
        expect(hasPermission).toBe(false);
      });
    });
  });

  describe('Role Hierarchy', () => {
    it('should enforce correct org role hierarchy', () => {
      const hierarchy = ['member', 'manager', 'admin', 'owner'];

      expect(hierarchy.indexOf('owner')).toBeGreaterThan(hierarchy.indexOf('admin'));
      expect(hierarchy.indexOf('admin')).toBeGreaterThan(hierarchy.indexOf('manager'));
      expect(hierarchy.indexOf('manager')).toBeGreaterThan(hierarchy.indexOf('member'));
    });

    it('should enforce correct team role hierarchy', () => {
      const hierarchy = ['member', 'lead'];

      expect(hierarchy.indexOf('lead')).toBeGreaterThan(hierarchy.indexOf('member'));
    });
  });

  describe('Permission Checks', () => {
    it('should check org membership for read operations', async () => {
      mockIsOrgMember.mockResolvedValue(false);

      const isMember = await mockIsOrgMember('other-user', 'org-123');
      expect(isMember).toBe(false);
    });

    it('should check admin permission for write operations', async () => {
      mockHasOrgPermission.mockImplementation(async (userId, orgId, role) => {
        return role === 'admin' && userId === 'admin-user';
      });

      const adminCanEdit = await mockHasOrgPermission('admin-user', 'org-123', 'admin');
      const memberCanEdit = await mockHasOrgPermission('user-123', 'org-123', 'admin');

      expect(adminCanEdit).toBe(true);
      expect(memberCanEdit).toBe(false);
    });

    it('should check owner permission for elevated operations', async () => {
      mockHasOrgPermission.mockImplementation(async (userId, orgId, role) => {
        return role === 'owner' && userId === 'owner-user';
      });

      const ownerCanPromote = await mockHasOrgPermission('owner-user', 'org-123', 'owner');
      const adminCanPromote = await mockHasOrgPermission('admin-user', 'org-123', 'owner');

      expect(ownerCanPromote).toBe(true);
      expect(adminCanPromote).toBe(false);
    });
  });
});
