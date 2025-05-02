
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Demo credentials
const DEMO_EMAIL = "demo@example.com"; // Changed to a valid domain
const DEMO_PASSWORD = "demo123456"; // In real apps, never expose passwords in code

export async function createDemoAccountIfNeeded(): Promise<boolean> {
  try {
    // First check if the account already exists
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (existingUser?.user) {
      // Account exists, no need to create it
      return true;
    }

    // If the error is not "invalid login credentials", something else is wrong
    if (checkError && !checkError.message.includes("Invalid login credentials")) {
      console.error("Error checking demo account:", checkError);
      return false;
    }

    // Create a new account
    const { error: signUpError } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (signUpError) {
      throw signUpError;
    }

    // The account was created successfully
    toast.success("Demo account created successfully");
    return true;
  } catch (error: any) {
    console.error("Error creating demo account:", error);
    toast.error(error.message || "Failed to create demo account");
    return false;
  }
}

export async function loginWithDemoAccount(): Promise<boolean> {
  try {
    // Ensure the demo account exists
    const accountCreated = await createDemoAccountIfNeeded();
    
    if (!accountCreated) {
      toast.error("Could not create demo account. Please try again.");
      return false;
    }
    
    // Log in with the demo account
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (error) {
      throw error;
    }

    if (data?.user) {
      toast.success("Logged in with demo account");
      return true;
    } else {
      throw new Error("No user data returned from login");
    }
  } catch (error: any) {
    console.error("Error logging in with demo account:", error);
    toast.error(error.message || "Failed to log in with demo account");
    return false;
  }
}

export const getDemoCredentials = () => ({
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD
});
