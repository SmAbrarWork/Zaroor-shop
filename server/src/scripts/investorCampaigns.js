/**
 * Extra campaigns for the investor walkthrough.
 * Appended once per process, on top of the Azadi and Anime seed data.
 */
const SHIRT_SIZES = ['Small', 'Medium', 'Large']
const WAISTS = [30, 32, 34, 36]

function shirtVariants(colors) {
  return colors.flatMap((color, colorIndex) =>
    SHIRT_SIZES.map((size, sizeIndex) => ({
      color,
      size,
      waistSize: null,
      stock: 6 + ((colorIndex + sizeIndex) % 4) * 2,
    }))
  )
}

function pantsVariants(colors) {
  return colors.flatMap((color, colorIndex) =>
    WAISTS.map((waistSize, waistIndex) => ({
      color,
      size: '',
      waistSize,
      stock: 4 + ((colorIndex + waistIndex) % 3) * 2,
    }))
  )
}

function colorOnlyVariants(colors) {
  return colors.map((color, colorIndex) => ({
    color,
    size: '',
    waistSize: null,
    stock: 8 + (colorIndex % 3) * 3,
  }))
}

const campaigns = [
  {
    name: '11.11 Midnight Drop',
    slug: 'eleven-eleven',
    theme: { primary: '#1c0a2e', accent: '#fb7185', text: '#fff1f2', surface: '#2e1064' },
    heroTitle: '11.11 Midnight Drop',
    heroSubtitle: 'Ten days. One price cut. Then it is gone.',
    heroImageKey: 'street',
    ctaLabel: 'Shop the midnight drop',
    campaignFocus: 'Urgency. Scarcity. A date the room can see.',
    displayMode: 'countdown',
    bannerText: '11.11 ends 11 November at midnight',
    countdownDate: new Date('2026-11-11T23:59:59'),
    startDate: new Date('2026-10-20'),
    endDate: new Date('2026-11-11T23:59:59'),
    story:
      'A ten-day price cut on pieces that will not be restocked. The original price stays on the tile, and cash on delivery stays on.',
    categories: [
      ['signal-tees', 'Signal tees', 'High-contrast prints made for the sale tile.'],
      ['night-bottoms', 'Night bottoms', 'Cargos and joggers priced for the drop window.'],
      ['last-call', 'Last call', 'The hoodie and court sneaker that leave the site on the 11th.'],
    ],
    banners: [
      ['Sale window', 'The price on the tile is the price at the door', 'Original price stays visible so the discount is obvious on a phone.', 'street', 'Shop the drop', '/shop/all', 'heavy', 'fadeUp'],
      ['Cash on delivery', 'No card. No hesitation.', 'Pay when the rider arrives. The sale price is the price on the doorstep.', 'tee3', 'See hot drops', '/#shop-hot-drops', 'medium', 'slideRight'],
    ],
    products: [
      ['shirt', true, 0, 'signal-tees', 'Signal Red Boxy Tee', 'midnight-signal-red-boxy-tee', 2490, 3290, 'Boxy tee with a single red bar across the chest. Built to read on a grid.', ['Signal Red', 'Black', 'White'], 'tee1'],
      ['pants', true, 1, 'night-bottoms', 'After Hours Cargo', 'midnight-after-hours-cargo', 2790, 3490, 'Matte cargo with a hidden phone pocket. The sale price is the one on the product page.', ['Black', 'Charcoal', 'Olive'], 'pants1'],
      ['other', true, 2, 'last-call', 'Midnight Court Sneaker', 'midnight-court-sneaker', 4490, 5990, 'Court sneaker in the sale colourway. One pair per size, then it is gone.', ['Black', 'White', 'Red'], 'tee2'],
      ['shirt', false, 0, 'last-call', 'Archive Hoodie', 'midnight-archive-hoodie', 3290, 3990, 'Heavy fleece hoodie kept off the hot-drop strip. The sale price is printed next to the old one.', ['Black', 'Bone'], 'tee3'],
    ],
  },
  {
    name: 'Winter Karachi',
    slug: 'winter-karachi',
    theme: { primary: '#0c1929', accent: '#7dd3fc', text: '#f0f9ff', surface: '#0f2744' },
    heroTitle: 'Winter Karachi',
    heroSubtitle: 'Light layers for a city that never really freezes',
    heroImageKey: 'urban',
    ctaLabel: 'Shop winter layers',
    campaignFocus: 'Season. Climate. A reason to buy now.',
    displayMode: 'text',
    bannerText: 'Winter Karachi — layers, not parkas',
    countdownDate: new Date('2027-02-15T23:59:59'),
    startDate: new Date('2026-11-01'),
    endDate: new Date('2027-02-15T23:59:59'),
    story:
      'Light layers for a Karachi December: a heavier tee, a lined cargo, an overshirt, and a knit hoodie. Shipping changes with the city.',
    categories: [
      ['layer-tees', 'Layer tees', 'Heavier cotton meant to sit under a shirt.'],
      ['lined-bottoms', 'Lined bottoms', 'Cargos with a light lining for December evenings.'],
      ['sea-breeze', 'Sea breeze', 'Lighter pieces for a warm afternoon in the same week.'],
    ],
    banners: [
      ['In season', 'Karachi winter, cut for the street', 'Not a coat drop. A layer drop. The story on the hero matches the products under it.', 'urban', 'Browse layers', '/shop/all', 'heavy', 'fadeUp'],
      ['City shipping', 'Karachi is not the same rate as Quetta', 'Each piece carries its own zone rates. Checkout adds them in front of the buyer.', 'street', 'Open a product', '/#shop-hot-drops', 'light', 'fade'],
    ],
    products: [
      ['shirt', true, 0, 'layer-tees', 'Clifton Heavyweight Tee', 'winter-clifton-heavyweight-tee', 2690, 3190, 'Brushed interior, dropped shoulder. The winter piece that still looks like a tee.', ['Navy', 'Fog', 'Black'], 'tee2'],
      ['pants', true, 1, 'lined-bottoms', 'Sea View Lined Cargo', 'winter-sea-view-lined-cargo', 3290, 3990, 'Light fleece lining, taper from the knee. Waist sizes are real stock rows.', ['Navy', 'Stone', 'Black'], 'pants2'],
      ['shirt', true, 2, 'sea-breeze', 'Hawksbay Overshirt', 'winter-hawksbay-overshirt', 3490, 4290, 'An overshirt that works as the jacket in this climate.', ['Sand', 'Olive', 'Charcoal'], 'urban'],
      ['shirt', false, 0, 'layer-tees', 'Do Darya Knit Hoodie', 'winter-do-darya-knit-hoodie', 3890, 4490, 'Knit hoodie for the evening wind off the sea. Not on the hot-drop strip.', ['Navy', 'Fog'], 'tee1'],
    ],
  },
  {
    name: 'Eid Night Edit',
    slug: 'eid-night',
    theme: { primary: '#1a1408', accent: '#e8c872', text: '#fffbeb', surface: '#292114' },
    heroTitle: 'Eid Night Edit',
    heroSubtitle: 'After the visiting. Before the photos.',
    heroImageKey: 'tee3',
    ctaLabel: 'Shop the Eid edit',
    campaignFocus: 'Occasion. Gold. A date on the calendar.',
    displayMode: 'countdown',
    bannerText: 'Eid Night Edit — dressing for the second half of the day',
    countdownDate: new Date('2027-03-20T23:59:59'),
    startDate: new Date('2026-12-01'),
    endDate: new Date('2027-03-25T23:59:59'),
    story:
      'What you wear after lunch and before the photos: an evening shirt, a pressed trouser, a waistcoat, and a simple kurta shirt.',
    categories: [
      ['evening-tees', 'Evening tees', 'Cleaner graphics for night visits.'],
      ['guest-bottoms', 'Guest bottoms', 'Straight legs that read dressed, not gym.'],
      ['gold-hour', 'Gold hour', 'The waistcoat, cut for the evening function.'],
    ],
    banners: [
      ['Occasion', 'The outfit after the lunch', 'A second shopping moment on a day people already spend.', 'tee3', 'Shop evening tees', '/shop/shirts', 'heavy', 'fadeUp'],
      ['Still counting', 'The outfit is dated. The page is too.', 'When the night is over, this edit comes down.', 'anime2', 'See the edit', '/shop/all', 'medium', 'fade'],
    ],
    products: [
      ['shirt', true, 0, 'evening-tees', 'Moonthread Evening Tee', 'eid-moonthread-evening-tee', 2890, 3490, 'Black tee with a fine gold stitch at the collar. Quiet enough for a family photo.', ['Black', 'Ivory', 'Gold'], 'tee3'],
      ['pants', true, 1, 'guest-bottoms', 'Visiting Hour Trouser', 'eid-visiting-hour-trouser', 3190, 3890, 'Straight trouser with a soft crease. Sold by waist, not by a generic size.', ['Black', 'Sand', 'Olive'], 'pants1'],
      ['other', true, 2, 'gold-hour', 'Gold Hour Waistcoat', 'eid-gold-hour-waistcoat', 4490, 5490, 'A short waistcoat in a warm metal tone. Worn open over the evening shirt.', ['Gold', 'Black', 'Ivory'], 'anime2'],
      ['shirt', false, 0, 'evening-tees', 'Second Visit Kurta Shirt', 'eid-second-visit-kurta', 2790, 3290, 'A straight kurta shirt for the next house. Collar, not a graphic.', ['Ivory', 'Sage'], 'tee1'],
    ],
  },
  {
    name: 'PSL Lights',
    slug: 'psl-lights',
    theme: { primary: '#052e16', accent: '#facc15', text: '#f7fee7', surface: '#14532d' },
    heroTitle: 'PSL Lights',
    heroSubtitle: 'Match night, without the replica shirt',
    heroImageKey: 'street',
    ctaLabel: 'Shop match night',
    campaignFocus: 'Sport. Crowd. A season people already follow.',
    displayMode: 'countdown',
    bannerText: 'PSL Lights — wear the night, not the jersey',
    countdownDate: new Date('2027-02-15T18:00:00'),
    startDate: new Date('2027-01-10'),
    endDate: new Date('2027-03-20T23:59:59'),
    story:
      'Match-night clothes with no club badge: a numbered tee, a cargo for the stands, a cap, and a track pant for the walk home.',
    categories: [
      ['floodlight-tees', 'Floodlight tees', 'High-vis graphics under stadium light.'],
      ['stands-bottoms', 'Stands bottoms', 'Cargos you can sit in for four hours.'],
      ['away-end', 'Away end', 'The cap and the darker pieces for a night game.'],
    ],
    banners: [
      ['Match night', 'Green pitch. Yellow light. No badge.', 'Original graphics only, so the brand is not borrowing a franchise mark.', 'street', 'Shop floodlight tees', '/shop/shirts', 'heavy', 'slideRight'],
      ['No replica', 'Wear the night, not the jersey', 'Original prints only. Nothing here borrows a franchise mark.', 'tee2', 'Browse the stands', '/shop/all', 'medium', 'fadeUp'],
    ],
    products: [
      ['shirt', true, 0, 'floodlight-tees', 'Floodlight Number Tee', 'psl-floodlight-number-tee', 2590, 3190, 'Oversized number with no team name. Reads as merch, not a replica.', ['Pitch Green', 'Yellow', 'Black'], 'tee2'],
      ['pants', true, 1, 'stands-bottoms', 'Boundary Cargo', 'psl-boundary-cargo', 2990, 3590, 'Room in the thigh, zip pocket for a phone and a ticket.', ['Pitch Green', 'Black', 'Stone'], 'pants2'],
      ['other', true, 2, 'away-end', 'Night Game Cap', 'psl-night-game-cap', 1290, 1590, 'Unstructured cap with a yellow stitch on the brim. No team mark.', ['Black', 'Pitch Green', 'Yellow'], 'urban'],
      ['pants', false, 0, 'stands-bottoms', 'Pavilion Track Pant', 'psl-pavilion-track-pant', 2490, 2890, 'Tapered track pant for leaving the ground. Kept off the hot-drop strip.', ['Black', 'Pitch Green'], 'tee1'],
    ],
  },
  {
    name: 'Shaadi Guest',
    slug: 'shaadi-guest',
    theme: { primary: '#2a0a14', accent: '#fda4af', text: '#fff1f2', surface: '#4c0519' },
    heroTitle: 'Shaadi Guest',
    heroSubtitle: 'Three functions. One bag that still looks considered.',
    heroImageKey: 'anime2',
    ctaLabel: 'Shop guest edits',
    campaignFocus: 'Weddings. Repeat wear. A Pakistani calendar.',
    displayMode: 'text',
    bannerText: 'Shaadi season — mehndi, barat, and the morning after',
    countdownDate: new Date('2027-04-30T23:59:59'),
    startDate: new Date('2026-11-01'),
    endDate: new Date('2027-04-30T23:59:59'),
    story:
      'The drop that makes the catalog feel local. Pieces for the guest, not the couple: softer colours, cleaner cuts, and a story a buyer in Lahore or Karachi recognises.',
    categories: [
      ['mehndi-tees', 'Mehndi tees', 'Colour for the afternoon function.'],
      ['barat-cuts', 'Barat cuts', 'Darker, sharper pieces for the night.'],
      ['morning-after', 'Morning after', 'What you actually travel home in.'],
    ],
    banners: [
      ['Three functions', 'Dress the guest, not the stage', 'A campaign with a reason to own more than one piece.', 'anime2', 'Shop mehndi tees', '/shop/shirts', 'heavy', 'fadeUp'],
      ['Nationwide', 'Same outfit, a different rider', 'Karachi, Lahore, and Quetta do not share a delivery price. It is on the product before you pay.', 'pants1', 'Check a product', '/#shop-hot-drops', 'light', 'fade'],
    ],
    products: [
      ['shirt', true, 0, 'mehndi-tees', 'Mehndi Marigold Tee', 'shaadi-mehndi-marigold-tee', 2390, 2890, 'Warm yellow tee with a small floral line at the hem. Loud enough for daylight.', ['Marigold', 'Ivory', 'Rose'], 'tee3'],
      ['pants', true, 1, 'barat-cuts', 'Barat Night Trouser', 'shaadi-barat-night-trouser', 3490, 4190, 'Black straight leg with a satin finish under phone flash.', ['Black', 'Wine', 'Ivory'], 'pants1'],
      ['shirt', true, 2, 'morning-after', 'Valima Kurta Shirt', 'shaadi-valima-kurta', 3290, 3890, 'Straight kurta shirt for the lunch the next day. No print.', ['Ivory', 'Sage', 'Blush'], 'tee1'],
      ['other', false, 0, 'mehndi-tees', 'Dholki Potli Bag', 'shaadi-dholki-potli', 1890, 2290, 'A small potli for the afternoon function. One colour, limited run.', ['Rose', 'Ivory', 'Marigold'], 'anime3'],
    ],
  },
  {
    name: 'Campus Week',
    slug: 'campus-week',
    theme: { primary: '#111827', accent: '#34d399', text: '#ecfdf5', surface: '#064e3b' },
    heroTitle: 'Campus Week',
    heroSubtitle: 'First week back. One good shirt.',
    heroImageKey: 'anime3',
    ctaLabel: 'Shop campus week',
    campaignFocus: 'Students. Price. A younger buyer.',
    displayMode: 'text',
    bannerText: 'Campus Week — priced for a monthly allowance',
    countdownDate: new Date('2026-12-20T23:59:59'),
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-12-20T23:59:59'),
    story:
      'The first week back: a lecture tee, a jogger, a fest hoodie, and a tote that fits a laptop. Priced for an allowance.',
    categories: [
      ['lecture-tees', 'Lecture tees', 'Plain-enough tees that still look like the brand.'],
      ['quad-bottoms', 'Quad bottoms', 'Cargos and joggers for a full day on campus.'],
      ['society-night', 'Society night', 'Slightly louder pieces for a fest evening.'],
    ],
    banners: [
      ['Allowance price', 'The cheap tee is still on-brand', 'Discount math is on the card: original, sale price, percent.', 'anime3', 'Shop lecture tees', '/shop/shirts', 'medium', 'fadeUp'],
      ['Fest night', 'The loud piece is for the evening', 'Daytime stays plain. The hoodie is for the society show.', 'urban', 'See hot drops', '/#shop-hot-drops', 'heavy', 'slideRight'],
    ],
    products: [
      ['shirt', true, 0, 'lecture-tees', 'Lecture Hall Tee', 'campus-lecture-hall-tee', 1690, 1990, 'Midweight tee at the lowest ticket in the demo catalog.', ['White', 'Black', 'Forest'], 'tee1'],
      ['pants', true, 1, 'quad-bottoms', 'Quad Jogger', 'campus-quad-jogger', 2190, 2590, 'Tapered jogger with a zip ankle. Waist stock is per size.', ['Black', 'Grey', 'Forest'], 'pants2'],
      ['shirt', true, 2, 'society-night', 'Fest Night Hoodie', 'campus-fest-night-hoodie', 2490, 2990, 'A louder hoodie for the evening show, still under Rs 3,000.', ['Forest', 'Black', 'White'], 'street'],
      ['other', false, 0, 'lecture-tees', 'Library Tote', 'campus-library-tote', 990, 1290, 'Canvas tote that fits a 14-inch laptop. Not on the hot-drop strip.', ['Grey', 'Forest'], 'tee2'],
    ],
  },
]

