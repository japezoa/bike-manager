import { supabase } from './supabase';
import { Owner } from '@/types/bicycle';

export const authService = {
  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get or redirect to register
  async getOrCreateOwnerProfile(): Promise<Owner | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    // First, try to find by user_id
    const { data: ownerByUserId } = await supabase
      .from('owners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (ownerByUserId) {
      return ownerByUserId;
    }

    // If not found by user_id, try to find by email
    const { data: ownerByEmail, error: emailError } = await supabase
      .from('owners')
      .select('*')
      .eq('email', user.email)
      .single();

    if (ownerByEmail) {
      // Found by email, now link the user_id
      const { data: updatedOwner } = await supabase
        .from('owners')
        .update({ user_id: user.id })
        .eq('id', ownerByEmail.id)
        .select()
        .single();

      return updatedOwner || ownerByEmail;
    }

    // If profile doesn't exist at all, return null (will show access denied)
    return null;
  },

  // Get user role
  async getUserRole(): Promise<'admin' | 'mechanic' | 'customer' | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('owners')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) return 'customer'; // Default to customer
    return data?.role || 'customer';
  },

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin';
  },

  // Check if user is mechanic or admin
  async isStaff(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin' || role === 'mechanic';
  },

  // Update owner profile
  async updateProfile(ownerId: string, updates: Partial<Owner>): Promise<Owner> {
    const { data, error } = await supabase
      .from('owners')
      .update(updates)
      .eq('id', ownerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
