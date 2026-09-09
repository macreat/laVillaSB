import { displayTab } from '@/lib/store-catalog';

interface CategorySubtabsProps {
  /** Describes the row for screen readers, e.g. "Skate categories". */
  label: string;
  tabs: string[];
  activeTab: string;
  /** Destination for a tab. The caller owns which navigation level it moves. */
  hrefFor: (tab: string) => string;
}

export function CategorySubtabs({
  label,
  tabs,
  activeTab,
  hrefFor,
}: CategorySubtabsProps) {
  return (
    <nav className="category-subtabs" aria-label={label}>
      <div className="category-subtabs__track">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <a
              key={tab}
              href={hrefFor(tab)}
              className="category-subtabs__link"
              aria-label={`View ${tab} products`}
              aria-current={isActive ? 'page' : undefined}
            >
              {displayTab(tab)}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
