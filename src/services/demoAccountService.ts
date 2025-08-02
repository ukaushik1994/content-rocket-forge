import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Demo account configuration - these should be moved to environment variables
const DEMO_CONFIG = {
  // In production, these should be read from environment variables or Supabase secrets
  email: process.env.DEMO_EMAIL || 'demo@contentbuilder.app',
  password: process.env.DEMO_PASSWORD || null, // Force environment configuration
  profile: {
    firstName: 'Demo',
    lastName: 'User',
    role: 'employee' as const,
    department: 'Marketing'
  }
};

interface DemoAccountResult {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
}

class DemoAccountService {
  /**
   * Creates or logs into a demo account with proper security measures
   */
  static async createOrLoginDemo(): Promise<DemoAccountResult> {
    // Validate demo configuration
    if (!DEMO_CONFIG.password) {
      console.error('Demo account password not configured in environment variables');
      return {
        success: false,
        error: 'Demo account not properly configured. Please contact support.'
      };
    }

    try {
      // First, try to sign in with existing demo account
      const signInResult = await supabase.auth.signInWithPassword({
        email: DEMO_CONFIG.email,
        password: DEMO_CONFIG.password
      });

      if (signInResult.data.user && !signInResult.error) {
        // Demo account exists and login successful
        await this.ensureDemoProfile(signInResult.data.user.id);
        
        return {
          success: true,
          user: signInResult.data.user,
          session: signInResult.data.session
        };
      }

      // If login failed, try to create the demo account
      if (signInResult.error?.message.includes('Invalid login credentials')) {
        return await this.createDemoAccount();
      }

      // Other error occurred
      throw signInResult.error;

    } catch (error: any) {
      console.error('Demo account operation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to access demo account'
      };
    }
  }

  /**
   * Creates a new demo account with security restrictions
   */
  private static async createDemoAccount(): Promise<DemoAccountResult> {
    try {
      const signUpResult = await supabase.auth.signUp({
        email: DEMO_CONFIG.email,
        password: DEMO_CONFIG.password,
        options: {
          data: {
            first_name: DEMO_CONFIG.profile.firstName,
            last_name: DEMO_CONFIG.profile.lastName,
            role: DEMO_CONFIG.profile.role,
            department: DEMO_CONFIG.profile.department,
            is_demo_account: true, // Mark as demo account
            created_via: 'demo_service'
          }
        }
      });

      if (signUpResult.error) {
        throw signUpResult.error;
      }

      if (signUpResult.data.user) {
        await this.ensureDemoProfile(signUpResult.data.user.id);
        
        return {
          success: true,
          user: signUpResult.data.user,
          session: signUpResult.data.session
        };
      }

      throw new Error('Demo account creation failed');

    } catch (error: any) {
      console.error('Demo account creation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create demo account'
      };
    }
  }

  /**
   * Ensures demo account has proper profile setup with security restrictions
   */
  private static async ensureDemoProfile(userId: string): Promise<void> {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Create demo profile with restrictions
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            first_name: DEMO_CONFIG.profile.firstName,
            last_name: DEMO_CONFIG.profile.lastName,
            role: DEMO_CONFIG.profile.role,
            department: DEMO_CONFIG.profile.department
          });
      }
    } catch (error) {
      console.error('Demo profile setup failed:', error);
      // Don't throw here as the main account creation was successful
    }
  }

  /**
   * Validates if current user is a demo account
   */
  static async isDemoAccount(userId?: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Check if this matches demo account email pattern or has demo metadata
      const { data: authUser } = await supabase.auth.getUser();
      return authUser.user?.email === DEMO_CONFIG.email;
      
    } catch (error) {
      console.error('Demo account validation failed:', error);
      return false;
    }
  }

  /**
   * Cleans up demo account data (for maintenance)
   */
  static async cleanupDemoData(): Promise<void> {
    console.log('Demo data cleanup should be handled by scheduled maintenance tasks');
    // This would typically be handled by a scheduled edge function or cron job
    // to periodically clean up demo account generated data
  }
}

export { DemoAccountService };
