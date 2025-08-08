// Type-safe database utilities for TalentSol ATS Backend
// Provides standardized patterns for handling Prisma operations

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

// Generic safe create function
export const safeCreate = async <T extends Record<string, any>, R>(
  model: any,
  data: T,
  fallback: Partial<T> = {}
): Promise<R> => {
  try {
    const safeData = { ...fallback, ...data };
    return await model.create({ data: safeData });
  } catch (error: any) {
    console.error('Database create error:', error);
    throw new AppError(`Database operation failed: ${error.message}`, 500);
  }
};

// Generic safe update function
export const safeUpdate = async <T extends Record<string, any>, R>(
  model: any,
  where: any,
  data: T,
  fallback: Partial<T> = {}
): Promise<R> => {
  try {
    const safeData = { ...fallback, ...data };
    return await model.update({ where, data: safeData });
  } catch (error: any) {
    console.error('Database update error:', error);
    throw new AppError(`Database operation failed: ${error.message}`, 500);
  }
};

// Safe date parsing utility
export const safeParseDate = (dateInput: string | Date | null | undefined): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  
  try {
    const parsed = new Date(dateInput);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

// Format date for database storage
export const formatDateForDB = (date: Date | string | null | undefined): string | null => {
  const parsed = safeParseDate(date);
  return parsed ? parsed.toISOString() : null;
};

// Safe string array parsing
export const safeParseStringArray = (input: string | string[] | null | undefined): string[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Interview-specific data transformation
export const transformInterviewData = (validatedData: any) => {
  return {
    applicationId: validatedData.applicationId,
    title: validatedData.title,
    type: validatedData.type || null,
    scheduledDate: safeParseDate(validatedData.scheduledDate),
    startTime: validatedData.startTime || null,
    endTime: validatedData.endTime || null,
    location: validatedData.location || null,
    meetingLink: validatedData.meetingLink || null,
    interviewers: JSON.stringify(validatedData.interviewers || []),
    notes: validatedData.notes || null,
    status: 'scheduled', // Default status
  };
};

// ML Model data transformation
export const transformMLModelData = (validatedData: any) => {
  return {
    name: validatedData.name,
    type: validatedData.type,
    modelType: validatedData.modelType || validatedData.type,
    version: validatedData.version,
    modelPath: validatedData.modelPath,
    filePath: validatedData.filePath || validatedData.modelPath,
    checksum: validatedData.checksum || null,
    status: validatedData.status || 'active',
    accuracy: validatedData.accuracy || null,
    precision: validatedData.precision || null,
    recall: validatedData.recall || null,
    f1Score: validatedData.f1Score || null,
    trainingData: validatedData.trainingData || '{}',
    features: validatedData.features || '{}',
    metadata: validatedData.metadata || null,
    isActive: validatedData.isActive || false,
    deployedAt: safeParseDate(validatedData.deployedAt),
    trainedAt: safeParseDate(validatedData.trainedAt) || new Date(),
  };
};

// ML Prediction data transformation
export const transformMLPredictionData = (validatedData: any) => {
  return {
    modelId: validatedData.modelId,
    modelName: validatedData.modelName || null,
    applicationId: validatedData.applicationId,
    predictionType: validatedData.predictionType,
    inputFeatures: JSON.stringify(validatedData.inputFeatures || {}),
    prediction: validatedData.prediction,
    confidence: validatedData.confidence || null,
    explanation: validatedData.explanation || null,
  };
};

// Generic error handler for database operations
export const handleDatabaseError = (error: any, operation: string): never => {
  console.error(`Database ${operation} error:`, error);
  
  if (error.code === 'P2002') {
    throw new AppError('A record with this information already exists', 409);
  }
  
  if (error.code === 'P2025') {
    throw new AppError('Record not found', 404);
  }
  
  if (error.code === 'P2003') {
    throw new AppError('Referenced record does not exist', 400);
  }
  
  throw new AppError(`Database ${operation} failed: ${error.message}`, 500);
};

// Validation helper for required fields
export const validateRequiredFields = (data: any, requiredFields: string[]): void => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
  }
};
