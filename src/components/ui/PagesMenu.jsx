// PagesMenu — hierarchical server pages navigation tree.
// Props: pages (array of { id, name, slug, children? })
// Falls back to mock data if no pages prop passed.

import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const MOCK_PAGES = [
  {
    id: 'page:about@kwln.org',
    name: 'About',
    slug: 'about',
    children: [
      { id: 'page:rules@kwln.org',   name: 'Rules & Guidelines', slug: 'rules' },
      { id: 'page:privacy@kwln.org', name: 'Privacy Policy',     slug: 'privacy' },
    ],
  },
  {
    id: 'page:projects@kwln.org',
    name: 'Projects',
    slug: 'projects',
    children: [
      { id: 'page:kowloon@kwln.org', name: 'Kowloon',      slug: 'kowloon' },
      { id: 'page:music@kwln.org',   name: 'Music Archive', slug: 'music-archive' },
    ],
  },
  {
    id: 'page:contact@kwln.org',
    name: 'Contact',
    slug: 'contact',
    children: [],
  },
]

export default function PagesMenu({ pages = MOCK_PAGES }) {
  return (
    <div className="flex flex-col gap-0 border-b-2 border-base-300 pb-5">
      <h3 className="font-display text-3xl tracking-wide text-base-content mb-3">Pages</h3>
      <nav>
        <ul className="flex flex-col gap-0">
          {pages.map((page) => (
            <li key={page.id}>
              <Link
                to={`/pages/${page.slug}`}
                className="flex items-center justify-between py-1.5 font-ui text-xs uppercase tracking-widest text-base-content/70 hover:text-primary transition-colors group"
              >
                {page.name}
                {page.children?.length > 0 && (
                  <ChevronRight className="w-3 h-3 text-base-content/30 group-hover:text-primary transition-colors" />
                )}
              </Link>

              {/* Second-level pages */}
              {page.children?.length > 0 && (
                <ul className="flex flex-col gap-0 border-l-2 border-base-300 ml-2 mb-1">
                  {page.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        to={`/pages/${child.slug}`}
                        className="block pl-3 py-1 font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-primary transition-colors"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
