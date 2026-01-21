import { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Check, X } from "lucide-react";
import { usePortalPosition } from "./usePortalPosition";
import "../../styles/SmartSelect.css";

const SmartSelect = ({ value, options = [], isLoading, isSaving, onChange, onCommit, onCancel, column }) => {
  const [search, setSearch] = useState(String(value ?? ""));
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownVisible, setDropdownVisible] = useState(true);
  const containerRef = useRef(null);
  const coords = usePortalPosition(containerRef);

  useEffect(() => {
    setSearch(String(value ?? ""));
  }, [value]);

  const filteredOptions = useMemo(() => {
    const query = search.toLowerCase();
    return query 
      ? options.filter(opt => String(opt.label).toLowerCase().includes(query)) 
      : options;
  }, [options, search]);

  const isStrictMode = column.strict === true;
  const canAddNew = !isStrictMode && search && !filteredOptions.some(opt => opt.label === search);

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const parts = String(text).split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <strong key={i} className="highlight">{part}</strong> 
        : part
    );
  };

  const selectOption = (val) => { 
    if (isSaving) return;
    setSearch(val);
    onChange(val);
    setDropdownVisible(false);
  };

  const handleCommit = () => {
    if (isSaving) return;
    const match = filteredOptions.find(opt => opt.label.toLowerCase() === search.toLowerCase());
    
    if (match) {
      onCommit(match.value);
    } else if (!isStrictMode) {
      onCommit(search);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (isSaving) return;

    switch (e.key) {
      case "ArrowDown":
        setDropdownVisible(true);
        setActiveIndex(prev => Math.min(prev + 1, filteredOptions.length + (canAddNew ? 0 : -1)));
        e.preventDefault();
        break;
      case "ArrowUp":
        setDropdownVisible(true);
        setActiveIndex(prev => Math.max(prev - 1, -1));
        e.preventDefault();
        break;
      case "Enter":
        if (!dropdownVisible || activeIndex === -1) {
          handleCommit();
        } else if (canAddNew && activeIndex === filteredOptions.length) {
          selectOption(search);
        } else if (filteredOptions[activeIndex]) {
          selectOption(filteredOptions[activeIndex].label);
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

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setActiveIndex(-1);
    setDropdownVisible(true);
  };

  if (!coords) {
    return <div ref={containerRef} style={{ height: "1.5em" }} />;
  }

  const overlayStyle = {
    position: "absolute",
    top: coords.top - 2,
    left: coords.left - 4,
    minWidth: coords.width + 8,
    zIndex: 9999
  };

  const renderDropdownContent = () => {
    if (isLoading && !isSaving) {
      return <div className="smart-select-info">Loading...</div>;
    }

    if (filteredOptions.length === 0 && !canAddNew) {
      return <div className="smart-select-info">No results</div>;
    }

    return (
      <>
        {filteredOptions.map((opt, i) => (
          <div 
            key={i} 
            className={`smart-select-option${i === activeIndex ? " active" : ""}`} 
            onMouseDown={() => selectOption(opt.label)}
          >
            {highlightMatch(opt.label, search)}
          </div>
        ))}
        {canAddNew && (
          <div 
            className={`smart-select-option creatable${activeIndex === filteredOptions.length ? " active" : ""}`} 
            onMouseDown={() => selectOption(search)}
          >
            + Add "{search}"
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div ref={containerRef} style={{ height: "1.5em" }} />
      {ReactDOM.createPortal(
        <div className={`smart-select-overlay${isSaving ? " is-saving" : ""}`} style={overlayStyle}>
          <div className="editable-cell-input-wrapper">
            <input
              autoFocus
              disabled={isSaving}
              className="smart-select-input overlay-mode"
              value={search}
              onFocus={() => !isSaving && setDropdownVisible(true)}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <div className="dt-editor-actions-bubble">
              <button className="dt-action-btn dt-confirm" onClick={handleCommit} disabled={isSaving}>
                {isSaving ? <div className="btn-spinner" /> : <Check size={14} />}
              </button>
              <button className="dt-action-btn dt-cancel" onClick={onCancel} disabled={isSaving}>
                <X size={14} />
              </button>
            </div>
          </div>
          {dropdownVisible && !isSaving && (
            <div className="smart-select-dropdown portal">
              {renderDropdownContent()}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default SmartSelect;
