import { useState, useMemo } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import {
  JOB_STATUS_OPTIONS,
  getLocationOptions,
  getEmploymentTypeOptions,
  countActiveCompanyJobFilters,
} from '../lib/companyJobFilters';
import { EMPLOYMENT_TYPE_OPTIONS } from '../lib/jobFilters';
import {
  getCustomFilterOptions,
  addCustomFilterOption,
  removeCustomFilterOption,
  mergeFilterOptions,
} from '../lib/customFilterOptions';

function FilterSection({ title, open, onToggle, count, children }) {
  return (
    <div className={`filter-section ${open ? 'filter-section--open' : ''}`}>
      <button type="button" className="filter-section-toggle" onClick={onToggle}>
        <span>{title}</span>
        <span className="filter-section-meta">
          {count > 0 && <span className="filter-section-badge">{count}</span>}
          <ChevronDown size={16} className="filter-section-chevron" />
        </span>
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

function CheckboxList({ options, selected, onToggle, customValues = [], onRemoveCustom }) {
  return (
    <div className="filter-options">
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isCustom = customValues.includes(id);
        return (
          <label key={id} className="filter-option">
            <input
              type="checkbox"
              checked={selected.includes(id)}
              onChange={() => onToggle(id)}
            />
            <span className="filter-option-label">{label}</span>
            {isCustom && onRemoveCustom && (
              <button
                type="button"
                className="filter-option-remove"
                title="Remove custom option"
                onClick={(e) => {
                  e.preventDefault();
                  onRemoveCustom(id);
                }}
              >
                <X size={12} />
              </button>
            )}
          </label>
        );
      })}
    </div>
  );
}

function FilterAddOption({ placeholder, onAdd }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (onAdd(trimmed)) setValue('');
  };

  return (
    <div className="filter-add-row">
      <input
        type="text"
        className="filter-add-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())}
      />
      <button type="button" className="filter-add-btn" onClick={submit} title="Add option">
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function CompanyJobFiltersPanel({ userId, jobs, filters, onChange, onClear }) {
  const [openSection, setOpenSection] = useState('status');
  const [customOpts, setCustomOpts] = useState(() => getCustomFilterOptions(userId));

  const refreshCustom = () => setCustomOpts(getCustomFilterOptions(userId));

  const typeOptions = useMemo(
    () =>
      mergeFilterOptions(
        getEmploymentTypeOptions(jobs).map((t) => ({ id: t, label: t })),
        EMPLOYMENT_TYPE_OPTIONS,
        customOpts.employment
      ),
    [jobs, customOpts.employment]
  );

  const locationOptions = useMemo(
    () => mergeFilterOptions(getLocationOptions(jobs), [], customOpts.location),
    [jobs, customOpts.location]
  );

  const toggle = (key, val) => {
    const arr = filters[key] || [];
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next });
  };

  const addCustom = (storageType, filterKey, value) => {
    const added = addCustomFilterOption(userId, storageType, value);
    if (!added) return false;
    refreshCustom();
    const arr = filters[filterKey] || [];
    if (!arr.includes(value)) {
      onChange({ ...filters, [filterKey]: [...arr, value] });
    }
    return true;
  };

  const removeCustom = (storageType, filterKey, value) => {
    removeCustomFilterOption(userId, storageType, value);
    refreshCustom();
    onChange({
      ...filters,
      [filterKey]: (filters[filterKey] || []).filter((x) => x !== value),
    });
  };

  const toggleSection = (id) => setOpenSection((cur) => (cur === id ? null : id));
  const active = countActiveCompanyJobFilters(filters);

  return (
    <aside className="jobs-filters card">
      <div className="jobs-filters-header">
        <h3>Filters</h3>
        {active > 0 && (
          <button type="button" className="filter-clear-btn" onClick={onClear}>
            Clear all ({active})
          </button>
        )}
      </div>

      <FilterSection
        title="Status"
        open={openSection === 'status'}
        onToggle={() => toggleSection('status')}
        count={filters.status.length}
      >
        <CheckboxList
          options={JOB_STATUS_OPTIONS}
          selected={filters.status}
          onToggle={(id) => toggle('status', id)}
        />
      </FilterSection>

      <FilterSection
        title="Type"
        open={openSection === 'type'}
        onToggle={() => toggleSection('type')}
        count={filters.type.length}
      >
        <FilterAddOption
          placeholder="Add employment type..."
          onAdd={(v) => addCustom('employment', 'type', v)}
        />
        {typeOptions.length === 0 ? (
          <p className="filter-empty-hint">Add an employment type above</p>
        ) : (
          <CheckboxList
            options={typeOptions}
            selected={filters.type}
            onToggle={(id) => toggle('type', id)}
            customValues={customOpts.employment}
            onRemoveCustom={(id) => removeCustom('employment', 'type', id)}
          />
        )}
      </FilterSection>

      <FilterSection
        title="Location"
        open={openSection === 'location'}
        onToggle={() => toggleSection('location')}
        count={filters.location.length}
      >
        <FilterAddOption
          placeholder="Add location..."
          onAdd={(v) => addCustom('location', 'location', v)}
        />
        {locationOptions.length === 0 ? (
          <p className="filter-empty-hint">Add a location or post jobs with locations</p>
        ) : (
          <CheckboxList
            options={locationOptions}
            selected={filters.location}
            onToggle={(id) => toggle('location', id)}
            customValues={customOpts.location}
            onRemoveCustom={(id) => removeCustom('location', 'location', id)}
          />
        )}
      </FilterSection>
    </aside>
  );
}
