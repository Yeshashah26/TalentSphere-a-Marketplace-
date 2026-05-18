import { useState, useMemo } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import {
  POSTED_OPTIONS,
  EXPERIENCE_OPTIONS,
  SALARY_OPTIONS,
  TEAM_SIZE_OPTIONS,
  SKILL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  getLocationOptions,
  getEmploymentTypeOptions,
  countActiveFilters,
} from '../lib/jobFilters';
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

export default function JobFiltersPanel({ userId, jobs, filters, onChange, onClear }) {
  const [openSection, setOpenSection] = useState('posted');
  const [customOpts, setCustomOpts] = useState(() => getCustomFilterOptions(userId));

  const refreshCustom = () => setCustomOpts(getCustomFilterOptions(userId));

  const locationOptions = useMemo(
    () => mergeFilterOptions(getLocationOptions(jobs), [], customOpts.location),
    [jobs, customOpts.location]
  );

  const employmentOptions = useMemo(
    () =>
      mergeFilterOptions(
        getEmploymentTypeOptions(jobs),
        EMPLOYMENT_TYPE_OPTIONS,
        customOpts.employment
      ),
    [jobs, customOpts.employment]
  );

  const skillOptions = useMemo(
    () => mergeFilterOptions([], SKILL_OPTIONS, customOpts.skills),
    [customOpts.skills]
  );

  const toggle = (key, val) => {
    const arr = filters[key] || [];
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next });
  };

  const addCustom = (type, value) => {
    const added = addCustomFilterOption(userId, type, value);
    if (!added) return false;
    refreshCustom();
    const arr = filters[type] || [];
    if (!arr.includes(value)) {
      onChange({ ...filters, [type]: [...arr, value] });
    }
    return true;
  };

  const removeCustom = (type, value) => {
    removeCustomFilterOption(userId, type, value);
    refreshCustom();
    onChange({
      ...filters,
      [type]: (filters[type] || []).filter((x) => x !== value),
    });
  };

  const toggleSection = (id) => setOpenSection((cur) => (cur === id ? null : id));
  const active = countActiveFilters(filters);

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
        title="Posted Date"
        open={openSection === 'posted'}
        onToggle={() => toggleSection('posted')}
        count={filters.posted.length}
      >
        <CheckboxList
          options={POSTED_OPTIONS}
          selected={filters.posted}
          onToggle={(id) => toggle('posted', id)}
        />
      </FilterSection>

      <FilterSection
        title="Location"
        open={openSection === 'location'}
        onToggle={() => toggleSection('location')}
        count={filters.location.length}
      >
        <FilterAddOption
          placeholder="Add location..."
          onAdd={(v) => addCustom('location', v)}
        />
        {locationOptions.length === 0 ? (
          <p className="filter-empty-hint">Add a location or wait for new listings</p>
        ) : (
          <CheckboxList
            options={locationOptions}
            selected={filters.location}
            onToggle={(id) => toggle('location', id)}
            customValues={customOpts.location}
            onRemoveCustom={(id) => removeCustom('location', id)}
          />
        )}
      </FilterSection>

      <FilterSection
        title="Experience"
        open={openSection === 'experience'}
        onToggle={() => toggleSection('experience')}
        count={filters.experience.length}
      >
        <CheckboxList
          options={EXPERIENCE_OPTIONS}
          selected={filters.experience}
          onToggle={(id) => toggle('experience', id)}
        />
      </FilterSection>

      <FilterSection
        title="Salary Range"
        open={openSection === 'salary'}
        onToggle={() => toggleSection('salary')}
        count={filters.salary.length}
      >
        <CheckboxList
          options={SALARY_OPTIONS}
          selected={filters.salary}
          onToggle={(id) => toggle('salary', id)}
        />
      </FilterSection>

      <FilterSection
        title="Team Size"
        open={openSection === 'teamSize'}
        onToggle={() => toggleSection('teamSize')}
        count={filters.teamSize.length}
      >
        <p className="filter-hint">Based on number of openings</p>
        <CheckboxList
          options={TEAM_SIZE_OPTIONS}
          selected={filters.teamSize}
          onToggle={(id) => toggle('teamSize', id)}
        />
      </FilterSection>

      <FilterSection
        title="Employment Type"
        open={openSection === 'employment'}
        onToggle={() => toggleSection('employment')}
        count={filters.employment.length}
      >
        <FilterAddOption
          placeholder="Add employment type..."
          onAdd={(v) => addCustom('employment', v)}
        />
        {employmentOptions.length === 0 ? (
          <p className="filter-empty-hint">Add an employment type above</p>
        ) : (
          <CheckboxList
            options={employmentOptions}
            selected={filters.employment}
            onToggle={(id) => toggle('employment', id)}
            customValues={customOpts.employment}
            onRemoveCustom={(id) => removeCustom('employment', id)}
          />
        )}
      </FilterSection>

      <FilterSection
        title="Skills"
        open={openSection === 'skills'}
        onToggle={() => toggleSection('skills')}
        count={filters.skills.length}
      >
        <FilterAddOption
          placeholder="Add skill..."
          onAdd={(v) => addCustom('skills', v)}
        />
        <CheckboxList
          options={skillOptions}
          selected={filters.skills}
          onToggle={(id) => toggle('skills', id)}
          customValues={customOpts.skills}
          onRemoveCustom={(id) => removeCustom('skills', id)}
        />
      </FilterSection>
    </aside>
  );
}
