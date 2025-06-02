// TalentSol ATS - GraphQL Job Resolver
import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Int, Field, ObjectType, InputType } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { getCachedResult, generateCacheKey, CACHE_TTL } from '../graphql_api.js';

// GraphQL Types
@ObjectType()
class Job {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  department: string;

  @Field()
  location: string;

  @Field()
  employmentType: string;

  @Field()
  experienceLevel: string;

  @Field()
  salaryMin: number;

  @Field()
  salaryMax: number;

  @Field()
  status: string;

  @Field()
  postedDate: Date;

  @Field()
  applicationDeadline: Date;

  @Field(() => [String])
  requiredSkills: string[];

  @Field(() => [String])
  preferredSkills: string[];

  @Field(() => Company)
  company: Company;

  @Field(() => [Application])
  applications: Application[];

  @Field(() => Int)
  applicationCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
class Company {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  logo: string;

  @Field()
  website: string;
}

@ObjectType()
class Application {
  @Field()
  id: string;

  @Field()
  status: string;

  @Field()
  submittedAt: Date;

  @Field(() => Candidate)
  candidate: Candidate;
}

@ObjectType()
class Candidate {
  @Field()
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;
}

@ObjectType()
class JobsResponse {
  @Field(() => [Job])
  jobs: Job[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
class JobAnalytics {
  @Field(() => Int)
  totalViews: number;

  @Field(() => Int)
  totalApplications: number;

  @Field(() => Int)
  newApplicationsToday: number;

  @Field()
  conversionRate: number;

  @Field()
  averageTimeToApply: number;

  @Field(() => [SourceStats])
  applicationSources: SourceStats[];
}

@ObjectType()
class SourceStats {
  @Field()
  source: string;

  @Field(() => Int)
  count: number;

  @Field()
  percentage: number;
}

// Input Types
@InputType()
class JobFilters {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  employmentType?: string;

  @Field({ nullable: true })
  experienceLevel?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  salaryMin?: number;

  @Field(() => Int, { nullable: true })
  salaryMax?: number;
}

@InputType()
class CreateJobInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  department: string;

  @Field()
  location: string;

  @Field()
  employmentType: string;

  @Field()
  experienceLevel: string;

  @Field(() => Int)
  salaryMin: number;

  @Field(() => Int)
  salaryMax: number;

  @Field()
  applicationDeadline: Date;

  @Field(() => [String])
  requiredSkills: string[];

  @Field(() => [String])
  preferredSkills: string[];
}

@InputType()
class UpdateJobInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  employmentType?: string;

  @Field({ nullable: true })
  experienceLevel?: string;

  @Field(() => Int, { nullable: true })
  salaryMin?: number;

  @Field(() => Int, { nullable: true })
  salaryMax?: number;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  applicationDeadline?: Date;

  @Field(() => [String], { nullable: true })
  requiredSkills?: string[];

