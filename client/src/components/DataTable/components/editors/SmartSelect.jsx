import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import ReactDOM from "react-dom";
import { Check, X, Plus, Loader2 } from "lucide-react";
import { usePortalPosition } from "./usePortalPosition";
import "../../styles/SmartSelect.css";

/**
 * SmartSelect - Industry Standard multi-purpose editor.
 * Handles single-select, multi-select (tags), and searchable filtering.
 * 
 * Optimized with React.memo and useCallback to ensure smooth performance 
 * even when integrated into complex tables.
 */
const SmartSelect = memo(({
  value,
  options = [],
  isLoading,
  isSaving,
  onChange,
  onCommit,
  onCancel,
  column,
}) => {
  const isMultiple = column.editorType === "tags" || Array.isArray(value);

  // --- INTERNAL STATE ---
  const [tags, setTags] = useState(() => {
    if (!isMultiple) return [];
    return Array.isArray(value) ? [...new Set(value)] : value ? [value] : [];
  });

  const [search, setSearch] = useState(isMultiple ? "" : String(value ?? ""));
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const coords = usePortalPosition(containerRef);

  // --- UX ENHANCEMENTS ---

  // Focus and Select content on mount (Industry Standard UX)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (!isMultiple) inputRef.current.select();
    }
  }, [isMultiple]);

  // Sync internal state with external value changes
  useEffect(() => {
    if (isMultiple) {
      setTags(Array.isArray(value) ? [...new Set(value)] : value ? [value] : []);
      setSearch("");
    } else {
      setSearch(String(value ?? ""));
    }
  }, [value, isMultiple]);

  // --- LOGIC ---

  const filteredOptions = useMemo(() => {
    const query = search.toLowerCase().trim();
    const available = isMultiple
      ? options.filter((opt) => !tags.includes(opt.value))
      : options;

    return query
      ? available.filter((opt) =>
          String(opt.label).toLowerCase().includes(query),
        )
      : available;
  }, [options, search, tags, isMultiple]);

  const addMultipleTag = useCallback((val) => {
    if (isSaving) return;
    const option = options.find((o) => o.value === val);
    if (!option || tags.includes(option.value)) {
      setSearch("");
      return;
    }
    const newTags = [...tags, option.value];
    setTags(newTags);
    onChange(newTags);
    setSearch("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, [isSaving, options, tags, onChange]);

  const removeMultipleTag = useCallback((val) => {
    if (isSaving) return;
    const newTags = tags.filter((t) => t !== val);
    setTags(newTags);
    onChange(newTags);
    inputRef.current?.focus();
  }, [isSaving, tags, onChange]);

  /**
   * Highlights the matching portion of the search query in the result list.
   */
  const highlightMatch = useCallback((text, query) => {
    if (!query || !text) return text;
    const trimmedQuery = query.toLowerCase().trim();
    if (!trimmedQuery) return text;

    const parts = String(text).split(new RegExp(`(${trimmedQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === trimmedQuery ? (
        <strong key={i} className="highlight">
          {part}
        </strong>
      ) : (
        part
      ),
    );
  }, []);

  const selectSingleOption = useCallback((val, label) => {
    if (isSaving) return;
    setSearch(label);
    onChange(val);
    setDropdownVisible(false);
  }, [isSaving, onChange]);

  const handleCommit = useCallback(() => {
    if (isSaving) return;
    if (isMultiple) {
      onCommit(tags);
    } else {
      // Find exact matches or allow custom entry if needed (currently strict)
      const match = options.find(
        (opt) => String(opt.label).toLowerCase() === search.toLowerCase().trim(),
      );
      if (match) onCommit(match.value);
      else if (search.trim() === "") onCommit(null);
      else onCancel();
    }
  }, [isSaving, isMultiple, onCommit, onCancel, options, search, tags]);

  // --- KEYBOARD ACCESSIBILITY ---

  const handleKeyDown = (e) => {
    if (isSaving) return;

    switch (e.key) {
      case "ArrowDown":
        setDropdownVisible(true);
        setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        e.preventDefault();
        break;
      case "ArrowUp":
        setDropdownVisible(true);
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        e.preventDefault();
        break;
      case "Enter":
        if (activeIndex >= 0 && filteredOptions[activeIndex]) {
          const opt = filteredOptions[activeIndex];
          if (isMultiple) addMultipleTag(opt.value);
          else selectSingleOption(opt.value, opt.label);
        } else {
          handleCommit();
        }
        e.preventDefault();
        break;
      case "Escape":
        onCancel();
        break;
      default:
        break;
    }
  };

  // Skip rendering if position isn't calculated yet
  if (!coords) {
    return <div ref={containerRef} style={{ height: "1.5em" }} />;
  }

  const overlayStyle = {
    position: "absolute",
    top: coords.top - 2,
    left: coords.left - 4,
    minWidth: Math.max(coords.width + 8, isMultiple ? 220 : 0),
    zIndex: 9999,
  };

  return (
    <>
      {/* Anchor Point */}
      <div ref={containerRef} style={{ height: "1.5em" }} />

      {/* Portal Overlay */}
      {ReactDOM.createPortal(
        <div className={`smart-select-overlay${isSaving ? " is-saving" : ""}`} style={overlayStyle}>
          <div className="smart-select-top-bar">
            
            {/* Tag/Search Container */}
            <div className={`smart-select-input-container ${isMultiple ? "multiple" : "single"}`} onClick={() => inputRef.current?.focus()}>
              {isMultiple &&
                tags.map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="dt-tag-pill">
                    {tag}
                    <X size={12} className="remove-icon" onClick={(e) => { e.stopPropagation(); removeMultipleTag(tag); }} />
                  </span>
                ))}
              <input
                ref={inputRef}
                autoFocus
                disabled={isSaving}
                className="smart-select-input overlay-mode"
                value={search}
                placeholder={isMultiple && tags.length === 0 ? "Select..." : ""}
                onFocus={() => !isSaving && setDropdownVisible(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(-1);
                  setDropdownVisible(true);
                }}
                onKeyDown={handleKeyDown}
              />
              {isLoading && <Loader2 size={14} className="dt-spinning-meta" />}
            </div>
            
            {/* Actions Bubble */}
            <div className="dt-editor-actions-bubble">
              <button className="dt-action-btn dt-confirm" onClick={handleCommit} disabled={isSaving || isLoading}>
                {isSaving ? <div className="btn-spinner" /> : <Check size={14} />}
              </button>
              <button className="dt-action-btn dt-cancel" onClick={onCancel} disabled={isSaving}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Results Dropdown */}
          {dropdownVisible && !isSaving && (
            <div className="smart-select-dropdown portal dt-scrollbar">
              {isLoading ? (
                <div className="smart-select-info">Fetching options...</div>
              ) : filteredOptions.length === 0 ? (
                <div className="smart-select-info">No matches found</div>
              ) : (
                filteredOptions.map((opt, i) => (
                  <div
                    key={i}
                    className={`smart-select-option${i === activeIndex ? " active" : ""}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (isMultiple) addMultipleTag(opt.value);
                      else selectSingleOption(opt.value, opt.label);
                    }}
                  >
                    {isMultiple && <Plus size={12} className="opt-icon" />}
                    <span className="smart-option-text">
                      {highlightMatch(opt.label, search)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
});

export default SmartSelect;
