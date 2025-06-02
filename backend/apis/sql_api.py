# TalentSol ATS - PostgreSQL-Compatible SQL API
# FastAPI implementation with caching and security

from fastapi import FastAPI, HTTPException, Depends, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Dict, Any, Optional, Union
import asyncpg
import json
import time
import re
import hashlib
from functools import lru_cache
import redis
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TalentSol SQL API", 
    version="1.0.0",
    description="PostgreSQL-compatible SQL API with caching and security",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:8081", "https://talentsol.local"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Pydantic models
class SQLQuery(BaseModel):
    query: str
    parameters: Optional[Dict[str, Any]] = {}
    cache_ttl: Optional[int] = 1800
    explain: bool = False
    timeout: Optional[int] = 30

    @validator('query')
    def validate_query(cls, v):
        if not v or not v.strip():
            raise ValueError('Query cannot be empty')
        if len(v) > 10000:
            raise ValueError('Query too long (max 10000 characters)')
        return v.strip()

class SQLResponse(BaseModel):
    data: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    cached: bool = False
    explain_plan: Optional[List[Dict[str, Any]]] = None
    query_hash: str
    timestamp: str

class SchemaInfo(BaseModel):
    tables: List[Dict[str, Any]]
    views: List[Dict[str, Any]]
    functions: List[Dict[str, Any]]
    indexes: List[Dict[str, Any]]

class QueryStats(BaseModel):
    total_queries: int
    cached_queries: int
    avg_execution_time: float
    slow_queries: List[Dict[str, Any]]
    cache_hit_rate: float

class TableSchema(BaseModel):
    table_name: str
    columns: List[Dict[str, Any]]
    indexes: List[Dict[str, Any]]
    constraints: List[Dict[str, Any]]
    row_count: Optional[int] = None

# Configuration
class SQLAPIConfig:
    MAX_QUERY_LENGTH = 10000
    SLOW_QUERY_THRESHOLD = 1000  # ms
    MAX_ROWS_RETURNED = 10000
    CACHE_TTL_DEFAULT = 1800  # 30 minutes
    
    ALLOWED_FUNCTIONS = {
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF',
        'EXTRACT', 'DATE_TRUNC', 'NOW', 'CURRENT_TIMESTAMP',
        'SUBSTRING', 'LENGTH', 'LOWER', 'UPPER', 'TRIM', 'CONCAT',
        'ROUND', 'FLOOR', 'CEIL', 'ABS', 'GREATEST', 'LEAST'
    }
    
    BLOCKED_KEYWORDS = {
        'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 
        'UPDATE', 'GRANT', 'REVOKE', 'VACUUM', 'ANALYZE', 'COPY',
        'IMPORT', 'EXPORT', 'BACKUP', 'RESTORE'
    }
    
    ALLOWED_TABLES = {
        'users', 'companies', 'jobs', 'candidates', 'applications',
        'interviews', 'notifications', 'ml_models', 'predictions',
        'skill_extractions', 'training_datasets'
    }

# Database connection pool
db_pool = None
redis_client = None

async def get_db_pool():
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            host="localhost",
            port=5432,
            user="talentsol_user",
            password="talentsol_password",
            database="talentsol_ats",
            min_size=5,
            max_size=20,
            command_timeout=60
        )
    return db_pool

def get_redis_client():
    global redis_client
    if redis_client is None:
        redis_client = redis.Redis(
            host='localhost',
            port=6379,
            db=1,  # Use different DB for SQL API cache
            decode_responses=True
        )
    return redis_client

def generate_query_hash(query: str, parameters: Dict[str, Any]) -> str:
    """Generate unique hash for query and parameters"""
    combined = f"{query}:{json.dumps(parameters, sort_keys=True)}"
    return hashlib.md5(combined.encode()).hexdigest()

