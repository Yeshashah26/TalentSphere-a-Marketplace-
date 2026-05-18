import { Check } from 'lucide-react';
import {
  TRACK_STEPS,
  normalizeStatus,
  getActiveStepIndex,
  getStepState,
  getFinalStepLabel,
} from '../lib/applicationStatus';
import './ApplicationTracker.css';

export default function ApplicationTracker({ status }) {
  const normalized = normalizeStatus(status);
  const isRejected = normalized === 'rejected';
  const activeIndex = getActiveStepIndex(normalized);

  const steps = TRACK_STEPS.map((step, i) => ({
    ...step,
    label: i === 3 ? getFinalStepLabel(isRejected) : step.label,
    state: getStepState(i, activeIndex, isRejected),
  }));

  return (
    <div className={`app-tracker ${isRejected ? 'app-tracker--rejected' : ''}`} role="list" aria-label="Application progress">
      <div className="app-tracker-track">
        {steps.map((step, i) => (
          <div key={step.key} className="app-tracker-step" role="listitem">
            {i > 0 && (
              <div
                className={`app-tracker-line app-tracker-line--before ${
                  steps[i - 1].state === 'completed' ||
                  steps[i - 1].state === 'active' ||
                  steps[i - 1].state === 'rejected'
                    ? steps[i].state === 'rejected' ? 'filled rejected' : 'filled'
                    : ''
                }`}
                aria-hidden
              />
            )}
            <div className={`app-tracker-node app-tracker-node--${step.state}`}>
              <span className="app-tracker-ring app-tracker-ring--outer" />
              <span className="app-tracker-ring app-tracker-ring--mid" />
              <span className="app-tracker-ring app-tracker-ring--inner">
                {(step.state === 'completed' || step.state === 'active' || step.state === 'rejected') && (
                  <Check size={14} strokeWidth={3} />
                )}
              </span>
            </div>
            <span className={`app-tracker-label app-tracker-label--${step.state}`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
