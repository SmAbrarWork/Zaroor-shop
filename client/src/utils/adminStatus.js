export const orderStatusColor = (s) =>
  s === 'delivered'
    ? 'bg-green-500/20 text-green-400'
    : s === 'shipped'
      ? 'bg-blue-500/20 text-blue-400'
      : s === 'confirmed'
        ? 'bg-yellow-500/20 text-yellow-400'
        : 'bg-white/10 text-white/60'