def validate_sql_security(query: str) -> bool:
    """Enhanced SQL injection protection"""
    query_upper = query.upper().strip()
    
    # Check for blocked keywords
    for keyword in SQLAPIConfig.BLOCKED_KEYWORDS:
        if re.search(rf'\b{keyword}\b', query_upper):
            logger.warning(f"Blocked keyword detected: {keyword}")
            return False
    
    # Allow only SELECT and WITH statements
    if not (query_upper.startswith('SELECT') or query_upper.startswith('WITH')):
        logger.warning(f"Invalid query type: {query_upper[:20]}...")
        return False
    
    # Check for suspicious patterns
    suspicious_patterns = [
        r';\s*(DROP|DELETE|UPDATE|INSERT)',
        r'UNION.*SELECT.*FROM.*INFORMATION_SCHEMA',
        r'\/\*.*\*\/',  # Block comments
        r'--.*',  # Line comments in middle of query
        r'xp_cmdshell',
        r'sp_executesql',
        r'EXEC\s*\(',
        r'EXECUTE\s*\('
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, query_upper):
            logger.warning(f"Suspicious pattern detected: {pattern}")
            return False
    
    # Validate table access
    table_pattern = r'FROM\s+(\w+)'
    tables = re.findall(table_pattern, query_upper)
    for table in tables:
        if table.lower() not in SQLAPIConfig.ALLOWED_TABLES:
            logger.warning(f"Access to table '{table}' not allowed")
            return False
    
    return True

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify JWT token (placeholder - integrate with your auth system)"""
    token = credentials.credentials
    # TODO: Implement actual JWT verification
    if not token or token == "invalid":
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return {"user_id": "user123", "company_id": "company123"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        
        redis_client = get_redis_client()
        redis_client.ping()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected",
            "cache": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

@app.post("/query", response_model=SQLResponse)
async def execute_query(
    sql_query: SQLQuery,
    user: dict = Depends(verify_token)
):
    """Execute SQL query with caching and security validation"""
    start_time = time.time()
    
    # Security validation
    if not validate_sql_security(sql_query.query):
        raise HTTPException(status_code=400, detail="Query not allowed for security reasons")
    
    # Generate query hash for caching
    query_hash = generate_query_hash(sql_query.query, sql_query.parameters)
    
    # Check cache first
    redis_client = get_redis_client()
    cache_key = f"sql_query:{query_hash}"
    
    try:
        cached_result = redis_client.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for query hash: {query_hash}")
            result = json.loads(cached_result)
            result["cached"] = True
            result["timestamp"] = datetime.utcnow().isoformat()
            return SQLResponse(**result)
    except Exception as e:
        logger.warning(f"Cache read error: {e}")
    
    # Execute query
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Add row limit for safety
            limited_query = sql_query.query
            if "LIMIT" not in sql_query.query.upper():
                limited_query += f" LIMIT {SQLAPIConfig.MAX_ROWS_RETURNED}"
            
            # Execute query
            if sql_query.parameters:
                rows = await conn.fetch(limited_query, *sql_query.parameters.values())
            else:
                rows = await conn.fetch(limited_query)
            
            # Convert to list of dicts
            data = [dict(row) for row in rows]
            
            # Get explain plan if requested
            explain_plan = None
            if sql_query.explain:
                explain_query = f"EXPLAIN (FORMAT JSON) {limited_query}"
                if sql_query.parameters:
                    explain_result = await conn.fetchval(explain_query, *sql_query.parameters.values())
                else:
                    explain_result = await conn.fetchval(explain_query)
                explain_plan = explain_result
    
    except Exception as e:
        logger.error(f"Query execution error: {e}")
        raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")
    
    execution_time = (time.time() - start_time) * 1000
    
    # Prepare response
    response_data = {
        "data": data,
        "row_count": len(data),
        "execution_time_ms": round(execution_time, 2),
        "cached": False,
        "explain_plan": explain_plan,
        "query_hash": query_hash,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Cache the result
    try:
        cache_ttl = sql_query.cache_ttl or SQLAPIConfig.CACHE_TTL_DEFAULT
        redis_client.setex(cache_key, cache_ttl, json.dumps(response_data, default=str))
        logger.info(f"Cached query result with hash: {query_hash}")
    except Exception as e:
        logger.warning(f"Cache write error: {e}")
    
    return SQLResponse(**response_data)

@app.get("/schema", response_model=SchemaInfo)
async def get_schema_info(user: dict = Depends(verify_token)):
    """Get database schema information"""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Get tables
            tables_query = """
                SELECT table_name, table_type 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = ANY($1)
                ORDER BY table_name
            """
            tables = await conn.fetch(tables_query, list(SQLAPIConfig.ALLOWED_TABLES))
            
            # Get views
            views_query = """
                SELECT table_name as view_name, view_definition 
                FROM information_schema.views 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """
            views = await conn.fetch(views_query)
            
            # Get functions
            functions_query = """
                SELECT routine_name, routine_type 
                FROM information_schema.routines 
                WHERE routine_schema = 'public'
                ORDER BY routine_name
            """
            functions = await conn.fetch(functions_query)
            
            # Get indexes
            indexes_query = """
                SELECT indexname, tablename, indexdef 
                FROM pg_indexes 
                WHERE schemaname = 'public'
                AND tablename = ANY($1)
                ORDER BY tablename, indexname
            """
            indexes = await conn.fetch(indexes_query, list(SQLAPIConfig.ALLOWED_TABLES))
            
            return SchemaInfo(
                tables=[dict(row) for row in tables],
                views=[dict(row) for row in views],
                functions=[dict(row) for row in functions],
                indexes=[dict(row) for row in indexes]
            )
    
    except Exception as e:
        logger.error(f"Schema info error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve schema information")

@app.get("/table/{table_name}", response_model=TableSchema)
async def get_table_schema(table_name: str, user: dict = Depends(verify_token)):
    """Get detailed schema for a specific table"""
    if table_name.lower() not in SQLAPIConfig.ALLOWED_TABLES:
        raise HTTPException(status_code=403, detail="Access to this table is not allowed")
    
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Get columns
            columns_query = """
                SELECT column_name, data_type, is_nullable, column_default,
                       character_maximum_length, numeric_precision, numeric_scale
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position
            """
            columns = await conn.fetch(columns_query, table_name)
            
            # Get indexes
            indexes_query = """
                SELECT indexname, indexdef 
                FROM pg_indexes 
                WHERE schemaname = 'public' AND tablename = $1
            """
            indexes = await conn.fetch(indexes_query, table_name)
            
            # Get constraints
            constraints_query = """
                SELECT constraint_name, constraint_type 
                FROM information_schema.table_constraints 
                WHERE table_schema = 'public' AND table_name = $1
            """
            constraints = await conn.fetch(constraints_query, table_name)
            
            # Get row count (approximate)
            count_query = f"SELECT reltuples::bigint FROM pg_class WHERE relname = $1"
            row_count = await conn.fetchval(count_query, table_name)
            
            return TableSchema(
                table_name=table_name,
                columns=[dict(row) for row in columns],
                indexes=[dict(row) for row in indexes],
                constraints=[dict(row) for row in constraints],
                row_count=int(row_count) if row_count else None
            )
    
    except Exception as e:
        logger.error(f"Table schema error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve table schema")

@app.get("/stats", response_model=QueryStats)
async def get_query_stats(user: dict = Depends(verify_token)):
    """Get query execution statistics"""
    try:
        redis_client = get_redis_client()
        
        # Get stats from Redis (simplified implementation)
        total_queries = int(redis_client.get("sql_stats:total_queries") or 0)
        cached_queries = int(redis_client.get("sql_stats:cached_queries") or 0)
        total_execution_time = float(redis_client.get("sql_stats:total_execution_time") or 0)
        
        avg_execution_time = total_execution_time / total_queries if total_queries > 0 else 0
        cache_hit_rate = (cached_queries / total_queries * 100) if total_queries > 0 else 0
        
        # Get slow queries (placeholder)
        slow_queries = []
        
        return QueryStats(
            total_queries=total_queries,
            cached_queries=cached_queries,
            avg_execution_time=round(avg_execution_time, 2),
            slow_queries=slow_queries,
            cache_hit_rate=round(cache_hit_rate, 2)
        )
    
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
