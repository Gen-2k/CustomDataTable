import { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Check, X, Plus } from "lucide-react";
import { usePortalPosition } from "./usePortalPosition";
import "../../styles/SmartSelect.css";

/**
 * Single Unified Selection Component
 * Handles both single selection (Select) and multiple selection (Tags/Pills)
 */
const SmartSelect = ({
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

  // Initialize tags if multiple, otherwise initialize search with value
  const [tags, setTags] = useState(() => {
    if (!isMultiple) return [];
    return Array.isArray(value) ? [...new Set(value)] : value ? [value] : [];
  });

  const [search, setSearch] = useState(isMultiple ? "" : String(value ?? ""));
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownVisible, setDropdownVisible] = useState(true);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const coords = usePortalPosition(containerRef);

  // Synchronize state when value changes externally
  useEffect(() => {
    if (isMultiple) {
      setTags(
        Array.isArray(value) ? [...new Set(value)] : value ? [value] : [],
      );
      setSearch("");
    } else {
      setSearch(String(value ?? ""));
    }
  }, [value, isMultiple]);

  const filteredOptions = useMemo(() => {
    const query = search.toLowerCase();
    // Filter out already selected tags if in multiple mode
    const available = isMultiple
      ? options.filter((opt) => !tags.includes(opt.value))
      : options;

    return query
      ? available.filter((opt) =>
          String(opt.label).toLowerCase().includes(query),
        )
      : available;
  }, [options, search, tags, isMultiple]);

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const parts = String(text).split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={i} className="highlight">
          {part}
        </strong>
      ) : (
        part
      ),
    );
  };

  const addMultipleTag = (val) => {
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
  };

  const removeMultipleTag = (val) => {
    if (isSaving) return;
    const newTags = tags.filter((t) => t !== val);
    setTags(newTags);
    onChange(newTags);
  };

  const selectSingleOption = (val, label) => {
    if (isSaving) return;
    setSearch(label);
    onChange(val);
    setDropdownVisible(false);
  };

  const handleCommit = () => {
    if (isSaving) return;
    if (isMultiple) {
      onCommit(tags);
    } else {
      const match = filteredOptions.find(
        (opt) => opt.label.toLowerCase() === search.toLowerCase(),
      );
      if (match) onCommit(match.value);
      else onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (isSaving) return;

    switch (e.key) {
      case "ArrowDown":
        setDropdownVisible(true);
        setActiveIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1),
        );
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
      case "Backspace":
        if (isMultiple && !search && tags.length > 0) {
          removeMultipleTag(tags[tags.length - 1]);
        }
        break;
      case "Escape":
        onCancel();
        break;
      default:
        break;
    }
  };

  if (!coords) {
    return <div ref={containerRef} style={{ height: "1.5em" }} />;
  }

  const overlayStyle = {
    position: "absolute",
    top: coords.top - 2,
    left: coords.left - 4,
    minWidth: Math.max(coords.width + 8, isMultiple ? 200 : 0),
    zIndex: 9999,
  };

  return (
    <>
      <div ref={containerRef} style={{ height: "1.5em" }} />
      {ReactDOM.createPortal(
        <div
          className={`smart-select-overlay${isSaving ? " is-saving" : ""}`}
          style={overlayStyle}
        >
          <div className="smart-select-top-bar">
            <div
              className={`smart-select-input-container ${isMultiple ? "multiple" : "single"}`}
              onClick={() => inputRef.current?.focus()}
            >
              {isMultiple &&
                tags.map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="dt-tag-pill">
                    {tag}
                    <X
                      size={12}
                      className="remove-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMultipleTag(tag);
                      }}
                    />
                  </span>
                ))}
              <input
                ref={inputRef}
                autoFocus
                disabled={isSaving}
                className="smart-select-input overlay-mode"
                value={search}
                placeholder={
                  isMultiple && tags.length === 0 ? "Select options..." : ""
                }
                onFocus={() => !isSaving && setDropdownVisible(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(-1);
                  setDropdownVisible(true);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="dt-editor-actions-bubble">
              <button
                className="dt-action-btn dt-confirm"
                onClick={handleCommit}
                disabled={isSaving}
                title="Save"
              >
                {isSaving ? (
                  <div className="btn-spinner" />
                ) : (
                  <Check size={14} />
                )}
              </button>
              <button
                className="dt-action-btn dt-cancel"
                onClick={onCancel}
                disabled={isSaving}
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          {dropdownVisible && !isSaving && (
            <div className="smart-select-dropdown portal dt-scrollbar">
              {isLoading ? (
                <div className="smart-select-info">Loading...</div>
              ) : filteredOptions.length === 0 ? (
                <div className="smart-select-info">No results</div>
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
};

export default SmartSelect;
