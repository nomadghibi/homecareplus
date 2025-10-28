// Supabase API Client - Replacement for mockClient.js
import { supabase, handleSupabaseError } from './supabaseClient';

// ============================================
// ENTITY CLASS - Handles CRUD operations for all entities
// ============================================

class SupabaseEntity {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // List entities with optional filtering, sorting, and pagination
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

  // Create new entity
  async create(entityData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([entityData])
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
// Map entity names to database table names (snake_case)
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
// AUTHENTICATION METHODS
// ============================================

const auth = {
  // Login with email and password
  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
          role: data.user.user_metadata?.role || 'User',
        },
        token: data.session.access_token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  // Sign up new user
  async signup(credentials) {
    try {
      const { email, password, name, role } = credentials;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: role || 'User',
          },
        },
      });

      if (error) throw error;

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || name,
          role: data.user.user_metadata?.role || role || 'User',
        },
        token: data.session?.access_token,
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
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  },

  // Get current authenticated user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        role: user.user_metadata?.role || 'User',
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

  // Redirect to login (for compatibility)
  async redirectToLogin(redirectUrl) {
    console.log('Redirect to login with:', redirectUrl);
    // In a real app, you might want to store redirectUrl for post-login redirect
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
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${bucket}/${fileName}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return {
          success: true,
          fileId: data.path,
          url: publicUrl,
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
  },
};

// ============================================
// DASHBOARD STATISTICS
// ============================================

async function getStats() {
  try {
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

    // Calculate fill rate (visits with caregivers / total visits)
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

    // Calculate Days Sales Outstanding (simplified - last 30 days)
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
