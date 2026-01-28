import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  organizations,
  teams,
  organizationMembers,
  teamMembers,
  users,
} from '@/lib/db/schema';
import { eq, and, sql, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import {
  hasOrgPermission,
  isOrgMember,
  getOrgRole,
} from '@/lib/auth/org-permissions';
import type { OrgRole, TeamRole } from '@/lib/db/schema';

// Input schemas
const orgRoleSchema = z.enum(['owner', 'admin', 'manager', 'member']);
const teamRoleSchema = z.enum(['lead', 'member']);

export const organizationRouter = router({
  // Create new organization
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if slug is already taken
      const existing = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.slug, input.slug),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Organization slug is already taken',
        });
      }

      // Create organization
      const [org] = await ctx.db
        .insert(organizations)
        .values({
          name: input.name,
          slug: input.slug,
        })
        .returning();

      // Add creator as owner
      await ctx.db.insert(organizationMembers).values({
        orgId: org.id,
        userId: ctx.user.id,
        role: 'owner',
      });

      return org;
    }),

  // Get organization by ID
  get: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Check if user is member
      if (!await isOrgMember(ctx.user.id, input.orgId)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this organization' });
      }

      const org = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.id, input.orgId),
        with: {
          teams: true,
        },
      });

      if (!org) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
      }

      const userRole = await getOrgRole(ctx.user.id, input.orgId);

      return { ...org, userRole };
    }),

  // Update organization
  update: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      settings: z.object({
        gamificationMode: z.enum(['full', 'moderate', 'minimal', 'off']).optional(),
        requireApproval: z.boolean().optional(),
        allowSelfEnroll: z.boolean().optional(),
      }).optional(),
      branding: z.object({
        logo: z.string().url().optional(),
        primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        certificateLogo: z.string().url().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Require admin role
      if (!await hasOrgPermission(ctx.user.id, input.orgId, 'admin')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const [updated] = await ctx.db
        .update(organizations)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.settings && { settings: input.settings }),
          ...(input.branding && { branding: input.branding }),
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, input.orgId))
        .returning();

      return updated;
    }),

  // Get organization stats
  getStats: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (!await isOrgMember(ctx.user.id, input.orgId)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this organization' });
      }

      // Count members
      const [memberCount] = await ctx.db
        .select({ count: count() })
        .from(organizationMembers)
        .where(eq(organizationMembers.orgId, input.orgId));

      // Count teams
      const [teamCount] = await ctx.db
        .select({ count: count() })
        .from(teams)
        .where(eq(teams.orgId, input.orgId));

      // Get role distribution
      const members = await ctx.db.query.organizationMembers.findMany({
        where: eq(organizationMembers.orgId, input.orgId),
      });

      const roleDistribution: Record<string, number> = {
        owner: 0,
        admin: 0,
        manager: 0,
        member: 0,
      };

      members.forEach(m => {
        const role = m.role as string;
        if (role in roleDistribution) {
          roleDistribution[role]++;
        }
      });

      return {
        totalMembers: memberCount?.count || 0,
        totalTeams: teamCount?.count || 0,
        coursesEnrolled: 0, // Placeholder - would need course enrollment tracking
        completionRate: 0, // Placeholder - would need progress tracking
        roleDistribution,
      };
    }),

  // List user's organizations
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.query.organizationMembers.findMany({
      where: eq(organizationMembers.userId, ctx.user.id),
      with: {
        organization: true,
      },
    });

    return memberships.map(m => ({
      ...m.organization,
      role: m.role as OrgRole,
    }));
  }),

  // ============ Member Management ============

  // List organization members
  listMembers: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!await isOrgMember(ctx.user.id, input.orgId)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this organization' });
      }

      const members = await ctx.db.query.organizationMembers.findMany({
        where: eq(organizationMembers.orgId, input.orgId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Filter by search if provided
      let filteredMembers = members;
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredMembers = members.filter(m =>
          m.user?.name?.toLowerCase().includes(searchLower) ||
          m.user?.email?.toLowerCase().includes(searchLower)
        );
      }

      return filteredMembers.map(m => ({
        id: m.id,
        userId: m.userId,
        role: m.role as OrgRole,
        joinedAt: m.joinedAt,
        user: m.user,
      }));
    }),

  // Add member to organization
  addMember: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      email: z.string().email(),
      role: orgRoleSchema.default('member'),
    }))
    .mutation(async ({ ctx, input }) => {
      // Require admin role to add members
      if (!await hasOrgPermission(ctx.user.id, input.orgId, 'admin')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Only owner can add another owner/admin
      if (['owner', 'admin'].includes(input.role)) {
        if (!await hasOrgPermission(ctx.user.id, input.orgId, 'owner')) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Owner access required to add admins' });
        }
      }

      // Find user by email
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found with that email' });
      }

      // Check if already a member
      const existing = await ctx.db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.orgId, input.orgId),
          eq(organizationMembers.userId, user.id)
        ),
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User is already a member' });
      }

      // Add member
      const [membership] = await ctx.db
        .insert(organizationMembers)
        .values({
          orgId: input.orgId,
          userId: user.id,
          role: input.role,
        })
        .returning();

      // Update user's orgId
      await ctx.db
        .update(users)
        .set({ orgId: input.orgId })
        .where(eq(users.id, user.id));

      return membership;
    }),

  // Update member role
  updateMemberRole: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      userId: z.string().uuid(),
      role: orgRoleSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Can't change own role
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot change your own role' });
      }

      // Only owner can set owner/admin roles
      if (['owner', 'admin'].includes(input.role)) {
        if (!await hasOrgPermission(ctx.user.id, input.orgId, 'owner')) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Owner access required' });
        }
      } else {
        if (!await hasOrgPermission(ctx.user.id, input.orgId, 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
      }

      const [updated] = await ctx.db
        .update(organizationMembers)
        .set({ role: input.role })
        .where(and(
          eq(organizationMembers.orgId, input.orgId),
          eq(organizationMembers.userId, input.userId)
        ))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      return updated;
    }),

  // Remove member from organization
  removeMember: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Can leave own org, otherwise need admin
      if (input.userId !== ctx.user.id) {
        if (!await hasOrgPermission(ctx.user.id, input.orgId, 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
      }

      // Check if target is owner
      const targetRole = await getOrgRole(input.userId, input.orgId);
      if (targetRole === 'owner' && input.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot remove the organization owner' });
      }

      // Remove from all teams in this org first
      await ctx.db.execute(sql`
        DELETE FROM team_members
        WHERE user_id = ${input.userId}
        AND team_id IN (SELECT id FROM teams WHERE org_id = ${input.orgId})
      `);

      // Remove from org
      await ctx.db
        .delete(organizationMembers)
        .where(and(
          eq(organizationMembers.orgId, input.orgId),
          eq(organizationMembers.userId, input.userId)
        ));

      // Clear user's orgId
      await ctx.db
        .update(users)
        .set({ orgId: null, teamId: null })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // ============ Team Management ============

  // List teams in organization
  listTeams: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (!await isOrgMember(ctx.user.id, input.orgId)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this organization' });
      }

      const orgTeams = await ctx.db.query.teams.findMany({
        where: eq(teams.orgId, input.orgId),
        with: {
          manager: {
            columns: { id: true, name: true, avatarUrl: true },
          },
          members: true,
        },
      });

      return orgTeams.map(team => ({
        ...team,
        memberCount: team.members.length,
      }));
    }),

  // Create team
  createTeam: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      name: z.string().min(2).max(100),
      description: z.string().max(500).optional(),
      managerId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Require admin role to create teams
      if (!await hasOrgPermission(ctx.user.id, input.orgId, 'admin')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Verify manager is org member if specified
      if (input.managerId) {
        if (!await isOrgMember(input.managerId, input.orgId)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Manager must be an organization member' });
        }
      }

      const [team] = await ctx.db
        .insert(teams)
        .values({
          orgId: input.orgId,
          name: input.name,
          description: input.description,
          managerId: input.managerId || ctx.user.id,
        })
        .returning();

      // Add manager as team lead
      const leadId = input.managerId || ctx.user.id;
      await ctx.db.insert(teamMembers).values({
        teamId: team.id,
        userId: leadId,
        role: 'lead',
      });

      return team;
    }),

  // Update team
  updateTeam: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      teamId: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(500).optional(),
      managerId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!await hasOrgPermission(ctx.user.id, input.orgId, 'admin')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const [updated] = await ctx.db
        .update(teams)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.managerId && { managerId: input.managerId }),
        })
        .where(and(
          eq(teams.id, input.teamId),
          eq(teams.orgId, input.orgId)
        ))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' });
      }

      return updated;
    }),

  // Delete team
  deleteTeam: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      teamId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!await hasOrgPermission(ctx.user.id, input.orgId, 'admin')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Remove all team members first
      await ctx.db
        .delete(teamMembers)
        .where(eq(teamMembers.teamId, input.teamId));

      // Delete team
      await ctx.db
        .delete(teams)
        .where(and(
          eq(teams.id, input.teamId),
          eq(teams.orgId, input.orgId)
        ));

      return { success: true };
    }),

  // Get team details
  getTeam: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      teamId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      if (!await isOrgMember(ctx.user.id, input.orgId)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this organization' });
      }

      const team = await ctx.db.query.teams.findFirst({
        where: and(
          eq(teams.id, input.teamId),
          eq(teams.orgId, input.orgId)
        ),
        with: {
          manager: {
            columns: { id: true, name: true, email: true, avatarUrl: true },
          },
          members: {
            with: {
              user: {
                columns: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      });

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' });
      }

      return {
        ...team,
        members: team.members.map(m => ({
          id: m.id,
          userId: m.userId,
          role: m.role as TeamRole,
          joinedAt: m.joinedAt,
          user: m.user,
        })),
      };
    }),

  // Add member to team
  addTeamMember: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      teamId: z.string().uuid(),
      userId: z.string().uuid(),
      role: teamRoleSchema.default('member'),
    }))
    .mutation(async ({ ctx, input }) => {
      // Require manager role in org or team lead
      const isAdmin = await hasOrgPermission(ctx.user.id, input.orgId, 'manager');
      if (!isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
      }

      // Verify target is org member
      if (!await isOrgMember(input.userId, input.orgId)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User must be an organization member' });
      }

      // Check if already a team member
      const existing = await ctx.db.query.teamMembers.findFirst({
        where: and(
          eq(teamMembers.teamId, input.teamId),
          eq(teamMembers.userId, input.userId)
        ),
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User is already a team member' });
      }

      const [membership] = await ctx.db
        .insert(teamMembers)
        .values({
          teamId: input.teamId,
          userId: input.userId,
          role: input.role,
        })
        .returning();

      return membership;
    }),

  // Remove member from team
  removeTeamMember: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      teamId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await hasOrgPermission(ctx.user.id, input.orgId, 'manager');
      if (!isAdmin && input.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
      }

      await ctx.db
        .delete(teamMembers)
        .where(and(
          eq(teamMembers.teamId, input.teamId),
          eq(teamMembers.userId, input.userId)
        ));

      return { success: true };
    }),
});
