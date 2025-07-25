// Google Analytics configuration
// إعداد Google Analytics

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Get Google Analytics ID from environment variables
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

// Check if Google Analytics is enabled
export const isAnalyticsEnabled = () => {
  return typeof window !== 'undefined' && GA_TRACKING_ID && GA_TRACKING_ID !== 'undefined';
};

// Initialize Google Analytics
export const initializeAnalytics = () => {
  if (!isAnalyticsEnabled()) {
    console.log('📊 Google Analytics disabled - no tracking ID provided');
    return;
  }

  try {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    
    // Configure Google Analytics
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID!, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('📊 Google Analytics initialized with ID:', GA_TRACKING_ID);
  } catch (error) {
    console.error('❌ Error initializing Google Analytics:', error);
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!isAnalyticsEnabled()) return;

  try {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
      page_title: title || document.title,
    });
  } catch (error) {
    console.error('❌ Error tracking page view:', error);
  }
};

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!isAnalyticsEnabled()) return;

  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch (error) {
    console.error('❌ Error tracking event:', error);
  }
};

// Track custom events
export const trackCustomEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (!isAnalyticsEnabled()) return;

  try {
    window.gtag('event', eventName, parameters);
  } catch (error) {
    console.error('❌ Error tracking custom event:', error);
  }
};

// Track user interactions
export const trackUserInteraction = (interaction: string, element: string, details?: Record<string, any>) => {
  trackEvent(interaction, 'user_interaction', element, details?.value);
  
  if (details) {
    trackCustomEvent(`user_${interaction}`, {
      element,
      ...details
    });
  }
};

// Track admin actions
export const trackAdminAction = (action: string, resource: string, details?: Record<string, any>) => {
  if (!isAnalyticsEnabled()) return;

  trackEvent(action, 'admin_action', resource);
  
  trackCustomEvent('admin_action', {
    action,
    resource,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Track test interactions
export const trackTestInteraction = (testId: string, action: string, details?: Record<string, any>) => {
  trackEvent(action, 'test_interaction', testId);
  
  trackCustomEvent('test_interaction', {
    test_id: testId,
    action,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Track color analysis
export const trackColorAnalysis = (method: string, colorsFound: number, analysisTime: number) => {
  trackEvent('color_analysis', 'analysis', method, colorsFound);
  
  trackCustomEvent('color_analysis_completed', {
    method,
    colors_found: colorsFound,
    analysis_time_ms: analysisTime,
    timestamp: new Date().toISOString()
  });
};

// Track errors
export const trackError = (error: string, category: string, details?: Record<string, any>) => {
  trackEvent('error', category, error);
  
  trackCustomEvent('application_error', {
    error_message: error,
    error_category: category,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  trackEvent('performance', metric, unit, value);
  
  trackCustomEvent('performance_metric', {
    metric,
    value,
    unit,
    timestamp: new Date().toISOString()
  });
};

// Get Google Analytics script URL
export const getAnalyticsScriptUrl = () => {
  if (!GA_TRACKING_ID || GA_TRACKING_ID === 'undefined') {
    return null;
  }
  return `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
};

// Load Google Analytics script
export const loadAnalyticsScript = () => {
  if (!isAnalyticsEnabled()) {
    console.log('📊 Skipping Google Analytics script load - not enabled');
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    try {
      const scriptUrl = getAnalyticsScriptUrl();
      if (!scriptUrl) {
        console.log('📊 No Google Analytics script URL available');
        resolve();
        return;
      }

      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
      if (existingScript) {
        console.log('📊 Google Analytics script already loaded');
        resolve();
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptUrl;
      
      script.onload = () => {
        console.log('📊 Google Analytics script loaded successfully');
        initializeAnalytics();
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('❌ Error loading Google Analytics script:', error);
        reject(error);
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ Error setting up Google Analytics script:', error);
      reject(error);
    }
  });
};

// Initialize analytics on app start
export const setupAnalytics = () => {
  if (typeof window === 'undefined') {
    console.log('📊 Skipping analytics setup - server side');
    return;
  }

  if (!isAnalyticsEnabled()) {
    console.log('📊 Analytics disabled - no tracking ID provided');
    return;
  }

  // Load analytics script
  loadAnalyticsScript().catch(error => {
    console.error('❌ Failed to load analytics:', error);
  });
};

// Export the tracking ID for use in other components
export { GA_TRACKING_ID };
