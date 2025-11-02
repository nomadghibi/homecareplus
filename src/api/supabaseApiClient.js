// Supabase API Client - Production Multi-Tenant Implementation
import { supabase, handleSupabaseError } from './supabaseClient';

// ============================================
// ENTITY CLASS - Handles CRUD operations with multi-tenant support
// ============================================

class SupabaseEntity {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Get current user's organization_id
  async _getOrganizationId() {
    try {
      const { data, error } = await supabase
        .rpc('get_user_organization_id');

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Could not get organization_id:', error);
      return null;
    }
  }

  // List entities with optional filtering, sorting, and pagination
  // RLS automatically filters by organization_id
  async list(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.ilike(key, `%${value}%`);
        });
      }

      // Apply sorting
      if (options.sort || typeof options === 'string') {
        const sortStr = typeof options === 'string' ? options : options.sort;
        if (sortStr) {
          const isDesc = sortStr.startsWith('-');
          const field = isDesc ? sortStr.substring(1) : sortStr;
          query = query.order(field, { ascending: !isDesc });
        }
      } else {
        // Default sort by created_at descending
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 999) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Get single entity by ID
  async get(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error(`${this.tableName} with id ${id} not found`);
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Create new entity (automatically includes organization_id)
  async create(entityData) {
    try {
      // Get organization_id and add it to the data
      const organizationId = await this._getOrganizationId();

      const dataToInsert = {
        ...entityData,
        // Add organization_id if this table has that column
        ...(organizationId && { organization_id: organizationId })
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Update existing entity
  async update(id, updateData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error(`${this.tableName} with id ${id} not found`);
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Delete entity
  async delete(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      handleSupabaseError(error);
    }
  }
}

// ============================================
// TABLE NAME MAPPING
// ============================================
const tableNameMap = {
  'Client': 'clients',
  'Caregiver': 'caregivers',
  'Visit': 'visits',
  'EVVEvent': 'evv_events',
  'Claim': 'claims',
  'Document': 'documents',
  'Message': 'messages',
  'MedicationSchedule': 'medication_schedules',
  'MedicationAdministration': 'medication_administrations',
  'CarePlan': 'care_plans',
  'Incident': 'incidents',
  'FamilyMember': 'family_members',
  'FamilyPortalAccess': 'family_portal_access',
  'VisitRating': 'visit_ratings',
  'AuditLog': 'audit_logs',
  'Channel': 'channels',
  'QualityAudit': 'quality_audits',
  'ClientSatisfactionSurvey': 'client_satisfaction_surveys',
};

// Create entity instances for all tables
const entityInstances = {};
Object.entries(tableNameMap).forEach(([entityName, tableName]) => {
  entityInstances[entityName] = new SupabaseEntity(tableName);
});

// ============================================
// AUTHENTICATION METHODS - Multi-Tenant Aware
// ============================================

const auth = {
  // Login with email and password
  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Get full user profile with organization context
      const { data: profile, error: profileError } = await supabase
        .rpc('get_current_user_profile');

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Fallback to basic user data if profile fetch fails
        return {
          success: true,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || authData.user.email,
            role: authData.user.user_metadata?.role || 'User',
          },
          token: authData.session.access_token,
        };
      }

      // Return enriched user data with organization context
      return {
        success: true,
        user: {
          id: profile.user_id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          displayName: profile.display_name,
          name: profile.display_name || profile.email,
          role: profile.role,
          organizationId: profile.organization_id,
          organizationName: profile.organization_name,
          organizationSlug: profile.organization_slug,
          subscriptionStatus: profile.subscription_status,
          subscriptionPlan: profile.subscription_plan,
          trialEndsAt: profile.trial_ends_at,
          isPrimaryOwner: profile.is_primary_owner,
        },
        token: authData.session.access_token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  // Sign up new user with organization creation
  async signup(credentials) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        organizationName,
        organizationSlug,
      } = credentials;

      // Sign up with Supabase Auth
      // The database trigger will auto-create organization and user_profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            organization_name: organizationName,
            organization_slug: organizationSlug,
          },
        },
      });

      if (authError) {
        console.error('Supabase Auth Error:', authError);
        throw authError;
      }

      console.log('✅ Supabase signup successful:', authData);

      // Return success - user will need to verify email before logging in
      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          firstName: firstName,
          lastName: lastName,
          name: `${firstName} ${lastName}`,
        },
        requiresEmailVerification: true,
        message: 'Please check your email to verify your account',
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  },

  // Logout current user
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any local storage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  },

  // Get current authenticated user with full profile
  async getCurrentUser() {
    try {
      // First check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return null;

      // Get full user profile with organization context
      const { data: profile, error: profileError } = await supabase
        .rpc('get_current_user_profile');

      if (profileError || !profile) {
        // Fallback to basic user data
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
          role: user.user_metadata?.role || 'User',
        };
      }

      // Return full profile with organization context
      return {
        id: profile.user_id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: profile.display_name,
        name: profile.display_name || profile.email,
        role: profile.role,
        organizationId: profile.organization_id,
        organizationName: profile.organization_name,
        organizationSlug: profile.organization_slug,
        subscriptionStatus: profile.subscription_status,
        subscriptionPlan: profile.subscription_plan,
        trialEndsAt: profile.trial_ends_at,
        isPrimaryOwner: profile.is_primary_owner,
        avatarUrl: profile.avatar_url,
        phone: profile.phone,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Alias for getCurrentUser
  async me() {
    return this.getCurrentUser();
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  // Get organization subscription info
  async getSubscription() {
    try {
      const { data, error } = await supabase
        .rpc('get_organization_subscription');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get subscription error:', error);
      return null;
    }
  },

  // Check if trial has expired
  async isTrialExpired() {
    try {
      const { data, error } = await supabase
        .rpc('is_trial_expired');

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Check trial expired error:', error);
      return false;
    }
  },

  // Password reset request
  async resetPasswordRequest(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  },

  // Update password (after reset link click)
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Password update failed');
    }
  },

  // Redirect to login (for compatibility)
  redirectToLogin(redirectUrl) {
    console.log('Redirect to login with:', redirectUrl);
    return { redirectUrl };
  },
};

