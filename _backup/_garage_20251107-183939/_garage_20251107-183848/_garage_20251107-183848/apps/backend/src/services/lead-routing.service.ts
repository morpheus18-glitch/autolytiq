import {
  LeadPriority,
  LeadSource,
  LeadStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { subDays } from 'date-fns';
import { z } from 'zod';
import { emitTenantEvent } from '../lib/socket';
import { getTenantId, prisma } from '../lib/prisma';
import { triggerAutomations } from './automation.service';

const CLOSED_LEAD_STATUSES = [
  LeadStatus.WON,
  LeadStatus.LOST,
  LeadStatus.ARCHIVED,
  LeadStatus.CUSTOMER,
];

const DEFAULT_MAX_ACTIVE_LEADS = 40;
const LEAD_ROUTING_SECTION_KEY = 'leadRouting';

const leadRoutingTriggerSchema = z.enum(['LEAD_CREATED', 'SCORE_UPDATED', 'MANUAL']);

const hourWindowSchema = z.object({
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(0).max(23),
  startMinute: z.number().int().min(0).max(59).optional(),
  endMinute: z.number().int().min(0).max(59).optional(),
  timeZone: z.string().min(2).optional(),
  days: z.array(z.number().int().min(0).max(6)).optional(),
});

const territorySchema = z.object({
  zipPrefix: z.string().trim().min(2),
  userId: z.string().trim().min(1),
});

const teamDefinitionSchema = z.union([
  z.object({
    type: z.literal('ROLE'),
    role: z.nativeEnum(UserRole),
  }),
  z.object({
    type: z.literal('STATIC'),
    userIds: z.array(z.string().trim().min(1)).nonempty(),
  }),
]);

const assignmentStrategySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('TEAM_ROUND_ROBIN'),
    team: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal('TOP_PERFORMER'),
    team: z.string().trim().min(1),
    windowDays: z.number().int().min(1).max(180).optional(),
  }),
  z.object({
    type: z.literal('DIRECT'),
    userId: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal('ROUND_ROBIN'),
    userIds: z.array(z.string().trim().min(1)).nonempty(),
    key: z.string().trim().min(1).optional(),
  }),
  z.object({
    type: z.literal('TERRITORY'),
    territories: z.array(territorySchema).nonempty().optional(),
  }),
]);

type AssignmentStrategy = z.infer<typeof assignmentStrategySchema>;

const leadRoutingRuleSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  priority: z.number().int().default(0),
  conditions: z
    .object({
      triggers: z.array(leadRoutingTriggerSchema).optional(),
      sources: z.array(z.nativeEnum(LeadSource)).optional(),
      minScore: z.number().optional(),
      maxScore: z.number().optional(),
      scoreDeltaGte: z.number().optional(),
      zipPrefixes: z.array(z.string().trim().min(2)).optional(),
      hourWindows: z.array(hourWindowSchema).optional(),
    })
    .default({}),
  assignment: assignmentStrategySchema,
  fallback: assignmentStrategySchema.optional(),
});

type LeadRoutingRule = z.infer<typeof leadRoutingRuleSchema>;

type TeamDefinition = z.infer<typeof teamDefinitionSchema>;

const leadRoutingConfigSchema = z.object({
  rules: z.array(leadRoutingRuleSchema).default([]),
  defaultRule: assignmentStrategySchema.optional(),
  teams: z.record(teamDefinitionSchema).default({}),
  availability: z
    .object({
      defaultMaxActiveLeads: z.number().int().min(1).default(DEFAULT_MAX_ACTIVE_LEADS),
      userCaps: z.record(z.number().int().min(1)).default({}),
    })
    .default({ defaultMaxActiveLeads: DEFAULT_MAX_ACTIVE_LEADS, userCaps: {} }),
  territories: z.array(territorySchema).default([]),
  topPerformerWindowDays: z.number().int().min(1).max(365).default(30),
  timeZone: z.string().min(2).optional(),
});

export type LeadRoutingConfig = z.infer<typeof leadRoutingConfigSchema>;

