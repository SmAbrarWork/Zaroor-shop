import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-center">
      <p className="text-sm uppercase tracking-wider text-white/60">404</p>
      <h2 className="mt-2 text-3xl font-black">This drop does not exist.</h2>
      <Link to="/" className="mt-4 inline-block underline">
        Return to active campaign
      </Link>
    </div>
  )
}
