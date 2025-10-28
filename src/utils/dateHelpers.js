import { format as dateFnsFormat } from 'date-fns';

/**
 * Format visit date - handles both Supabase format (scheduled_start timestamp)
 * and legacy format (scheduled_date + scheduled_start_time)
 */
export function formatVisitDate(visit, formatString = 'MMM d, yyyy') {
  if (!visit) return 'No date';

  // Supabase format: scheduled_start timestamp
  if (visit.scheduled_start) {
    try {
      return dateFnsFormat(new Date(visit.scheduled_start), formatString);
    } catch (error) {
      console.error('Error formatting scheduled_start:', error);
      return 'Invalid date';
    }
  }

  // Legacy format: scheduled_date
  if (visit.scheduled_date) {
    try {
      return dateFnsFormat(new Date(visit.scheduled_date), formatString);
    } catch (error) {
      console.error('Error formatting scheduled_date:', error);
      return 'Invalid date';
    }
  }

  return 'No date';
}

/**
 * Format visit time range - handles both formats
 */
export function formatVisitTime(visit) {
  if (!visit) return '--:-- - --:--';

  // Supabase format: scheduled_start and scheduled_end timestamps
  if (visit.scheduled_start) {
    try {
      const startTime = dateFnsFormat(new Date(visit.scheduled_start), 'HH:mm');
      const endTime = visit.scheduled_end
        ? dateFnsFormat(new Date(visit.scheduled_end), 'HH:mm')
        : '--:--';
      return `${startTime} - ${endTime}`;
    } catch (error) {
      console.error('Error formatting visit times:', error);
      return '--:-- - --:--';
    }
  }

  // Legacy format: scheduled_start_time and scheduled_end_time strings
  const startTime = visit.scheduled_start_time || '--:--';
  const endTime = visit.scheduled_end_time || '--:--';
  return `${startTime} - ${endTime}`;
}

/**
 * Format visit date and time together
 */
export function formatVisitDateTime(visit) {
  const date = formatVisitDate(visit);
  const time = formatVisitTime(visit);
  return `${date} • ${time}`;
}

/**
 * Get visit date object for sorting/comparison
 */
export function getVisitDate(visit) {
  if (!visit) return null;

  if (visit.scheduled_start) {
    return new Date(visit.scheduled_start);
  }

  if (visit.scheduled_date) {
    return new Date(visit.scheduled_date);
  }

  return null;
}
