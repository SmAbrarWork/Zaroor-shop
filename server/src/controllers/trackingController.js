export const createTrackingController = (trackingService) => ({
  trackEvent: async (req, res, next) => {
    try {
      const { eventName, payload } = req.body ?? {}
      if (!eventName) {
        return res.status(400).json({ success: false, message: 'eventName is required' })
      }
      const result = await trackingService.track(eventName, payload)
      return res.status(202).json({ success: true, data: result })
    } catch (error) {
      return next(error)
    }
  },
})
