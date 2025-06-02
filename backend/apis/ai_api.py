# TalentSol ATS - AI/ML API Service
# FastAPI implementation for machine learning operations

from fastapi import FastAPI, HTTPException, Depends, Security, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Dict, Any, Optional, Union
import asyncio
import json
import time
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import redis
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import pickle

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TalentSol AI/ML API", 
    version="1.0.0",
    description="AI/ML services for candidate scoring, job matching, and resume analysis",
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
class CandidateProfile(BaseModel):
    id: str
    name: str
    email: str
    resume_text: str
    skills: List[str]
    experience_years: int
    education_level: str
    location: str

class JobRequirements(BaseModel):
    id: str
    title: str
    description: str
    required_skills: List[str]
    preferred_skills: List[str]
    experience_level: str
    location: str
    department: str

class ScoringRequest(BaseModel):
    candidate: CandidateProfile
    job: JobRequirements
    scoring_criteria: Optional[Dict[str, float]] = {
        "skills_match": 0.4,
        "experience_match": 0.3,
        "education_match": 0.2,
        "location_match": 0.1
    }

class ScoringResponse(BaseModel):
    candidate_id: str
    job_id: str
    overall_score: float
    skill_score: float
    experience_score: float
    education_score: float
    location_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
    confidence: float
    processing_time_ms: float

class BatchScoringRequest(BaseModel):
    candidates: List[CandidateProfile]
    job: JobRequirements
    scoring_criteria: Optional[Dict[str, float]] = None

class BatchScoringResponse(BaseModel):
    job_id: str
    results: List[ScoringResponse]
    summary: Dict[str, Any]
    processing_time_ms: float

class ResumeParsingRequest(BaseModel):
    resume_text: str
    candidate_id: Optional[str] = None

class ResumeParsingResponse(BaseModel):
    candidate_id: Optional[str]
    extracted_skills: List[str]
    experience_years: int
    education_level: str
    contact_info: Dict[str, str]
    work_history: List[Dict[str, Any]]
    education_history: List[Dict[str, Any]]
    confidence_scores: Dict[str, float]
    processing_time_ms: float

class JobMatchingRequest(BaseModel):
    candidate: CandidateProfile
    available_jobs: List[JobRequirements]
    max_results: Optional[int] = 10

class JobMatchingResponse(BaseModel):
    candidate_id: str
    matched_jobs: List[Dict[str, Any]]
    processing_time_ms: float

class ModelTrainingRequest(BaseModel):
    model_type: str
    training_data_path: str
    model_name: str
    hyperparameters: Optional[Dict[str, Any]] = {}

class ModelTrainingResponse(BaseModel):
    model_id: str
    model_name: str
    training_status: str
    accuracy: Optional[float] = None
    training_time_ms: float

# Redis client for caching
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=3,  # Use different DB for AI API cache
    decode_responses=True
)

# Mock ML models (in production, load actual trained models)
class MockMLModels:
    def __init__(self):
        self.skill_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.is_trained = False
        
    def train_skill_vectorizer(self, skill_texts: List[str]):
        """Train the skill vectorizer with sample data"""
        if not self.is_trained:
            # Sample skill data for training
            sample_skills = [
                "python programming machine learning data science",
                "javascript react node.js frontend development",
                "java spring boot microservices backend",
                "sql database postgresql mysql data analysis",
                "aws cloud devops kubernetes docker",
                "project management agile scrum leadership",
                "marketing digital social media analytics",
                "sales customer relationship management crm"
            ]
            self.skill_vectorizer.fit(sample_skills + skill_texts)
            self.is_trained = True

