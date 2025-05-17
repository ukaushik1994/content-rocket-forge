
import { PromptTemplate } from './types';
import { getUserPreference, saveUserPreference } from './storage';
import { toast } from 'sonner';

/**
 * Get all prompt templates
 */
export function getPromptTemplates(): PromptTemplate[] {
  const preferences = getUserPreference('promptTemplates');
  return preferences || [];
}

/**
 * Get prompt templates for a specific format type
 */
export function getPromptTemplatesByType(formatType: string): PromptTemplate[] {
  const templates = getPromptTemplates();
  return templates.filter(template => template.formatType === formatType);
}

/**
 * Get a specific prompt template by ID
 */
export function getPromptTemplateById(id: string): PromptTemplate | undefined {
  const templates = getPromptTemplates();
  return templates.find(template => template.id === id);
}

/**
 * Save a prompt template
 */
export async function savePromptTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  const templates = getPromptTemplates();
  const newTemplate: PromptTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedTemplates = [...templates, newTemplate];
  return saveUserPreference('promptTemplates', updatedTemplates);
}

/**
 * Update an existing prompt template
 */
export async function updatePromptTemplate(template: PromptTemplate): Promise<boolean> {
  const templates = getPromptTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  
  if (index === -1) {
    return false;
  }
  
  const updatedTemplate = {
    ...template,
    updatedAt: new Date()
  };
  
  const updatedTemplates = [...templates];
  updatedTemplates[index] = updatedTemplate;
  
  return saveUserPreference('promptTemplates', updatedTemplates);
}

/**
 * Delete a prompt template
 */
export async function deletePromptTemplate(id: string): Promise<boolean> {
  const templates = getPromptTemplates();
  const updatedTemplates = templates.filter(template => template.id !== id);
  
  return saveUserPreference('promptTemplates', updatedTemplates);
}
