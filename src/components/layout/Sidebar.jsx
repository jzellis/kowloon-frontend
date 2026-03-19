// Sidebar — contextual navigation and widgets.
// Rendered alongside the main content area in the layout.

import ServerInfo from '../ui/ServerInfo'
import PagesMenu from '../ui/PagesMenu'
import PopularCircles from '../circles/PopularCircles'
import PopularPosts from '../posts/PopularPosts'
import ActiveGroups from '../groups/ActiveGroups'

export default function Sidebar() {
  return (
    <aside className="flex flex-col gap-12">
      <ServerInfo />
      <PagesMenu />
      <PopularCircles />
      <PopularPosts />
      <ActiveGroups />
    </aside>
  )
}