ml_models = MockMLModels()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify JWT token"""
    token = credentials.credentials
    # TODO: Implement actual JWT verification
    if not token or token == "invalid":
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return {"user_id": "user123", "company_id": "company123"}

def calculate_skill_match(candidate_skills: List[str], required_skills: List[str], preferred_skills: List[str]) -> Dict[str, Any]:
    """Calculate skill matching score using TF-IDF similarity"""
    try:
        # Prepare skill texts
        candidate_text = " ".join(candidate_skills).lower()
        required_text = " ".join(required_skills).lower()
        preferred_text = " ".join(preferred_skills).lower()
        job_text = f"{required_text} {preferred_text}"
        
        # Train vectorizer if needed
        ml_models.train_skill_vectorizer([candidate_text, job_text])
        
        # Vectorize skills
        skill_vectors = ml_models.skill_vectorizer.transform([candidate_text, job_text])
        
        # Calculate similarity
        similarity = cosine_similarity(skill_vectors[0:1], skill_vectors[1:2])[0][0]
        
        # Find matching and missing skills
        candidate_skills_lower = [skill.lower() for skill in candidate_skills]
        required_skills_lower = [skill.lower() for skill in required_skills]
        preferred_skills_lower = [skill.lower() for skill in preferred_skills]
        
        matching_required = [skill for skill in required_skills if skill.lower() in candidate_skills_lower]
        matching_preferred = [skill for skill in preferred_skills if skill.lower() in candidate_skills_lower]
        missing_required = [skill for skill in required_skills if skill.lower() not in candidate_skills_lower]
        
        # Calculate score (0-100)
        required_match_rate = len(matching_required) / len(required_skills) if required_skills else 1.0
        preferred_match_rate = len(matching_preferred) / len(preferred_skills) if preferred_skills else 0.0
        
        # Weighted score: 70% required skills, 30% preferred skills
        skill_score = (required_match_rate * 0.7 + preferred_match_rate * 0.3) * 100
        
        return {
            "score": min(skill_score, 100),
            "similarity": similarity,
            "matching_skills": matching_required + matching_preferred,
            "missing_skills": missing_required,
            "required_match_rate": required_match_rate,
            "preferred_match_rate": preferred_match_rate
        }
    except Exception as e:
        logger.error(f"Skill matching error: {e}")
        return {
            "score": 0,
            "similarity": 0,
            "matching_skills": [],
            "missing_skills": required_skills,
            "required_match_rate": 0,
            "preferred_match_rate": 0
        }

def calculate_experience_match(candidate_years: int, required_level: str) -> float:
    """Calculate experience matching score"""
    level_requirements = {
        "entry": (0, 2),
        "mid": (2, 5),
        "senior": (5, 10),
        "lead": (8, 15),
        "executive": (10, 25)
    }
    
    min_years, max_years = level_requirements.get(required_level.lower(), (0, 100))
    
    if candidate_years < min_years:
        # Penalize for insufficient experience
        return max(0, (candidate_years / min_years) * 70)
    elif candidate_years <= max_years:
        # Perfect match
        return 100
    else:
        # Slight penalty for overqualification
        return max(80, 100 - (candidate_years - max_years) * 2)

def calculate_education_match(candidate_education: str, job_requirements: str) -> float:
    """Calculate education matching score"""
    education_levels = {
        "high_school": 1,
        "associate": 2,
        "bachelor": 3,
        "master": 4,
        "phd": 5
    }
    
    candidate_level = education_levels.get(candidate_education.lower(), 0)
    required_level = education_levels.get(job_requirements.lower(), 0)
    
    if candidate_level >= required_level:
        return 100
    else:
        return max(0, (candidate_level / required_level) * 80)

def calculate_location_match(candidate_location: str, job_location: str) -> float:
    """Calculate location matching score"""
    if candidate_location.lower() == job_location.lower():
        return 100
    elif "remote" in job_location.lower():
        return 100
    else:
        # Simple distance-based scoring (mock implementation)
        return 50  # Assume 50% match for different locations

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        redis_client.ping()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "models_loaded": ml_models.is_trained,
            "cache": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

@app.post("/score", response_model=ScoringResponse)
async def score_candidate(
    request: ScoringRequest,
    user: dict = Depends(verify_token)
):
    """Score a candidate against a job requirement"""
    start_time = time.time()
    
    try:
        # Check cache first
        cache_key = f"score:{request.candidate.id}:{request.job.id}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            result = json.loads(cached_result)
            result["processing_time_ms"] = (time.time() - start_time) * 1000
            return ScoringResponse(**result)
        
        # Calculate individual scores
        skill_match = calculate_skill_match(
            request.candidate.skills,
            request.job.required_skills,
            request.job.preferred_skills
        )
        
        experience_score = calculate_experience_match(
            request.candidate.experience_years,
            request.job.experience_level
        )
        
        education_score = calculate_education_match(
            request.candidate.education_level,
            "bachelor"  # Default requirement
        )
        
        location_score = calculate_location_match(
            request.candidate.location,
            request.job.location
        )
        
        # Calculate overall score using weighted criteria
        criteria = request.scoring_criteria
        overall_score = (
            skill_match["score"] * criteria["skills_match"] +
            experience_score * criteria["experience_match"] +
            education_score * criteria["education_match"] +
            location_score * criteria["location_match"]
        )
        
        # Generate recommendations
        recommendations = []
        if skill_match["score"] < 70:
            recommendations.append(f"Consider developing skills: {', '.join(skill_match['missing_skills'][:3])}")
        if experience_score < 70:
            recommendations.append("Gain more relevant experience in the field")
        if education_score < 70:
            recommendations.append("Consider additional education or certifications")
        
        # Calculate confidence based on data quality
        confidence = min(100, (
            len(request.candidate.skills) * 10 +
            (100 if request.candidate.experience_years > 0 else 0) +
            (100 if request.candidate.education_level else 0)
        ) / 3)
        
        result = {
            "candidate_id": request.candidate.id,
            "job_id": request.job.id,
            "overall_score": round(overall_score, 2),
            "skill_score": round(skill_match["score"], 2),
            "experience_score": round(experience_score, 2),
            "education_score": round(education_score, 2),
            "location_score": round(location_score, 2),
            "matching_skills": skill_match["matching_skills"],
            "missing_skills": skill_match["missing_skills"],
            "recommendations": recommendations,
            "confidence": round(confidence, 2),
            "processing_time_ms": (time.time() - start_time) * 1000
        }
        
        # Cache the result
        redis_client.setex(cache_key, 3600, json.dumps(result))  # Cache for 1 hour
        
        return ScoringResponse(**result)
        
    except Exception as e:
        logger.error(f"Scoring error: {e}")
        raise HTTPException(status_code=500, detail="Scoring failed")

@app.post("/score/batch", response_model=BatchScoringResponse)
async def score_candidates_batch(
    request: BatchScoringRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_token)
):
    """Score multiple candidates against a job requirement"""
    start_time = time.time()
    
    try:
        results = []
        
        for candidate in request.candidates:
            scoring_request = ScoringRequest(
                candidate=candidate,
                job=request.job,
                scoring_criteria=request.scoring_criteria
            )
            
            # Score each candidate
            score_result = await score_candidate(scoring_request, user)
            results.append(score_result)
        
        # Calculate summary statistics
        scores = [r.overall_score for r in results]
        summary = {
            "total_candidates": len(results),
            "average_score": round(sum(scores) / len(scores), 2) if scores else 0,
            "highest_score": max(scores) if scores else 0,
            "lowest_score": min(scores) if scores else 0,
            "candidates_above_70": len([s for s in scores if s >= 70]),
            "candidates_above_80": len([s for s in scores if s >= 80]),
            "candidates_above_90": len([s for s in scores if s >= 90])
        }
        
        processing_time = (time.time() - start_time) * 1000
        
        return BatchScoringResponse(
            job_id=request.job.id,
            results=results,
            summary=summary,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Batch scoring error: {e}")
        raise HTTPException(status_code=500, detail="Batch scoring failed")

@app.post("/parse/resume", response_model=ResumeParsingResponse)
async def parse_resume(
    request: ResumeParsingRequest,
    user: dict = Depends(verify_token)
):
    """Parse resume text and extract structured information"""
    start_time = time.time()
    
    try:
        # Mock resume parsing (in production, use NLP models)
        resume_text = request.resume_text.lower()
        
        # Extract skills (simple keyword matching)
        skill_keywords = [
            "python", "javascript", "java", "react", "node.js", "sql", "aws",
            "machine learning", "data science", "project management", "agile",
            "docker", "kubernetes", "git", "html", "css", "mongodb", "postgresql"
        ]
        
        extracted_skills = [skill for skill in skill_keywords if skill in resume_text]
        
        # Extract experience years (simple regex)
        import re
        experience_patterns = [
            r'(\d+)\s*years?\s*(?:of\s*)?experience',
            r'experience\s*:?\s*(\d+)\s*years?',
            r'(\d+)\+?\s*years?\s*in'
        ]
        
        experience_years = 0
        for pattern in experience_patterns:
            match = re.search(pattern, resume_text)
            if match:
                experience_years = max(experience_years, int(match.group(1)))
        
        # Extract education level
        education_keywords = {
            "phd": ["phd", "ph.d", "doctorate", "doctoral"],
            "master": ["master", "mba", "ms", "ma", "m.s", "m.a"],
            "bachelor": ["bachelor", "bs", "ba", "b.s", "b.a", "undergraduate"],
            "associate": ["associate", "aa", "as", "a.a", "a.s"],
            "high_school": ["high school", "diploma", "ged"]
        }
        
        education_level = "high_school"  # Default
        for level, keywords in education_keywords.items():
            if any(keyword in resume_text for keyword in keywords):
                education_level = level
                break
        
        # Mock contact info extraction
        contact_info = {
            "email": "candidate@example.com",
            "phone": "+1-555-0123",
            "location": "San Francisco, CA"
        }
        
        # Mock work history
        work_history = [
            {
                "company": "Tech Company Inc.",
                "position": "Software Engineer",
                "duration": "2020-2023",
                "description": "Developed web applications using React and Node.js"
            }
        ]
        
        # Mock education history
        education_history = [
            {
                "institution": "University of Technology",
                "degree": "Bachelor of Science in Computer Science",
                "graduation_year": "2020"
            }
        ]
        
        # Confidence scores
        confidence_scores = {
            "skills": 0.85,
            "experience": 0.90,
            "education": 0.95,
            "contact": 0.80
        }
        
        processing_time = (time.time() - start_time) * 1000
        
        return ResumeParsingResponse(
            candidate_id=request.candidate_id,
            extracted_skills=extracted_skills,
            experience_years=experience_years,
            education_level=education_level,
            contact_info=contact_info,
            work_history=work_history,
            education_history=education_history,
            confidence_scores=confidence_scores,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Resume parsing error: {e}")
        raise HTTPException(status_code=500, detail="Resume parsing failed")

@app.post("/match/jobs", response_model=JobMatchingResponse)
async def match_jobs(
    request: JobMatchingRequest,
    user: dict = Depends(verify_token)
):
    """Find best matching jobs for a candidate"""
    start_time = time.time()
    
    try:
        matched_jobs = []
        
        for job in request.available_jobs:
            # Score candidate against each job
            scoring_request = ScoringRequest(
                candidate=request.candidate,
                job=job
            )
            
            score_result = await score_candidate(scoring_request, user)
            
            matched_jobs.append({
                "job_id": job.id,
                "job_title": job.title,
                "company": "Company Name",  # Mock
                "location": job.location,
                "match_score": score_result.overall_score,
                "skill_match": score_result.skill_score,
                "matching_skills": score_result.matching_skills,
                "recommendations": score_result.recommendations
            })
        
        # Sort by match score and limit results
        matched_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        matched_jobs = matched_jobs[:request.max_results]
        
        processing_time = (time.time() - start_time) * 1000
        
        return JobMatchingResponse(
            candidate_id=request.candidate.id,
            matched_jobs=matched_jobs,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Job matching error: {e}")
        raise HTTPException(status_code=500, detail="Job matching failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