const DEFAULT_LEAD_ROUTING_CONFIG: LeadRoutingConfig = {
  teams: {
    BDC: { type: 'ROLE', role: UserRole.BDC },
    SALES: { type: 'ROLE', role: UserRole.SALES },
    NIGHT_TEAM: { type: 'ROLE', role: UserRole.BDC },
  },
  availability: {
    defaultMaxActiveLeads: DEFAULT_MAX_ACTIVE_LEADS,
    userCaps: {},
  },
  territories: [],
  topPerformerWindowDays: 30,
  rules: [
    {
      id: 'after-hours-night-team',
      name: 'After-hours leads go to night team',
      priority: 200,
      conditions: {
        hourWindows: [
          {
            startHour: 20,
            endHour: 7,
          },
        ],
      },
      assignment: {
        type: 'TEAM_ROUND_ROBIN',
        team: 'NIGHT_TEAM',
      },
    },
    {
      id: 'hot-website-top-performer',
      name: 'Hot website leads go to top performer',
      priority: 100,
      conditions: {
        sources: [LeadSource.WEBSITE],
        minScore: 80,
      },
      assignment: {
        type: 'TOP_PERFORMER',
        team: 'SALES',
        windowDays: 30,
      },
      fallback: {
        type: 'TEAM_ROUND_ROBIN',
        team: 'SALES',
      },
    },
  ],
  defaultRule: {
    type: 'TEAM_ROUND_ROBIN',
    team: 'BDC',
  },
};

type LeadRoutingTrigger = z.infer<typeof leadRoutingTriggerSchema>;

type RoundRobinState = Record<string, string>;

type PrismaClientOrTransaction = typeof prisma | Prisma.TransactionClient;

type LeadWithCustomer = Prisma.LeadGetPayload<{
  include: {
    customer: {
      select: {
        addressZip: true;
      };
    };
    assignedTo: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        role: true;
      };
    };
  };
}>;

interface AssignmentCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: UserRole;
  activeLeadCount: number;
  capacity: number;
}

interface LeadRoutingEvaluationOptions {
  trigger: LeadRoutingTrigger;
  score?: number | null;
  scoreDelta?: number | null;
  occurredAt?: Date;
}

interface AssignmentResolution {
  candidate: AssignmentCandidate;
  strategy: string;
  reason: string;
  rule?: LeadRoutingRule;
  roundRobinKey?: string;
}

export interface LeadRoutingResult {
  leadId: string;
  assignedToId: string;
  previousAssignedToId: string | null;
  ruleId: string | null;
  ruleName: string | null;
  strategy: string;
  reason: string;
  candidate: AssignmentCandidate;
}

const simulationInputSchema = z.object({
  leadId: z.string().optional(),
  source: z.nativeEnum(LeadSource).optional(),
  score: z.number().optional(),
  scoreDelta: z.number().optional(),
  zip: z.string().trim().min(2).optional(),
  trigger: leadRoutingTriggerSchema.default('MANUAL'),
  occurredAt: z.coerce.date().optional(),
});

export type LeadRoutingSimulationInput = z.infer<typeof simulationInputSchema>;

function ensureTenantId(): string {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error('Tenant context is required for lead routing');
  }
  return tenantId;
}

function cloneValue<T>(value: T): T {
  const globalClone = (globalThis as unknown as { structuredClone?: (input: unknown) => unknown }).structuredClone;
  if (typeof globalClone === 'function') {
    return globalClone(value) as T;
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneSettings(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return cloneValue(value) as Record<string, unknown>;
}

function extractLeadRoutingSection(settings: Record<string, unknown>): Record<string, unknown> {
  const section = settings[LEAD_ROUTING_SECTION_KEY];
  if (!section || typeof section !== 'object' || Array.isArray(section)) {
    return {};
  }
  return cloneValue(section) as Record<string, unknown>;
}

function extractRoundRobinState(section: Record<string, unknown>): RoundRobinState {
  const state = section.roundRobin;
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return {};
  }
  const cloned = cloneValue(state) as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(cloned)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([key, value]) => [key, value as string]),
  );
}

function extractConfig(section: Record<string, unknown>): LeadRoutingConfig | undefined {
  const config = section.config;
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return undefined;
  }
  try {
    return leadRoutingConfigSchema.parse(config);
  } catch (error) {
    console.warn('Invalid lead routing configuration detected. Falling back to defaults.', error);
    return undefined;
  }
}