function priceFields(sale, original) {
  const discountPercent = Math.round((1 - sale / original) * 100)
  return {
    price: sale,
    initialPrice: original,
    discountedPrice: sale,
    discountPercent,
  }
}

export function appendInvestorCampaigns({ events, categoryDefs, productDefs, campaignBannerDefs, IMG }) {
  if (events.some((event) => event.slug === 'eleven-eleven')) return

  for (const campaign of campaigns) {
    events.push({
      name: campaign.name,
      slug: campaign.slug,
      theme: campaign.theme,
      heroTitle: campaign.heroTitle,
      heroSubtitle: campaign.heroSubtitle,
      heroImage: IMG[campaign.heroImageKey],
      ctaLabel: campaign.ctaLabel,
      campaignFocus: campaign.campaignFocus,
      displayMode: campaign.displayMode,
      bannerText: campaign.bannerText,
      countdownDate: campaign.countdownDate,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      story: campaign.story,
    })

    campaign.categories.forEach(([slug, name, description], index) => {
      categoryDefs.push({
        eventSlug: campaign.slug,
        slug,
        name,
        description,
        sortOrder: index + 1,
      })
    })

    campaign.banners.forEach(([eyebrow, title, subtitle, imageKey, ctaLabel, ctaHref, glassStyle, textAnimation], index) => {
      campaignBannerDefs.push({
        eventSlug: campaign.slug,
        eyebrow,
        title,
        subtitle,
        image: IMG[imageKey],
        ctaLabel,
        ctaHref,
        sortOrder: index,
        enabled: true,
        glassStyle,
        textAnimation,
      })
    })

    campaign.products.forEach(([productType, isHotDrop, hotDropOrder, categorySlug, name, slug, sale, original, description, colors, imageKey]) => {
      const isPants = productType === 'pants'
      const isShoe = /sneaker|shoe/i.test(name)
      const isOther = productType === 'other' && !isShoe
      const shoeSizes = ['UK 7', 'UK 8', 'UK 9', 'UK 10']
      productDefs.push({
        eventSlug: campaign.slug,
        categorySlug,
        isHotDrop,
        hotDropOrder,
        name,
        slug,
        productType,
        ...priceFields(sale, original),
        image: IMG[imageKey],
        tags: [campaign.slug],
        stock: isPants ? 48 : 42,
        description,
        options: isPants
          ? { colors, sizes: [], waistSizes: WAISTS }
          : isShoe
            ? { colors, sizes: shoeSizes, waistSizes: [] }
            : isOther
              ? { colors, sizes: [], waistSizes: [] }
              : { colors, sizes: SHIRT_SIZES, waistSizes: [] },
        variantStock: isPants
          ? pantsVariants(colors)
          : isShoe
            ? colors.flatMap((color) => shoeSizes.map((size) => ({ color, size, waistSize: null, stock: 4 })))
            : isOther
              ? colorOnlyVariants(colors)
              : shirtVariants(colors),
      })
    })
  }
}
