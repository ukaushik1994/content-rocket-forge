import { supabase } from '@/integrations/supabase/client';
import { SolutionPersona, PersonaType } from '@/contexts/content-builder/types/solution-types';

export interface CreatePersonaData {
  solutionId: string;
  personaType: PersonaType;
  personaName: string;
  roleTitle: string;
  typicalGoals: string[];
  painPoints: string[];
  preferredTone: string;
  keyTopics: string[];
  userId: string;
}

export interface UpdatePersonaData extends Partial<CreatePersonaData> {
  id: string;
}

class SolutionPersonaService {
  /**
   * Create a new persona for a solution
   */
  async createPersona(data: CreatePersonaData): Promise<SolutionPersona | null> {
    try {
      const { data: personaData, error } = await supabase
        .from('solution_personas')
        .insert({
          solution_id: data.solutionId,
          persona_type: data.personaType,
          persona_name: data.personaName,
          role_title: data.roleTitle,
          typical_goals: data.typicalGoals,
          pain_points: data.painPoints,
          preferred_tone: data.preferredTone,
          key_topics: data.keyTopics,
          user_id: data.userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating persona:', error);
        return null;
      }

      return this.mapDbPersonaToInterface(personaData);
    } catch (error) {
      console.error('Error creating persona:', error);
      return null;
    }
  }

  /**
   * Update an existing persona
   */
  async updatePersona(data: UpdatePersonaData): Promise<SolutionPersona | null> {
    try {
      const updateData: any = {};
      
      if (data.personaName !== undefined) updateData.persona_name = data.personaName;
      if (data.roleTitle !== undefined) updateData.role_title = data.roleTitle;
      if (data.typicalGoals !== undefined) updateData.typical_goals = data.typicalGoals;
      if (data.painPoints !== undefined) updateData.pain_points = data.painPoints;
      if (data.preferredTone !== undefined) updateData.preferred_tone = data.preferredTone;
      if (data.keyTopics !== undefined) updateData.key_topics = data.keyTopics;

      const { data: personaData, error } = await supabase
        .from('solution_personas')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating persona:', error);
        return null;
      }

      return this.mapDbPersonaToInterface(personaData);
    } catch (error) {
      console.error('Error updating persona:', error);
      return null;
    }
  }

  /**
   * Delete a persona
   */
  async deletePersona(personaId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('solution_personas')
        .delete()
        .eq('id', personaId);

      if (error) {
        console.error('Error deleting persona:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting persona:', error);
      return false;
    }
  }

  /**
   * Get all personas for a solution
   */
  async getPersonasBySolution(solutionId: string): Promise<SolutionPersona[]> {
    try {
      const { data, error } = await supabase
        .from('solution_personas')
        .select('*')
        .eq('solution_id', solutionId)
        .order('persona_type');

      if (error) {
        console.error('Error fetching personas:', error);
        return [];
      }

      return data.map(this.mapDbPersonaToInterface);
    } catch (error) {
      console.error('Error fetching personas:', error);
      return [];
    }
  }

  /**
   * Get all personas for a user
   */
  async getAllPersonasForUser(userId: string): Promise<SolutionPersona[]> {
    try {
      const { data, error } = await supabase
        .from('solution_personas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user personas:', error);
        return [];
      }

      return data.map(this.mapDbPersonaToInterface);
    } catch (error) {
      console.error('Error fetching user personas:', error);
      return [];
    }
  }

  /**
   * Create default personas for a solution (all three types)
   */
  async createDefaultPersonas(solutionId: string, userId: string): Promise<SolutionPersona[]> {
    const defaultPersonas: CreatePersonaData[] = [
      {
        solutionId,
        personaType: 'end_user',
        personaName: 'End User',
        roleTitle: 'End User',
        typicalGoals: ['Improve daily productivity', 'Reduce manual work', 'Save time'],
        painPoints: ['Complex interfaces', 'Time-consuming processes', 'Learning curve'],
        preferredTone: 'Clear and practical',
        keyTopics: ['Usability', 'Efficiency', 'User experience'],
        userId
      },
      {
        solutionId,
        personaType: 'decision_maker',
        personaName: 'Decision Maker',
        roleTitle: 'Manager/Executive',
        typicalGoals: ['Maximize ROI', 'Reduce costs', 'Improve team efficiency'],
        painPoints: ['Budget constraints', 'Risk management', 'Implementation complexity'],
        preferredTone: 'Professional and data-driven',
        keyTopics: ['ROI', 'Cost savings', 'Business impact', 'Risk reduction'],
        userId
      },
      {
        solutionId,
        personaType: 'influencer',
        personaName: 'Technical Influencer',
        roleTitle: 'Technical Lead/Architect',
        typicalGoals: ['Ensure technical excellence', 'Maintain system reliability', 'Drive innovation'],
        painPoints: ['Technical debt', 'Integration challenges', 'Scalability concerns'],
        preferredTone: 'Technical and detailed',
        keyTopics: ['Technical specifications', 'Architecture', 'Integration', 'Performance'],
        userId
      }
    ];

    const createdPersonas: SolutionPersona[] = [];
    
    for (const personaData of defaultPersonas) {
      const persona = await this.createPersona(personaData);
      if (persona) {
        createdPersonas.push(persona);
      }
    }

    return createdPersonas;
  }

  /**
   * Map database persona to interface
   */
  private mapDbPersonaToInterface(dbPersona: any): SolutionPersona {
    return {
      id: dbPersona.id,
      solutionId: dbPersona.solution_id,
      personaType: dbPersona.persona_type,
      personaName: dbPersona.persona_name,
      roleTitle: dbPersona.role_title,
      typicalGoals: Array.isArray(dbPersona.typical_goals) ? dbPersona.typical_goals : [],
      painPoints: Array.isArray(dbPersona.pain_points) ? dbPersona.pain_points : [],
      preferredTone: dbPersona.preferred_tone,
      keyTopics: Array.isArray(dbPersona.key_topics) ? dbPersona.key_topics : [],
      userId: dbPersona.user_id,
      createdAt: dbPersona.created_at,
      updatedAt: dbPersona.updated_at
    };
  }
}

export const solutionPersonaService = new SolutionPersonaService();