import { History, Filter, ChevronRight } from "lucide-react";

const SearchMenu = ({
  recentSearches,
  onRecentSelect,
  searchableFields,
  onFieldSelect,
}) => {
  return (
    <>
      {recentSearches.length > 0 && (
        <div className="dt-dropdown-section">
          <div className="dt-section-header">
            <History size={12} /> Recent Searches
          </div>
          {recentSearches.map((term, i) => (
            <div
              key={i}
              className="dt-recent-item"
              onClick={() => onRecentSelect(term)}
            >
              <span>"{term}"</span>
            </div>
          ))}
        </div>
      )}

      <div className="dt-dropdown-section">
        <div className="dt-section-header">
          <Filter size={12} /> Add Filter
        </div>
        {searchableFields.map((field, idx) => (
          <div
            key={idx}
            className="dt-field-item"
            onClick={() => onFieldSelect(field)}
          >
            <div className="dt-field-icon">Aa</div>
            <span>{field.label}</span>
            <ChevronRight size={14} className="dt-arrow" />
          </div>
        ))}
      </div>
    </>
  );
};

export default SearchMenu;
