// Mock client to simulate Base44 SDK for local development
import { mockData, mockStats } from './mockData';

// Helper to simulate async API calls
const asyncDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Create mock entity class
class MockEntity {
  constructor(name, data) {
    this.name = name;
    this.data = [...data];
  }

  async list(options = {}) {
    await asyncDelay();
    let result = [...this.data];

    // Apply filters if provided
    if (options.filter) {
      result = result.filter(item => {
        return Object.entries(options.filter).every(([key, value]) => {
          if (item[key] === undefined) return true;
          return String(item[key]).toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }

    // Apply sorting if provided (can be a string like '-created_date')
    if (options.sort || typeof options === 'string') {
      const sortStr = typeof options === 'string' ? options : options.sort;
      if (sortStr) {
        const isDesc = sortStr.startsWith('-');
        const field = isDesc ? sortStr.substring(1) : sortStr;
        result.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          if (isDesc) {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }
    }

    // Apply pagination
    const limit = options.limit || result.length;
    const offset = options.offset || 0;

    // Return just the data array (not wrapped in an object)
    // This matches the Base44 SDK behavior
    return result.slice(offset, offset + limit);
  }

  async get(id) {
    await asyncDelay();
    const item = this.data.find(item => item.id === id);
    if (!item) {
      throw new Error(`${this.name} with id ${id} not found`);
    }
    return item;
  }

  async create(data) {
    await asyncDelay();
    const newItem = {
      id: String(this.data.length + 1),
      ...data,
      createdAt: new Date().toISOString()
    };
    this.data.push(newItem);
    return newItem;
  }

  async update(id, data) {
    await asyncDelay();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`${this.name} with id ${id} not found`);
    }
    this.data[index] = { ...this.data[index], ...data, updatedAt: new Date().toISOString() };
    return this.data[index];
  }

  async delete(id) {
    await asyncDelay();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`${this.name} with id ${id} not found`);
    }
    this.data.splice(index, 1);
    return { success: true };
  }
}

// Create entity instances
const entityInstances = {
  Client: new MockEntity('Client', mockData.clients),
  Caregiver: new MockEntity('Caregiver', mockData.caregivers),
  Visit: new MockEntity('Visit', mockData.visits),
  EVVEvent: new MockEntity('EVVEvent', mockData.evvEvents),
  Claim: new MockEntity('Claim', mockData.claims),
  Document: new MockEntity('Document', mockData.documents),
  Message: new MockEntity('Message', mockData.messages),
  MedicationSchedule: new MockEntity('MedicationSchedule', mockData.medications),
  CarePlan: new MockEntity('CarePlan', mockData.carePlans),
  Incident: new MockEntity('Incident', mockData.incidents),
  FamilyMember: new MockEntity('FamilyMember', mockData.familyMembers),
  AuditLog: new MockEntity('AuditLog', mockData.auditLogs),
  FamilyPortalAccess: new MockEntity('FamilyPortalAccess', mockData.familyPortalAccess || []),
  VisitRating: new MockEntity('VisitRating', mockData.visitRatings || []),
  Channel: new MockEntity('Channel', []),
  MedicationAdministration: new MockEntity('MedicationAdministration', []),
  QualityAudit: new MockEntity('QualityAudit', []),
  ClientSatisfactionSurvey: new MockEntity('ClientSatisfactionSurvey', [])
};

// Create mock client
export const createMockClient = () => {
  return {
    // Entity access (both methods for compatibility)
    entity: (name) => {
      return entityInstances[name] || new MockEntity(name, []);
    },

    // Entities object for direct access (e.g., base44.entities.Client)
    entities: entityInstances,

    // Integration methods
    integration: {
      email: {
        async send(data) {
          await asyncDelay();
          console.log('Mock email sent:', data);
          return { success: true, messageId: `msg_${Date.now()}` };
        }
      },

      llm: {
        async generateText(prompt) {
          await asyncDelay();
          return { text: 'This is a mock LLM response. Configure a real LLM integration for production.' };
        }
      },

      file: {
        async upload(file) {
          await asyncDelay();
          return {
            success: true,
            fileId: `file_${Date.now()}`,
            url: URL.createObjectURL(file)
          };
        },

        async download(fileId) {
          await asyncDelay();
          return new Blob(['Mock file content'], { type: 'text/plain' });
        }
      }
    },

    // Auth methods
    auth: {
      async login(credentials) {
        await asyncDelay();
        console.log('Mock login:', credentials);
        const user = {
          id: '1',
          email: credentials.email,
          name: 'Demo User',
          role: 'Admin'
        };
        const token = 'mock_token_' + Date.now();

        // Store auth state in localStorage
        localStorage.setItem('mock_auth_token', token);
        localStorage.setItem('mock_auth_user', JSON.stringify(user));

        return {
          success: true,
          user,
          token
        };
      },

      async signup(credentials) {
        await asyncDelay();
        console.log('Mock signup:', credentials);
        const { email, password, name, role } = credentials;

        const user = {
          id: 'user_' + Date.now(),
          email,
          name: name || email.split('@')[0],
          role: role || 'Admin'
        };
        const token = 'mock_token_' + Date.now();

        // Store auth state in localStorage
        localStorage.setItem('mock_auth_token', token);
        localStorage.setItem('mock_auth_user', JSON.stringify(user));

        return {
          success: true,
          user,
          token
        };
      },

      async logout() {
        await asyncDelay();
        // Clear auth state
        localStorage.removeItem('mock_auth_token');
        localStorage.removeItem('mock_auth_user');
        return { success: true };
      },

      async getCurrentUser() {
        await asyncDelay();
        const userStr = localStorage.getItem('mock_auth_user');
        if (userStr) {
          return JSON.parse(userStr);
        }
        return null;
      },

      async me() {
        // Alias for getCurrentUser (used by some pages)
        return this.getCurrentUser();
      },

      async isAuthenticated() {
        await asyncDelay();
        const token = localStorage.getItem('mock_auth_token');
        return !!token;
      },

      async redirectToLogin(redirectUrl) {
        // In mock mode, we don't actually redirect
        // The login page will handle the form-based login
        console.log('Mock redirectToLogin called with:', redirectUrl);
        return { redirectUrl };
      }
    },

    // Dashboard stats
    async getStats() {
      await asyncDelay();
      return mockStats;
    }
  };
};
