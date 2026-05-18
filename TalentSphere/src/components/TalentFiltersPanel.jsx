import { useState, useMemo } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { EXPERIENCE_OPTIONS } from '../lib/jobFilters';
import {
  OPEN_TO_WORK_OPTIONS,
  HAS_RESUME_OPTIONS,
  GRADUATION_OPTIONS,
  getEducationOptions,
  getTalentSkillOptions,
  getJobTitleOptions,
  countActiveTalentFilters,
} from '../lib/talentFilters';
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

export default function TalentFiltersPanel({ userId, candidates, filters, onChange, onClear }) {
  const [openSection, setOpenSection] = useState('experience');
  const [customOpts, setCustomOpts] = useState(() => getCustomFilterOptions(userId));

  const refreshCustom = () => setCustomOpts(getCustomFilterOptions(userId));

  const educationOptions = useMemo(
    () =>
      mergeFilterOptions(
        getEducationOptions(candidates).map((e) => ({ id: e, label: e })),
        [],
        customOpts.education
      ),
    [candidates, customOpts.education]
  );

  const skillOptions = useMemo(
    () =>
      mergeFilterOptions(
        getTalentSkillOptions(candidates).map((s) => ({ id: s, label: s })),
        [],
        customOpts.skills
      ),
    [candidates, customOpts.skills]
  );

  const jobTitleOptions = useMemo(
    () =>
      mergeFilterOptions(
        getJobTitleOptions(candidates).map((t) => ({ id: t, label: t })),
        [],
        customOpts.jobTitle
      ),
    [candidates, customOpts.jobTitle]
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
  const active = countActiveTalentFilters(filters);

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
        title="Role / Job Title"
        open={openSection === 'jobTitle'}
        onToggle={() => toggleSection('jobTitle')}
        count={filters.jobTitle.length}
      >
        <FilterAddOption
          placeholder="Add role..."
          onAdd={(v) => addCustom('jobTitle', v)}
        />
        {jobTitleOptions.length === 0 ? (
          <p className="filter-empty-hint">Add a role or wait for candidates</p>
        ) : (
          <CheckboxList
            options={jobTitleOptions}
            selected={filters.jobTitle}
            onToggle={(id) => toggle('jobTitle', id)}
            customValues={customOpts.jobTitle}
            onRemoveCustom={(id) => removeCustom('jobTitle', id)}
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
        title="Education"
        open={openSection === 'education'}
        onToggle={() => toggleSection('education')}
        count={filters.education.length}
      >
        <FilterAddOption
          placeholder="Add education..."
          onAdd={(v) => addCustom('education', v)}
        />
        {educationOptions.length === 0 ? (
          <p className="filter-empty-hint">Add an education filter or wait for candidates</p>
        ) : (
          <CheckboxList
            options={educationOptions}
            selected={filters.education}
            onToggle={(id) => toggle('education', id)}
            customValues={customOpts.education}
            onRemoveCustom={(id) => removeCustom('education', id)}
          />
        )}
      </FilterSection>

      <FilterSection
        title="Skills"
        open={openSection === 'skills'}
        onToggle={() => toggleSection('skills')}
        count={filters.skills.length}
      >
        <FilterAddOption placeholder="Add skill..." onAdd={(v) => addCustom('skills', v)} />
        {skillOptions.length === 0 ? (
          <p className="filter-empty-hint">Add a skill filter above</p>
        ) : (
          <CheckboxList
            options={skillOptions}
            selected={filters.skills}
            onToggle={(id) => toggle('skills', id)}
            customValues={customOpts.skills}
            onRemoveCustom={(id) => removeCustom('skills', id)}
          />
        )}
      </FilterSection>

      <FilterSection
        title="Resume"
        open={openSection === 'hasResume'}
        onToggle={() => toggleSection('hasResume')}
        count={filters.hasResume.length}
      >
        <CheckboxList
          options={HAS_RESUME_OPTIONS}
          selected={filters.hasResume}
          onToggle={(id) => toggle('hasResume', id)}
        />
      </FilterSection>

      <FilterSection
        title="Graduation Year"
        open={openSection === 'graduation'}
        onToggle={() => toggleSection('graduation')}
        count={filters.graduation.length}
      >
        <CheckboxList
          options={GRADUATION_OPTIONS}
          selected={filters.graduation}
          onToggle={(id) => toggle('graduation', id)}
        />
      </FilterSection>

      <FilterSection
        title="Availability"
        open={openSection === 'openToWork'}
        onToggle={() => toggleSection('openToWork')}
        count={filters.openToWork.length}
      >
        <CheckboxList
          options={OPEN_TO_WORK_OPTIONS}
          selected={filters.openToWork}
          onToggle={(id) => toggle('openToWork', id)}
        />
      </FilterSection>
    </aside>
  );
}
