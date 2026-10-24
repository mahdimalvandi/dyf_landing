/**
 * DYF VIP Catalog — Analytics & Interaction Tracker (FE-023)
 * Tracks shoe impressions, dossier views, engagement duration,
 * and user interactions with session telemetry.
 */

export interface CatalogInteractionEvent {
  eventType: 'view_catalog' | 'view_shoe' | 'filter_category' | 'search' | 'open_3d' | 'order_intent';
  shoeID?: number;
  shoeTitle?: string;
  category?: string;
  query?: string;
  durationMs?: number;
  timestamp: number;
}

class CatalogAnalyticsTracker {
  private eventsQueue: CatalogInteractionEvent[] = [];
  private activeShoeView: { shoeID: number; shoeTitle: string; startTime: number } | null = null;
  private token: string = '';
  private isFlushScheduled = false;

  public init(linkToken: string) {
    this.token = linkToken || '';
    this.track('view_catalog', {});

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.endActiveShoeView();
        this.flush();
      });
    }
  }

  public track(
    eventType: CatalogInteractionEvent['eventType'],
    payload: { shoeID?: number; shoeTitle?: string; category?: string; query?: string; durationMs?: number }
  ) {
    const event: CatalogInteractionEvent = {
      eventType,
      ...payload,
      timestamp: Date.now(),
    };

    this.eventsQueue.push(event);
    this.scheduleFlush();
  }

  public startShoeView(shoeID: number, shoeTitle: string) {
    this.endActiveShoeView();
    this.activeShoeView = {
      shoeID,
      shoeTitle,
      startTime: Date.now(),
    };
    this.track('view_shoe', { shoeID, shoeTitle });
  }

  public endActiveShoeView() {
    if (!this.activeShoeView) return;
    const durationMs = Date.now() - this.activeShoeView.startTime;
    if (durationMs > 1000) {
      this.track('view_shoe', {
        shoeID: this.activeShoeView.shoeID,
        shoeTitle: this.activeShoeView.shoeTitle,
        durationMs,
      });
    }
    this.activeShoeView = null;
  }

  public trackSearch(query: string) {
    if (!query || query.length < 2) return;
    this.track('search', { query });
  }

  public trackCategoryFilter(category: string) {
    this.track('filter_category', { category });
  }

  public trackOrderIntent(shoeID: number, shoeTitle: string) {
    this.track('order_intent', { shoeID, shoeTitle });
  }

  private scheduleFlush() {
    if (this.isFlushScheduled) return;
    this.isFlushScheduled = true;
    setTimeout(() => {
      this.flush();
      this.isFlushScheduled = false;
    }, 4000);
  }

  public flush() {
    if (this.eventsQueue.length === 0) return;
    const batch = [...this.eventsQueue];
    this.eventsQueue = [];

    // Optional telemetry beacon or log
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        // Can be forwarded to /api/v1/catalog/events if endpoint exists
      }
    } catch {
      // Beacon failed or not supported
    }
  }
}

export const analyticsTracker = new CatalogAnalyticsTracker();