  @Field(() => [String], { nullable: true })
  preferredSkills?: string[];
}

// Context interface
interface Context {
  user?: {
    id: string;
    email: string;
    companyId: string;
    role: string;
  };
  prisma: PrismaClient;
  redis: any;
}

@Resolver(Job)
export class JobResolver {
  @Query(() => JobsResponse)
  @Authorized()
  async jobs(
    @Arg('page', () => Int, { defaultValue: 1 }) page: number,
    @Arg('limit', () => Int, { defaultValue: 20 }) limit: number,
    @Arg('filters', { nullable: true }) filters?: JobFilters,
    @Ctx() ctx?: Context
  ): Promise<JobsResponse> {
    const cacheKey = generateCacheKey('jobs', ctx?.user?.companyId, page, limit, filters);
    
    return getCachedResult(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        
        // Build where clause
        const where: any = {
          companyId: ctx?.user?.companyId,
        };

        if (filters) {
          if (filters.search) {
            where.OR = [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ];
          }
          if (filters.department) where.department = filters.department;
          if (filters.location) where.location = filters.location;
          if (filters.employmentType) where.employmentType = filters.employmentType;
          if (filters.experienceLevel) where.experienceLevel = filters.experienceLevel;
          if (filters.status) where.status = filters.status;
          if (filters.salaryMin) where.salaryMin = { gte: filters.salaryMin };
          if (filters.salaryMax) where.salaryMax = { lte: filters.salaryMax };
        }

        const [jobs, total] = await Promise.all([
          ctx?.prisma.job.findMany({
            where,
            skip,
            take: limit,
            include: {
              company: true,
              applications: {
                include: {
                  candidate: true,
                },
              },
              _count: {
                select: {
                  applications: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
          ctx?.prisma.job.count({ where }),
        ]);

        const totalPages = Math.ceil((total || 0) / limit);

        return {
          jobs: (jobs || []).map(job => ({
            ...job,
            applicationCount: job._count?.applications || 0,
          })),
          total: total || 0,
          page,
          limit,
          totalPages,
        };
      },
      CACHE_TTL.JOB
    );
  }

  @Query(() => Job)
  @Authorized()
  async job(
    @Arg('id') id: string,
    @Ctx() ctx?: Context
  ): Promise<Job | null> {
    const cacheKey = generateCacheKey('job', id, ctx?.user?.companyId);
    
    return getCachedResult(
      cacheKey,
      async () => {
        const job = await ctx?.prisma.job.findFirst({
          where: {
            id,
            companyId: ctx?.user?.companyId,
          },
          include: {
            company: true,
            applications: {
              include: {
                candidate: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
        });

        if (!job) return null;

        return {
          ...job,
          applicationCount: job._count?.applications || 0,
        };
      },
      CACHE_TTL.JOB
    );
  }

  @Query(() => JobAnalytics)
  @Authorized()
  async jobAnalytics(
    @Arg('jobId') jobId: string,
    @Ctx() ctx?: Context
  ): Promise<JobAnalytics> {
    const cacheKey = generateCacheKey('job_analytics', jobId, ctx?.user?.companyId);
    
    return getCachedResult(
      cacheKey,
      async () => {
        // Mock analytics data - replace with actual implementation
        return {
          totalViews: 1250,
          totalApplications: 89,
          newApplicationsToday: 5,
          conversionRate: 7.1,
          averageTimeToApply: 2.5,
          applicationSources: [
            { source: 'Company Website', count: 38, percentage: 42.7 },
            { source: 'LinkedIn', count: 26, percentage: 29.2 },
            { source: 'Indeed', count: 15, percentage: 16.9 },
            { source: 'Referrals', count: 10, percentage: 11.2 },
          ],
        };
      },
      CACHE_TTL.ANALYTICS
    );
  }

  @Mutation(() => Job)
  @Authorized()
  async createJob(
    @Arg('input') input: CreateJobInput,
    @Ctx() ctx?: Context
  ): Promise<Job> {
    const job = await ctx?.prisma.job.create({
      data: {
        ...input,
        companyId: ctx?.user?.companyId!,
        createdById: ctx?.user?.id!,
        status: 'draft',
      },
      include: {
        company: true,
        applications: {
          include: {
            candidate: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // Invalidate cache
    const cachePattern = `graphql:jobs:${ctx?.user?.companyId}:*`;
    // Note: In production, implement proper cache invalidation

    return {
      ...job!,
      applicationCount: job?._count?.applications || 0,
    };
  }

  @Mutation(() => Job)
  @Authorized()
  async updateJob(
    @Arg('id') id: string,
    @Arg('input') input: UpdateJobInput,
    @Ctx() ctx?: Context
  ): Promise<Job> {
    const job = await ctx?.prisma.job.update({
      where: {
        id,
        companyId: ctx?.user?.companyId,
      },
      data: input,
      include: {
        company: true,
        applications: {
          include: {
            candidate: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // Invalidate cache
    const cacheKeys = [
      generateCacheKey('job', id, ctx?.user?.companyId),
      `graphql:jobs:${ctx?.user?.companyId}:*`,
    ];
    // Note: In production, implement proper cache invalidation

    return {
      ...job,
      applicationCount: job._count?.applications || 0,
    };
  }

  @Mutation(() => Boolean)
  @Authorized()
  async deleteJob(
    @Arg('id') id: string,
    @Ctx() ctx?: Context
  ): Promise<boolean> {
    await ctx?.prisma.job.delete({
      where: {
        id,
        companyId: ctx?.user?.companyId,
      },
    });

    // Invalidate cache
    const cacheKeys = [
      generateCacheKey('job', id, ctx?.user?.companyId),
      `graphql:jobs:${ctx?.user?.companyId}:*`,
    ];
    // Note: In production, implement proper cache invalidation

    return true;
  }
}
