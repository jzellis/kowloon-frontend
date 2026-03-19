// ServerInfo — server icon, name, description, and location.
// Used in the sidebar and on the public landing page.
// Props: server object from server info API (TBD).
// Falls back to mock data if no server prop is passed.

import { MapPin } from 'lucide-react'

const MOCK_SERVER = {
  name: 'My Kowloon Server',
  icon: '/logo.png',
  description: 'A small, friendly server for writers, musicians, and people who think too much. Open registration. Be excellent to each other.',
  city: 'London',
  region: 'England',
  country: 'UK',
}

export default function ServerInfo({ server = MOCK_SERVER }) {
  return (
    <div className="flex flex-col gap-0 border-b-2 border-base-300 pb-5">
      {/* Icon + name */}
      <div className="flex items-center gap-3 mb-4">
        <img src={server.icon} alt={server.name} className="w-10 h-10 object-contain shrink-0" />
        <span className="font-display text-4xl tracking-wide text-base-content leading-none">
          {server.name}
        </span>
      </div>

      {/* Location */}
      {(server.city || server.country) && (
        <div className="flex items-center gap-1.5 mb-3 text-base-content/50">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="font-ui text-xs uppercase tracking-widest">
            {[server.city, server.region, server.country].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      {/* Description */}
      {server.description && (
        <p className="font-reading text-sm text-base-content/80 leading-relaxed">
          {server.description}
        </p>
      )}
    </div>
  )
}
