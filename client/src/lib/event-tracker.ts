// Client-side event tracking utility
export class EventTracker {
  static async track(eventData: {
    eventName: string;
    properties?: Record<string, any>;
  }) {
    try {
      const { eventName, properties = {} } = eventData;

      // Add client-side context
      const enrichedProperties = {
        ...properties,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Send to server
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1', // Would be dynamic in production
        },
        body: JSON.stringify({
          eventName,
          eventProperties: enrichedProperties,
          source: 'web',
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
      // Don't throw - tracking shouldn't break the app
    }
  }

  // Common event tracking methods
  static trackPageView(additionalProperties?: Record<string, any>) {
    return this.track({
      eventName: 'page.view',
      properties: {
        page: window.location.pathname,
        title: document.title,
        ...additionalProperties,
      },
    });
  }

  static trackClick(element: string, additionalProperties?: Record<string, any>) {
    return this.track({
      eventName: 'ui.click',
      properties: {
        element,
        ...additionalProperties,
      },
    });
  }

  static trackFeatureUsage(feature: string, additionalProperties?: Record<string, any>) {
    return this.track({
      eventName: 'feature.used',
      properties: {
        feature,
        ...additionalProperties,
      },
    });
  }

  static trackSearch(query: string, resultsCount?: number, additionalProperties?: Record<string, any>) {
    return this.track({
      eventName: 'search.query',
      properties: {
        query,
        resultsCount,
        ...additionalProperties,
      },
    });
  }

  static trackFormSubmission(formName: string, success: boolean, additionalProperties?: Record<string, any>) {
    return this.track({
      eventName: 'form.submit',
      properties: {
        formName,
        success,
        ...additionalProperties,
      },
    });
  }

  static trackNavigation(from: string, to: string, additionalProperties?: Record<string, any>) {
    return this.track({
      eventName: 'navigation',
      properties: {
        from,
        to,
        ...additionalProperties,
      },
    });
  }

  static trackAIInteraction(action: string, context: string, additionalProperties?: Record<string, any>) {
    return this.track({
      eventName: 'ai.interaction',
      properties: {
        action,
        context,
        ...additionalProperties,
      },
    });
  }
}