function extractTimeZone(settings: Record<string, unknown>, config?: LeadRoutingConfig): string {
  if (config?.timeZone) {
    return config.timeZone;
  }
  const direct = settings.timezone;
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct;
  }
  const section = extractLeadRoutingSection(settings);
  const sectionTz = section.timeZone;
  if (typeof sectionTz === 'string' && sectionTz.trim().length > 0) {
    return sectionTz;
  }
  return 'UTC';
}

async function persistLeadRoutingSettings(
  client: PrismaClientOrTransaction,
  tenantId: string,
  settingsValue: Prisma.InputJsonValue,
): Promise<void> {
  await client.tenant.update({
    where: { id: tenantId },
    data: { settings: settingsValue },
  });
}

function mergeLeadRoutingSettings(
  existingSettings: Prisma.JsonValue | null | undefined,
  updates: Partial<{ config: LeadRoutingConfig; roundRobin: RoundRobinState; timeZone?: string }>,
): Prisma.InputJsonValue {
  const settings = cloneSettings(existingSettings);
  const section = extractLeadRoutingSection(settings);
  const nextSection = { ...section, ...updates };
  settings[LEAD_ROUTING_SECTION_KEY] = nextSection;
  return settings as Prisma.InputJsonValue;
}

async function loadLeadRoutingContext(tenantId: string): Promise<{
  config: LeadRoutingConfig;
  roundRobin: RoundRobinState;
  timeZone: string;
}> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  const settings = cloneSettings(tenant?.settings ?? null);
  const section = extractLeadRoutingSection(settings);
  const config = extractConfig(section) ?? (cloneValue(DEFAULT_LEAD_ROUTING_CONFIG) as LeadRoutingConfig);
  const roundRobin = extractRoundRobinState(section);
  const timeZone = extractTimeZone(settings, config);

  if (!section.config) {
    const nextSettings = mergeLeadRoutingSettings(tenant?.settings ?? null, { config });
    await persistLeadRoutingSettings(prisma, tenantId, nextSettings);
  }

  return { config, roundRobin, timeZone };
}

async function updateRoundRobinState(
  tenantId: string,
  key: string,
  userId: string,
  client: PrismaClientOrTransaction = prisma,
): Promise<void> {
  const tenant = await client.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  const settings = cloneSettings(tenant?.settings ?? null);
  const section = extractLeadRoutingSection(settings);
  const current = extractRoundRobinState(section);
  const nextState: RoundRobinState = { ...current, [key]: userId };
  const nextSettings = mergeLeadRoutingSettings(tenant?.settings ?? null, { roundRobin: nextState });
  await persistLeadRoutingSettings(client, tenantId, nextSettings);
}

function mapTeamToRole(team: string): UserRole | undefined {
  const normalized = team.toUpperCase();
  switch (normalized) {
    case 'BDC':
      return UserRole.BDC;
    case 'SALES':
      return UserRole.SALES;
    case 'NIGHT_TEAM':
      return UserRole.BDC;
    default:
      return undefined;
  }
}

async function loadUsersByIds(
  tenantId: string,
  userIds: string[],
): Promise<Array<Pick<AssignmentCandidate, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>>> {
  if (userIds.length === 0) {
    return [];
  }
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, tenantId, status: UserStatus.ACTIVE },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });
  return users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email ?? null,
    role: user.role,
  }));
}

async function loadUsersByRole(
  tenantId: string,
  role: UserRole,
): Promise<Array<Pick<AssignmentCandidate, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>>> {
  const users = await prisma.user.findMany({
    where: { tenantId, role, status: UserStatus.ACTIVE },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
  return users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email ?? null,
    role: user.role,
  }));
}

