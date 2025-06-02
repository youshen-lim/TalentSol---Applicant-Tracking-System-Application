// TalentSol ATS - GraphQL API Implementation
// Apollo Server with TypeScript and caching

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Container } from 'typedi';
import { GraphQLError } from 'graphql';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

// Import resolvers
import { UserResolver } from './resolvers/UserResolver.js';
import { JobResolver } from './resolvers/JobResolver.js';
import { ApplicationResolver } from './resolvers/ApplicationResolver.js';
import { AnalyticsResolver } from './resolvers/AnalyticsResolver.js';
import { CandidateResolver } from './resolvers/CandidateResolver.js';

// Context interface
interface Context {
  user?: {
    id: string;
    email: string;
    companyId: string;
    role: string;
  };
  prisma: PrismaClient;
  redis: Redis;
}

// Cache configuration
const CACHE_TTL = {
  USER: 300,      // 5 minutes
  JOB: 600,       // 10 minutes
  APPLICATION: 180, // 3 minutes
  ANALYTICS: 900,   // 15 minutes
  CANDIDATE: 300,   // 5 minutes
};

// Initialize Prisma and Redis
const prisma = new PrismaClient();
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: 2, // Use different DB for GraphQL cache
});

// Authentication middleware
const authenticateUser = async (token?: string) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        companyId: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Cache helper functions
const generateCacheKey = (prefix: string, ...args: any[]): string => {
  const combined = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(':');
  const hash = createHash('md5').update(combined).digest('hex');
  return `graphql:${prefix}:${hash}`;
};

const getCachedResult = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> => {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Cache error:', error);
    return fetcher();
  }
};

// Create Apollo Server
async function createServer() {
  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      JobResolver,
      ApplicationResolver,
      AnalyticsResolver,
      CandidateResolver,
    ],
    container: Container,
    validate: false,
  });

  // Create Apollo Server
  const server = new ApolloServer<Context>({
    schema,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      
      // Don't expose internal errors in production
      if (process.env.NODE_ENV === 'production') {
        return new GraphQLError('Internal server error');
      }
      
      return error;
    },
    plugins: [
      // Query complexity analysis
      {
        requestDidStart() {
          return {
            didResolveOperation(requestContext) {
              const { request, document } = requestContext;
              
              // Log query for monitoring
              console.log('GraphQL Query:', {
                query: request.query,
                variables: request.variables,
                operationName: request.operationName,
              });
            },
          };
        },
      },
      // Caching plugin
      {
        requestDidStart() {
          return {
            willSendResponse(requestContext) {
              const { response } = requestContext;
              
              // Add cache headers for GET requests
              if (requestContext.request.http?.method === 'GET') {
                response.http?.headers.set('Cache-Control', 'public, max-age=300');
              }
            },
          };
        },
      },
    ],
  });

  return server;
}

// Context function
const createContext = async ({ req }: { req: any }): Promise<Context> => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await authenticateUser(token);

  return {
    user,
    prisma,
    redis,
  };
};

// Start server
async function startServer() {
  try {
    const server = await createServer();
    
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
      context: createContext,
    });

    console.log(`🚀 GraphQL Server ready at: ${url}`);
    console.log(`📊 GraphQL Playground available at: ${url}`);
  } catch (error) {
    console.error('Failed to start GraphQL server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down GraphQL server...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down GraphQL server...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

// Export for testing
export { createServer, createContext, getCachedResult, generateCacheKey, CACHE_TTL };

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
