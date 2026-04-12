export class TrackingService {
  constructor({ metaPixelId = '', metaConversionsToken = '', ga4MeasurementId = '', ga4ApiSecret = '' } = {}) {
    this.metaPixelId = metaPixelId
    this.metaConversionsToken = metaConversionsToken
    this.ga4MeasurementId = ga4MeasurementId
    this.ga4ApiSecret = ga4ApiSecret
  }

  async track(eventName, payload = {}) {
    const results = { timestamp: new Date().toISOString(), eventName, providers: [] }

    // Meta Conversions API (server-side)
    if (this.metaPixelId && this.metaConversionsToken) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${this.metaPixelId}/events?access_token=${this.metaConversionsToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                user_data: payload.user_data ?? {},
                custom_data: payload.custom_data ?? payload,
              }],
            }),
          }
        )
        const data = await res.json()
        results.providers.push({ name: 'meta', ok: res.ok, events_received: data.events_received })
      } catch (err) {
        results.providers.push({ name: 'meta', ok: false, error: err.message })
      }
    }

    // GA4 Measurement Protocol (server-side)
    if (this.ga4MeasurementId && this.ga4ApiSecret) {
      try {
        const res = await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${this.ga4MeasurementId}&api_secret=${this.ga4ApiSecret}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: payload.client_id ?? 'server',
              events: [{ name: eventName, params: payload }],
            }),
          }
        )
        results.providers.push({ name: 'ga4', ok: res.ok })
      } catch (err) {
        results.providers.push({ name: 'ga4', ok: false, error: err.message })
      }
    }

    if (results.providers.length === 0) {
      results.providers.push({ name: 'noop', ok: true })
    }

    return results
  }
}