async function buildCandidates(
  tenantId: string,
  users: Array<Pick<AssignmentCandidate, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>>,
  config: LeadRoutingConfig,
): Promise<AssignmentCandidate[]> {
  if (users.length === 0) {
    return [];
  }

  const caps = config.availability.userCaps ?? {};
  const defaultCap = config.availability.defaultMaxActiveLeads ?? DEFAULT_MAX_ACTIVE_LEADS;
  const ids = users.map((user) => user.id);
  const workloads = await prisma.lead.groupBy({
    by: ['assignedToId'],
    where: {
      tenantId,
      assignedToId: { in: ids },
      status: { notIn: CLOSED_LEAD_STATUSES },
      isArchived: false,
    },
    _count: { _all: true },
  });
  const workloadMap = new Map<string, number>();
  for (const workload of workloads) {
    if (workload.assignedToId) {
      workloadMap.set(workload.assignedToId, workload._count._all);
    }
  }

  return users
    .map((user) => {
      const activeLeadCount = workloadMap.get(user.id) ?? 0;
      const capacity = caps[user.id] ?? defaultCap;
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        activeLeadCount,
        capacity,
      } satisfies AssignmentCandidate;
    })
    .filter((candidate) => candidate.activeLeadCount < candidate.capacity);
}

async function resolveTeamCandidates(
  tenantId: string,
  team: string,
  config: LeadRoutingConfig,
): Promise<AssignmentCandidate[]> {
  const definition: TeamDefinition | undefined = config.teams?.[team];
  if (definition?.type === 'STATIC') {
    const users = await loadUsersByIds(tenantId, definition.userIds);
    return buildCandidates(tenantId, users, config);
  }

  const role = definition?.type === 'ROLE' ? definition.role : mapTeamToRole(team);
  if (!role) {
    return [];
  }
  const users = await loadUsersByRole(tenantId, role);
  return buildCandidates(tenantId, users, config);
}

async function resolveSpecificCandidates(
  tenantId: string,
  userIds: string[],
  config: LeadRoutingConfig,
): Promise<AssignmentCandidate[]> {
  const users = await loadUsersByIds(tenantId, userIds);
  return buildCandidates(tenantId, users, config);
}

function computeNextRoundRobinCandidate(
  candidates: AssignmentCandidate[],
  roundRobin: RoundRobinState,
  key: string,
): AssignmentCandidate | undefined {
  if (candidates.length === 0) {
    return undefined;
  }
  const lastId = roundRobin[key];
  if (!lastId) {
    return candidates[0];
  }
  const index = candidates.findIndex((candidate) => candidate.id === lastId);
  if (index === -1 || index === candidates.length - 1) {
    return candidates[0];
  }
  return candidates[index + 1];
}

async function resolveTopPerformer(
  tenantId: string,
  candidates: AssignmentCandidate[],
  config: LeadRoutingConfig,
  strategy: Extract<AssignmentStrategy, { type: 'TOP_PERFORMER' }>,
  options: LeadRoutingEvaluationOptions,
): Promise<AssignmentCandidate | undefined> {
  if (candidates.length === 0) {
    return undefined;
  }

  const windowSize = Math.max(1, strategy.windowDays ?? config.topPerformerWindowDays ?? 30);
  const since = subDays(options.occurredAt ?? new Date(), windowSize);
  const ids = candidates.map((candidate) => candidate.id);

  const totals = await prisma.lead.groupBy({
    by: ['assignedToId'],
    where: {
      tenantId,
      assignedToId: { in: ids },
      updatedAt: { gte: since },
      status: { in: [LeadStatus.WON, LeadStatus.LOST] },
    },
    _count: { _all: true },
  });
  const wins = await prisma.lead.groupBy({
    by: ['assignedToId'],
    where: {
      tenantId,
      assignedToId: { in: ids },
      updatedAt: { gte: since },
      status: LeadStatus.WON,
    },
    _count: { _all: true },
  });
  const totalMap = new Map<string, number>();
  const winMap = new Map<string, number>();
  for (const entry of totals) {
    if (entry.assignedToId) {
      totalMap.set(entry.assignedToId, entry._count._all);
    }
  }
  for (const entry of wins) {
    if (entry.assignedToId) {
      winMap.set(entry.assignedToId, entry._count._all);
    }
  }

  let best: AssignmentCandidate | undefined;
  let bestRate = -1;
  let bestWins = -1;
  for (const candidate of candidates) {
    const total = totalMap.get(candidate.id) ?? 0;
    const winCount = winMap.get(candidate.id) ?? 0;
    const winRate = total === 0 ? 0 : winCount / total;
    if (
      winRate > bestRate ||
      (winRate === bestRate && winCount > bestWins) ||
      (winRate === bestRate && winCount === bestWins && candidate.activeLeadCount < (best?.activeLeadCount ?? Infinity))
    ) {
      best = candidate;
      bestRate = winRate;
      bestWins = winCount;
    }
  }

  return best ?? candidates[0];
}

