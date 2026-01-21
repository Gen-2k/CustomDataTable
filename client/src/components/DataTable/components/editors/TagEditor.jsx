import { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Plus, Check } from "lucide-react";
import { usePortalPosition } from "./usePortalPosition";
import "../../styles/TagEditor.css";

const TagEditor = ({ value = [], options = [], isLoading, isSaving, onChange, onCommit, onCancel }) => {
  const [tags, setTags] = useState(() => {
    const arr = Array.isArray(value) ? value : [];
    return [...new Set(arr)];
  });
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const coords = usePortalPosition(containerRef, true);

  useEffect(() => {
    const arr = Array.isArray(value) ? value : [];
    setTags([...new Set(arr)]);
  }, [value]);

  const filteredOptions = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return [];
    
    return options
      .filter(opt => !tags.includes(opt.value))
      .filter(opt => String(opt.label).toLowerCase().includes(query));
  }, [options, search, tags]);

  const addTag = (tag) => {
    if (!tag || isSaving) return;
    
    const cleanTag = tag.trim();
    if (!cleanTag || tags.includes(cleanTag)) {
      setSearch("");
      return;
    }

    const newTags = [...tags, cleanTag];
    setTags(newTags);
    onChange(newTags);
    setSearch("");
    setActiveIndex(-1);
  };

  const removeTag = (tag) => {
    if (isSaving) return;
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    onChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (isSaving) return;

    switch (e.key) {
      case "Enter":
      case ",":
      case "Tab":
        e.preventDefault();
        if (activeIndex >= 0 && filteredOptions[activeIndex]) {
          addTag(filteredOptions[activeIndex].value);
        } else {
          addTag(search);
        }
        break;
      case "Backspace":
        if (!search && tags.length > 0) {
          removeTag(tags[tags.length - 1]);
        }
        break;
      case "ArrowDown":
        setActiveIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        setActiveIndex(prev => Math.max(prev - 1, -1));
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
  };

  const focusInput = () => {
    if (!isSaving) inputRef.current?.focus();
  };

  const containerClass = `dt-tag-editor-container${isSaving ? " is-saving" : ""}`;
  const showSuggestions = coords && filteredOptions.length > 0 && !isSaving;

  const suggestionStyle = {
    position: "absolute",
    top: coords?.top + 4,
    left: coords?.left,
    minWidth: coords?.width,
    zIndex: 9999
  };

  return (
    <div className={containerClass} ref={containerRef}>
      <div className="editable-cell-input-wrapper">
        <div className="dt-tag-editor-box" onClick={focusInput}>
          {tags.map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="dt-tag-pill">
              {tag}
              <X 
                size={12} 
                className="remove-icon" 
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }} 
              />
            </span>
          ))}
          <input
            ref={inputRef}
            autoFocus
            disabled={isSaving}
            className="dt-tag-input"
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
          />
        </div>
        <div className="dt-editor-actions-bubble">
          <button 
            className="dt-action-btn dt-confirm" 
            onClick={() => !isSaving && onCommit(tags)}
            disabled={isSaving}
          >
            {isSaving ? <div className="btn-spinner" /> : <Check size={14} />}
          </button>
          <button className="dt-action-btn dt-cancel" onClick={onCancel} disabled={isSaving}>
            <X size={14} />
          </button>
        </div>
      </div>

      {showSuggestions && ReactDOM.createPortal(
        <div className="dt-tag-suggestions" style={suggestionStyle}>
          {filteredOptions.map((opt, i) => (
            <div 
              key={opt.value} 
              className={`dt-suggestion-item${i === activeIndex ? " active" : ""}`}
              onMouseDown={() => addTag(opt.value)}
            >
              <Plus size={12} style={{ marginRight: 8, opacity: 0.5 }} />
              {opt.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default TagEditor;
