/**
 * Utility functions for the Care-Connect-Pro application
 */

/**
 * Create a URL path for a page
 * @param {string} pageName - The name of the page (e.g., "Dashboard", "Clients")
 * @returns {string} The URL path for the page (e.g., "/Dashboard", "/Clients")
 */
export function createPageUrl(pageName) {
  // Ensure the page name starts with a forward slash
  if (!pageName.startsWith('/')) {
    return `/${pageName}`;
  }
  return pageName;
}

/**
 * Get the current page name from a URL
 * @param {string} url - The current URL path
 * @returns {string} The page name
 */
export function getPageNameFromUrl(url) {
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split('/').pop();
  if (urlLastPart.includes('?')) {
    urlLastPart = urlLastPart.split('?')[0];
  }
  return urlLastPart || 'Dashboard';
}

/**
 * Format a date for display
 * @param {Date|string} date - The date to format
 * @param {string} formatString - The format string (default: 'MMM d, yyyy')
 * @returns {string} The formatted date
 */
export function formatDate(date, formatString = 'MMM d, yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  // Simple date formatting - you can use date-fns for more complex formatting
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} The formatted currency
 */
export function formatCurrency(amount, currency = 'USD') {
  if (typeof amount !== 'number') return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Truncate a string to a maximum length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated string
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Get initials from a name
 * @param {string} name - The full name
 * @returns {string} The initials
 */
export function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Calculate age from date of birth
 * @param {Date|string} dateOfBirth - The date of birth
 * @returns {number} The age in years
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get status badge color
 * @param {string} status - The status value
 * @returns {object} Object with className for the badge
 */
export function getStatusColor(status) {
  const statusLower = (status || '').toLowerCase();

  const colorMap = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-blue-100 text-blue-800',
    'scheduled': 'bg-purple-100 text-purple-800',
    'cancelled': 'bg-red-100 text-red-800',
    'in_progress': 'bg-cyan-100 text-cyan-800',
    'verified': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-red-100 text-red-800',
    'overdue': 'bg-orange-100 text-orange-800',
  };

  return colorMap[statusLower] || 'bg-gray-100 text-gray-800';
}