function getRoundRobinKey(scope: string, identifier: string): string {
  return `${scope}:${identifier}`;
}

function isWithinHourWindow(date: Date, window: z.infer<typeof hourWindowSchema>, timeZone: string): boolean {
  const zone = window.timeZone ?? timeZone;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  });
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((part) => part.type === 'hour');
  const minutePart = parts.find((part) => part.type === 'minute');
  const weekdayPart = parts.find((part) => part.type === 'weekday');
  const hour = hourPart ? Number.parseInt(hourPart.value, 10) : 0;
  const minute = minutePart ? Number.parseInt(minutePart.value, 10) : 0;
  const totalMinutes = hour * 60 + minute;
  const start = window.startHour * 60 + (window.startMinute ?? 0);
  const end = window.endHour * 60 + (window.endMinute ?? 0);

  if (window.days && weekdayPart) {
    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const currentDay = dayMap[weekdayPart.value as keyof typeof dayMap];
    if (currentDay === undefined || !window.days.includes(currentDay)) {
      return false;
    }
  }

  if (start <= end) {
    return totalMinutes >= start && totalMinutes < end;
  }

  return totalMinutes >= start || totalMinutes < end;
}

function matchesRule(
  rule: LeadRoutingRule,
  lead: LeadWithCustomer,
  options: LeadRoutingEvaluationOptions,
  timeZone: string,
): boolean {
  const { conditions } = rule;
  const score = options.score ?? lead.score ?? null;
  const scoreDelta = options.scoreDelta ?? null;

  if (conditions.triggers && !conditions.triggers.includes(options.trigger)) {
    return false;
  }

  if (conditions.sources && lead.source && !conditions.sources.includes(lead.source)) {
    return false;
  }

  if (conditions.minScore !== undefined && (score ?? -Infinity) < conditions.minScore) {
    return false;
  }

  if (conditions.maxScore !== undefined && (score ?? Infinity) > conditions.maxScore) {
    return false;
  }

  if (conditions.scoreDeltaGte !== undefined && Math.abs(scoreDelta ?? 0) < conditions.scoreDeltaGte) {
    return false;
  }

  if (conditions.zipPrefixes && conditions.zipPrefixes.length > 0) {
    const zip = lead.customer?.addressZip ?? '';
    if (!conditions.zipPrefixes.some((prefix) => zip.startsWith(prefix))) {
      return false;
    }
  }

  if (conditions.hourWindows && conditions.hourWindows.length > 0) {
    const matched = conditions.hourWindows.some((window) => isWithinHourWindow(options.occurredAt ?? new Date(), window, timeZone));
    if (!matched) {
      return false;
    }
  }

  return true;
}

