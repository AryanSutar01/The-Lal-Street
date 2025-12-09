import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { logger } from './logger';

export interface ServerHealthStatus {
  isHealthy: boolean;
  isLoading: boolean;
  memoryUsage?: {
    heapUsed: string;
    heapTotal: string;
    rss: string;
  };
  uptime?: string;
  error?: string;
}

/**
 * Check server health and load status
 * Returns true if server is healthy and not under heavy load
 */
export async function checkServerHealth(): Promise<ServerHealthStatus> {
  try {
    // Create timeout controller for better browser compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        isHealthy: false,
        isLoading: true,
        error: `Server returned ${response.status}`,
      };
    }

    const data = await response.json();
    
    // Check if server is healthy
    if (data.status !== 'ok') {
      return {
        isHealthy: false,
        isLoading: true,
        error: 'Server status is not OK',
      };
    }

    // Check memory usage to determine load
    // Consider server under load if heap used > 80% of heap total
    if (data.memory) {
      const heapUsedMB = parseInt(data.memory.heapUsed.replace('MB', ''));
      const heapTotalMB = parseInt(data.memory.heapTotal.replace('MB', ''));
      
      if (heapTotalMB > 0) {
        const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;
        
        // Server is under load if memory usage > 80%
        const isUnderLoad = heapUsagePercent > 80;
        
        return {
          isHealthy: true,
          isLoading: isUnderLoad,
          memoryUsage: data.memory,
          uptime: data.uptime,
        };
      }
    }

    // Default to healthy if we can't determine load
    return {
      isHealthy: true,
      isLoading: false,
      memoryUsage: data.memory,
      uptime: data.uptime,
    };
  } catch (error: any) {
    // Network error or timeout
    const errorMessage = error.name === 'AbortError' 
      ? 'Server health check timed out'
      : error.message || 'Failed to check server health';
    
    logger.warn('Server health check failed:', errorMessage);
    return {
      isHealthy: false,
      isLoading: true,
      error: errorMessage,
    };
  }
}

/**
 * Check if enough time has passed since last calculation
 */
export function shouldRecalculate(lastCalculationDate?: string, daysThreshold: number = 5): boolean {
  if (!lastCalculationDate) {
    return true; // Never calculated, should calculate
  }

  const lastDate = new Date(lastCalculationDate);
  const now = new Date();
  const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysDiff >= daysThreshold;
}

/**
 * Warm up the server by hitting the health check endpoint
 * This prevents cold start delays when the server is inactive
 * Returns a promise that resolves when the server is warmed up (or times out)
 */
export async function warmUpServer(): Promise<void> {
  try {
    // Use a longer timeout for warm-up to allow server to start from cold state
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(API_ENDPOINTS.HEALTH_CHECK, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      logger.log('Server warmed up successfully');
    } else {
      logger.warn('Server warm-up received non-OK response:', response.status);
    }
  } catch (error: any) {
    // Silently handle errors - warm-up is best effort
    // Server might still be starting up, which is fine
    if (error.name !== 'AbortError') {
      logger.warn('Server warm-up failed (server may still be starting):', error.message);
    }
  }
}

