import { CampaignBanner } from '../models/CampaignBanner.js'
import { Event } from '../models/Event.js'

const GLASS = new Set(['light', 'medium', 'heavy'])
const ANIM = new Set(['fadeUp', 'fade', 'slideRight'])

export const listCampaignBannersPublic = async (req, res, next) => {
  try {
    const slug = req.query.eventSlug?.trim()?.toLowerCase()
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Query eventSlug is required' })
    }
    const ev = await Event.findOne({ slug }).lean()
    if (!ev) return res.status(200).json({ success: true, data: [] })

    const rows = await CampaignBanner.find({ event: ev._id, enabled: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
    return res.status(200).json({ success: true, data: rows })
  } catch (e) {
    return next(e)
  }
}

export const listAdminCampaignBanners = async (req, res, next) => {
  try {
    const eventId = req.query.eventId?.trim()
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Query eventId is required' })
    }
    const rows = await CampaignBanner.find({ event: eventId })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
    return res.status(200).json({ success: true, data: rows })
  } catch (e) {
    return next(e)
  }
}

const normalizeBody = (body) => {
  const eyebrow = String(body?.eyebrow ?? '').trim()
  const title = String(body?.title ?? '').trim()
  const subtitle = String(body?.subtitle ?? '').trim()
  const image = String(body?.image ?? '').trim()
  const ctaLabel = String(body?.ctaLabel ?? '').trim()
  const ctaHref = String(body?.ctaHref ?? '').trim()
  const sortOrder = Math.floor(Number(body?.sortOrder) || 0)
  const enabled = body?.enabled !== false
  const glassStyle = GLASS.has(body?.glassStyle) ? body.glassStyle : 'medium'
  const textAnimation = ANIM.has(body?.textAnimation) ? body.textAnimation : 'fadeUp'
  return {
    eyebrow,
    title,
    subtitle,
    image,
    ctaLabel,
    ctaHref,
    sortOrder,
    enabled,
    glassStyle,
    textAnimation,
  }
}

export const createCampaignBanner = async (req, res, next) => {
  try {
    const event = req.body?.event
    if (!event) return res.status(400).json({ success: false, message: 'event is required' })
    const p = normalizeBody(req.body)
    if (!p.title) return res.status(400).json({ success: false, message: 'title is required' })
    if (!p.image) return res.status(400).json({ success: false, message: 'image URL is required' })

    const doc = await CampaignBanner.create({
      event,
      ...p,
    })
    return res.status(201).json({ success: true, data: doc })
  } catch (e) {
    return next(e)
  }
}

export const updateCampaignBanner = async (req, res, next) => {
  try {
    const p = normalizeBody(req.body)
    if (!p.title) return res.status(400).json({ success: false, message: 'title is required' })
    if (!p.image) return res.status(400).json({ success: false, message: 'image URL is required' })

    const doc = await CampaignBanner.findByIdAndUpdate(
      req.params.id,
      { $set: p },
      { new: true, runValidators: true }
    ).lean()
    if (!doc) return res.status(404).json({ success: false, message: 'Banner not found' })
    return res.status(200).json({ success: true, data: doc })
  } catch (e) {
    return next(e)
  }
}

export const deleteCampaignBanner = async (req, res, next) => {
  try {
    const r = await CampaignBanner.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ success: false, message: 'Banner not found' })
    return res.status(200).json({ success: true, data: null })
  } catch (e) {
    return next(e)
  }
}