async function resolveAssignment(
  tenantId: string,
  lead: LeadWithCustomer,
  config: LeadRoutingConfig,
  roundRobin: RoundRobinState,
  options: LeadRoutingEvaluationOptions,
  rule: LeadRoutingRule | null,
  strategy: AssignmentStrategy,
): Promise<AssignmentResolution | null> {
  switch (strategy.type) {
    case 'DIRECT': {
      const candidates = await resolveSpecificCandidates(tenantId, [strategy.userId], config);
      const candidate = candidates[0];
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: 'direct',
        reason: `Direct assignment to ${candidate.firstName} ${candidate.lastName}`,
        rule: rule ?? undefined,
      };
    }
    case 'ROUND_ROBIN': {
      const candidates = await resolveSpecificCandidates(tenantId, strategy.userIds, config);
      const key = getRoundRobinKey('list', strategy.key ?? strategy.userIds.sort().join(','));
      const candidate = computeNextRoundRobinCandidate(candidates, roundRobin, key);
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: 'round_robin',
        reason: `Round robin rotation across ${candidates.length} teammates`,
        rule: rule ?? undefined,
        roundRobinKey: key,
      };
    }
    case 'TEAM_ROUND_ROBIN': {
      const candidates = await resolveTeamCandidates(tenantId, strategy.team, config);
      const key = getRoundRobinKey('team', strategy.team.toUpperCase());
      const candidate = computeNextRoundRobinCandidate(candidates, roundRobin, key);
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: `team_round_robin:${strategy.team}`,
        reason: `Team ${strategy.team.toUpperCase()} round robin assignment`,
        rule: rule ?? undefined,
        roundRobinKey: key,
      };
    }
    case 'TOP_PERFORMER': {
      const candidates = await resolveTeamCandidates(tenantId, strategy.team, config);
      const candidate = await resolveTopPerformer(tenantId, candidates, config, strategy, options);
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: `top_performer:${strategy.team}`,
        reason: `Top performer selected from ${strategy.team.toUpperCase()} based on recent win rate`,
        rule: rule ?? undefined,
      };
    }
    case 'TERRITORY': {
      const territories = strategy.territories && strategy.territories.length > 0 ? strategy.territories : config.territories;
      if (!territories || territories.length === 0) {
        return null;
      }
      const zip = lead.customer?.addressZip ?? '';
      const match = territories
        .filter((territory) => zip.startsWith(territory.zipPrefix))
        .sort((a, b) => b.zipPrefix.length - a.zipPrefix.length)[0];
      if (!match) {
        return null;
      }
      const candidates = await resolveSpecificCandidates(tenantId, [match.userId], config);
      const candidate = candidates[0];
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: 'territory',
        reason: `Zip ${zip} matched to territory prefix ${match.zipPrefix}`,
        rule: rule ?? undefined,
      };
    }
    default:
      return null;
  }
}

async function evaluateRouting(
  tenantId: string,
  lead: LeadWithCustomer,
  config: LeadRoutingConfig,
  roundRobin: RoundRobinState,
  options: LeadRoutingEvaluationOptions,
  timeZone: string,
): Promise<AssignmentResolution | null> {
  const rules = [...config.rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  for (const rule of rules) {
    if (!matchesRule(rule, lead, options, timeZone)) {
      continue;
    }
    const primary = await resolveAssignment(tenantId, lead, config, roundRobin, options, rule, rule.assignment);
    if (primary) {
      primary.reason = `Rule "${rule.name}" satisfied. ${primary.reason}`;
      return primary;
    }
    if (rule.fallback) {
      const fallback = await resolveAssignment(tenantId, lead, config, roundRobin, options, rule, rule.fallback);
      if (fallback) {
        fallback.reason = `Rule "${rule.name}" fallback applied. ${fallback.reason}`;
        return fallback;
      }
    }
  }

  if (config.defaultRule) {
    const fallback = await resolveAssignment(tenantId, lead, config, roundRobin, options, null, config.defaultRule);
    if (fallback) {
      fallback.reason = `Default routing applied. ${fallback.reason}`;
      return fallback;
    }
  }

  return null;
}

async function fetchLeadForRouting(leadId: string): Promise<LeadWithCustomer | null> {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      customer: { select: { addressZip: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
    },
  });
}

