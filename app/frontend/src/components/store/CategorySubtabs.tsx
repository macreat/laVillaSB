import {
  buildCategoryHref,
  displayCategoryGroup,
  displaySubcategory,
} from '@/lib/store-catalog';

interface CategorySubtabsProps {
  group: string;
  tabs: string[];
  activeSubcategory: string;
}

export function CategorySubtabs({
  group,
  tabs,
  activeSubcategory,
}: CategorySubtabsProps) {
  return (
    <nav
      className="category-subtabs"
      aria-label={`${displayCategoryGroup(group)} subcategories`}
    >
      <div className="category-subtabs__track">
        {tabs.map((tab) => {
          const isActive = tab === activeSubcategory;
          return (
            <a
              key={tab}
              href={buildCategoryHref(group, tab)}
              className="category-subtabs__link"
              aria-label={`View ${tab} products`}
              aria-current={isActive ? 'page' : undefined}
            >
              {displaySubcategory(tab)}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