// ============================================
// INTEGRATION METHODS
// ============================================

const integration = {
  // Email integration
  email: {
    async send(emailData) {
      // TODO: Implement with Supabase Edge Functions or third-party service
      console.log('Email send (not implemented):', emailData);
      return {
        success: true,
        messageId: `email_${Date.now()}`,
        message: 'Email integration not yet implemented. Use Supabase Edge Functions.',
      };
    },
  },

  // LLM integration
  llm: {
    async generateText(prompt) {
      // TODO: Implement with Supabase Edge Functions calling OpenAI/Anthropic
      console.log('LLM generate text (not implemented):', prompt);
      return {
        text: 'LLM integration not yet implemented. Use Supabase Edge Functions with AI services.',
      };
    },
  },

  // File storage integration
  file: {
    async upload(file, bucket = 'documents') {
      try {
        // Get organization_id for folder structure
        const { data: orgId } = await supabase.rpc('get_user_organization_id');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${orgId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL (for public buckets like avatars)
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return {
          success: true,
          fileId: data.path,
          url: urlData.publicUrl,
          path: filePath,
        };
      } catch (error) {
        console.error('File upload error:', error);
        throw new Error(error.message || 'File upload failed');
      }
    },

    async download(filePath, bucket = 'documents') {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(filePath);

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('File download error:', error);
        throw new Error(error.message || 'File download failed');
      }
    },

    async delete(filePath, bucket = 'documents') {
      try {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('File delete error:', error);
        throw new Error(error.message || 'File delete failed');
      }
    },

    // Get signed URL for private files
    async getSignedUrl(filePath, bucket = 'documents', expiresIn = 3600) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, expiresIn);

        if (error) throw error;
        return data.signedUrl;
      } catch (error) {
        console.error('Get signed URL error:', error);
        throw new Error(error.message || 'Failed to get signed URL');
      }
    },
  },
};

// ============================================
// DASHBOARD STATISTICS - Tenant-aware
// ============================================

async function getStats() {
  try {
    // RLS automatically filters all queries by organization_id

    // Get active clients count
    const { count: activeClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get active caregivers count
    const { count: activeCaregivers } = await supabase
      .from('caregivers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get today's visits
    const today = new Date().toISOString().split('T')[0];
    const { count: todayVisits } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_start', `${today}T00:00:00`)
      .lt('scheduled_start', `${today}T23:59:59`);

    // Get pending claims
    const { count: pendingClaims } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'submitted', 'pending']);

    // Calculate fill rate
    const { data: totalVisits } = await supabase
      .from('visits')
      .select('caregiver_id', { count: 'exact' })
      .gte('scheduled_start', `${today}T00:00:00`);

    const assignedVisits = totalVisits?.filter(v => v.caregiver_id).length || 0;
    const fillRate = totalVisits?.length > 0
      ? (assignedVisits / totalVisits.length) * 100
      : 100;

    // Calculate EVV match rate
    const { data: completedVisits } = await supabase
      .from('visits')
      .select('id')
      .eq('status', 'completed')
      .gte('scheduled_start', `${today}T00:00:00`);

    let evvMatchRate = 100;
    if (completedVisits && completedVisits.length > 0) {
      const visitIds = completedVisits.map(v => v.id);
      const { data: evvEvents } = await supabase
        .from('evv_events')
        .select('visit_id')
        .in('visit_id', visitIds)
        .eq('status', 'verified');

      const verifiedVisits = new Set(evvEvents?.map(e => e.visit_id) || []).size;
      evvMatchRate = (verifiedVisits / completedVisits.length) * 100;
    }

    // Calculate Days Sales Outstanding
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentClaims } = await supabase
      .from('claims')
      .select('submission_date, payment_date')
      .gte('submission_date', thirtyDaysAgo.toISOString())
      .not('payment_date', 'is', null);

    let avgDSO = 0;
    if (recentClaims && recentClaims.length > 0) {
      const dsoSum = recentClaims.reduce((sum, claim) => {
        const submitted = new Date(claim.submission_date);
        const paid = new Date(claim.payment_date);
        const days = Math.floor((paid - submitted) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgDSO = Math.round(dsoSum / recentClaims.length);
    }

    return {
      activeClients: activeClients || 0,
      activeCaregivers: activeCaregivers || 0,
      todayVisits: todayVisits || 0,
      pendingClaims: pendingClaims || 0,
      fillRate: Math.round(fillRate * 10) / 10,
      evvMatchRate: Math.round(evvMatchRate * 10) / 10,
      avgDSO: avgDSO,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      activeClients: 0,
      activeCaregivers: 0,
      todayVisits: 0,
      pendingClaims: 0,
      fillRate: 0,
      evvMatchRate: 0,
      avgDSO: 0,
    };
  }
}

// ============================================
// EXPORT SUPABASE CLIENT
// ============================================

export const createSupabaseClient = () => {
  return {
    // Entity access methods
    entity: (name) => {
      return entityInstances[name] || new SupabaseEntity(tableNameMap[name] || name.toLowerCase());
    },

    // Entities object for direct access
    entities: entityInstances,

    // Integration methods
    integration,

    // Auth methods
    auth,

    // Dashboard stats
    getStats,

    // Direct Supabase client access (for advanced queries)
    _supabase: supabase,
  };
};

export default createSupabaseClient;