export async function evaluateLeadRoutingForLead(
  leadId: string,
  options: LeadRoutingEvaluationOptions,
): Promise<LeadRoutingResult | null> {
  const tenantId = ensureTenantId();
  const lead = await fetchLeadForRouting(leadId);
  if (!lead) {
    return null;
  }

  const { config, roundRobin, timeZone } = await loadLeadRoutingContext(tenantId);
  const resolution = await evaluateRouting(tenantId, lead, config, roundRobin, options, timeZone);
  if (!resolution) {
    return null;
  }

  if (lead.assignedToId === resolution.candidate.id) {
    if (resolution.roundRobinKey) {
      await updateRoundRobinState(tenantId, resolution.roundRobinKey, resolution.candidate.id);
    }
    return {
      leadId: lead.id,
      assignedToId: resolution.candidate.id,
      previousAssignedToId: lead.assignedToId ?? null,
      ruleId: resolution.rule?.id ?? null,
      ruleName: resolution.rule?.name ?? null,
      strategy: resolution.strategy,
      reason: resolution.reason,
      candidate: resolution.candidate,
    };
  }

  const updatedLead = await prisma.$transaction(async (tx) => {
    const saved = await tx.lead.update({
      where: { id: lead.id },
      data: { assignedToId: resolution.candidate.id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });
    if (resolution.roundRobinKey) {
      await updateRoundRobinState(tenantId, resolution.roundRobinKey, resolution.candidate.id, tx);
    }
    return saved;
  });

  emitTenantEvent(tenantId, 'lead:assigned', {
    leadId: lead.id,
    assignedToId: updatedLead.assignedToId,
    previousAssignedToId: lead.assignedToId ?? null,
    ruleId: resolution.rule?.id ?? null,
    ruleName: resolution.rule?.name ?? null,
    strategy: resolution.strategy,
  });

  return {
    leadId: lead.id,
    assignedToId: updatedLead.assignedToId!,
    previousAssignedToId: lead.assignedToId ?? null,
    ruleId: resolution.rule?.id ?? null,
    ruleName: resolution.rule?.name ?? null,
    strategy: resolution.strategy,
    reason: resolution.reason,
    candidate: resolution.candidate,
  };
}

export async function handleLeadCreated(leadId: string): Promise<LeadRoutingResult | null> {
  const occurredAt = new Date();
  const result = await evaluateLeadRoutingForLead(leadId, { trigger: 'LEAD_CREATED', occurredAt });
  try {
    await triggerAutomations('NEW_LEAD', { leadId, occurredAt });
  } catch (error) {
    console.error('Failed to trigger new lead automations', error);
  }
  return result;
}

export async function handleLeadScoreChange(
  leadId: string,
  score: number,
  scoreDelta: number,
): Promise<LeadRoutingResult | null> {
  const occurredAt = new Date();
  const result = await evaluateLeadRoutingForLead(leadId, {
    trigger: 'SCORE_UPDATED',
    score,
    scoreDelta,
    occurredAt,
  });
  try {
    await triggerAutomations('LEAD_SCORE_DELTA', { leadId, score, scoreDelta, occurredAt });
  } catch (error) {
    console.error('Failed to trigger lead score automations', error);
  }
  return result;
}

export async function simulateLeadRouting(
  input: LeadRoutingSimulationInput,
): Promise<LeadRoutingResult | null> {
  const parsed = simulationInputSchema.parse(input);
  const tenantId = ensureTenantId();
  const { config, roundRobin, timeZone } = await loadLeadRoutingContext(tenantId);

  const lead: LeadWithCustomer = {
    id: parsed.leadId ?? `sim-${Date.now()}`,
    tenantId,
    customerId: null,
    assignedToId: null,
    ownerId: null,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    status: LeadStatus.NEW,
    source: parsed.source ?? LeadSource.WEBSITE,
    priority: LeadPriority.MEDIUM,
    rating: null,
    score: parsed.score ?? null,
    smsOptOut: false,
    emailOptOut: false,
    callOptOut: false,
    isArchived: false,
    isConverted: false,
    lastActivityAt: null,
    lastCommunicationAt: null,
    nextActionAt: null,
    convertedAt: null,
    description: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: { addressZip: parsed.zip ?? null },
    assignedTo: null,
  };

  const options: LeadRoutingEvaluationOptions = {
    trigger: parsed.trigger,
    score: parsed.score ?? null,
    scoreDelta: parsed.scoreDelta ?? null,
    occurredAt: parsed.occurredAt ?? new Date(),
  };

  const resolution = await evaluateRouting(tenantId, lead, config, roundRobin, options, timeZone);
  if (!resolution) {
    return null;
  }

  return {
    leadId: lead.id,
    assignedToId: resolution.candidate.id,
    previousAssignedToId: null,
    ruleId: resolution.rule?.id ?? null,
    ruleName: resolution.rule?.name ?? null,
    strategy: resolution.strategy,
    reason: resolution.reason,
    candidate: resolution.candidate,
  };
}
