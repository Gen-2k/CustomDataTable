import React, { useState, useRef, useEffect, memo, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useTableSearch, useTableActions, useTableData } from "./TableContext";
import "./styles/DataTableSearch.css";
import "./styles/DataTable.vars.css";
import {
  TYPE_OPERATORS,
  OPERATOR_DISPLAY_LABELS,
} from "./constants/DataTable.constants";
import SearchMenu from "./components/SearchMenu";
import FilterBuilder from "./components/FilterBuilder";
import ColumnSettings from "./components/ColumnSettings";

/**
 * DataTableSearch - The intelligent search bar with support for
 * global keyword search and structured advanced filters.
 */
const DataTableSearch = ({ placeholder = "Search..." }) => {
  const {
    searchTerm: searchTermTokens,
    activeFilters,
    columns,
  } = useTableSearch();
  const { handleSearch: onSearch, handleClearFilters } = useTableActions();

  const searchableFields = useMemo(
    () =>
      columns.map((col) => ({
        key: col.filterKey || col.key,
        label: col.label,
        type: col.filterType || "text",
      })),
    [columns],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [operator, setOperator] = useState("contains");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTokenIdx, setEditingTokenIdx] = useState(null);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  /**
   * Resets internal UI state and closes the search dropdown
   */
  const closeSearch = () => {
    setIsOpen(false);
    setActiveField(null);
    setEditingIndex(null);
    setEditingTokenIdx(null);
    setFilterValue("");
    setOperator("contains");
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeSearch();
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") closeSearch();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("dt_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveRecentSearch = (term) => {
    const trimmed = term?.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase(),
      );
      const next = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("dt_recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const handleEditFilter = (idx, filter) => {
    const field = searchableFields.find((f) => f.key === filter.field);
    if (!field) return;
    setActiveField(field);
    setOperator(filter.operator);
    setFilterValue(filter.value);
    setEditingIndex(idx);
    setIsOpen(true);
  };

  const applyAdvancedFilter = () => {
    if (!activeField) return;

    if (operator === "between") {
      const [s, e] = filterValue.split(",");
      if (!s || !e || s === "" || e === "") return;
    } else if (!filterValue && activeField.type !== "boolean") {
      return;
    }

    const nextFilters = [...activeFilters];
    const newFilter = {
      field: activeField.key,
      label: activeField.label,
      operator,
      value: filterValue,
    };

    if (editingIndex !== null) {
      nextFilters[editingIndex] = newFilter;
    } else {
      nextFilters.push(newFilter);
    }

    onSearch("setFilters", nextFilters);
    closeSearch();
  };

  const handleGlobalSearchSubmit = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!searchTermTokens.includes(trimmed)) {
        onSearch("global", [...searchTermTokens, trimmed]);
        saveRecentSearch(trimmed);
      }
      setInputValue("");
      closeSearch();
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      searchTermTokens.length > 0
    ) {
      const tokens = [...searchTermTokens];
      const last = tokens.pop();
      onSearch("global", tokens);
      setInputValue(last);
      setEditingTokenIdx(searchTermTokens.length - 1);
    }
  };

  const handleEditToken = (idx, token) => {
    const tokens = searchTermTokens.filter((_, i) => i !== idx);
    onSearch("global", tokens);
    setInputValue(token);
    setEditingTokenIdx(idx);
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const renderChipLabel = (filter) => {
    const displayOperator = OPERATOR_DISPLAY_LABELS[filter.operator];
    if (filter.operator === "between") {
      const [start, end] = filter.value.split(",");
      return `${filter.label}: ${start} - ${end}`;
    }
    return `${filter.label}: ${displayOperator} ${filter.value}`;
  };

  const isAnySearchActive =
    inputValue || searchTermTokens.length > 0 || activeFilters.length > 0;

  return (
    <div className="dt-scope dt-search-outer-wrapper">
      <div className="dt-search-container" ref={wrapperRef}>
        <div
          className={`dt-search-wrapper ${isOpen ? "is-active" : ""}`}
          onClick={() => setIsOpen(true)}
        >
          <Search className="dt-search-icon" size={18} />
          <div className="dt-input-area">
            {activeFilters.map((f, idx) => (
              <div
                key={`filter-${idx}`}
                className={`dt-filter-chip ${
                  editingIndex === idx ? "is-editing" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditFilter(idx, f);
                }}
              >
                <span>{renderChipLabel(f)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSearch(
                      "setFilters",
                      activeFilters.filter((_, i) => i !== idx),
                    );
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {searchTermTokens.map((token, idx) => (
              <div
                key={`token-${idx}`}
                className={`dt-filter-chip global-search-chip ${
                  editingTokenIdx === idx ? "is-editing" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditToken(idx, token);
                }}
              >
                <Search size={10} style={{ marginRight: "2px" }} />
                <span>{token}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSearch(
                      "global",
                      searchTermTokens.filter((_, i) => i !== idx),
                    );
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <input
              ref={inputRef}
              type="text"
              className="dt-search-input"
              placeholder={
                activeFilters.length > 0 || searchTermTokens.length > 0
                  ? ""
                  : placeholder
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleGlobalSearchSubmit}
              onFocus={() => setIsOpen(true)}
            />
          </div>

          {isAnySearchActive && (
            <button
              className="dt-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                setInputValue("");
                handleClearFilters();
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="dt-search-dropdown dt-scrollbar">
            {!activeField ? (
              <SearchMenu
                recentSearches={recentSearches}
                onRecentSelect={(term) => {
                  if (!searchTermTokens.includes(term))
                    onSearch("global", [...searchTermTokens, term]);
                  setIsOpen(false);
                }}
                searchableFields={searchableFields}
                onFieldSelect={(field) => {
                  setActiveField(field);
                  setFilterValue("");
                  setEditingIndex(null);
                  const allowed =
                    TYPE_OPERATORS[field.type] || TYPE_OPERATORS.text;
                  setOperator(allowed[0].value);
                }}
              />
            ) : (
              <FilterBuilder
                activeField={activeField}
                searchableFields={searchableFields}
                operator={operator}
                setOperator={setOperator}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
                onBack={() => {
                  setActiveField(null);
                  setEditingIndex(null);
                }}
                onApply={applyAdvancedFilter}
                setActiveField={setActiveField}
              />
            )}
          </div>
        )}
      </div>
      <ColumnSettings />
    </div>
  );
};

export default memo(DataTableSearch);
