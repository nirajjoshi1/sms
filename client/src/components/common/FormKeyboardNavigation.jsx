import { useEffect } from 'react';

const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
  'select',
  'textarea',
].join(',');

const isUsable = (element) => {
  if (element.disabled || element.readOnly) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
};

const getFields = (current) => {
  // Prefer the current form. For form-like dialogs that do not use a form tag,
  // stay inside the nearest modal/popover before falling back to the page.
  const scope = current.form
    || current.closest('[role="dialog"], [aria-modal="true"], .modal, .dialog')
    || document;

  return [...scope.querySelectorAll(FIELD_SELECTOR)].filter(isUsable);
};

const focusField = (field) => {
  field.focus({ preventScroll: true });
  field.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  if (field instanceof HTMLInputElement && field.select && !['checkbox', 'radio', 'file', 'date', 'time'].includes(field.type)) {
    field.select();
  }
};

const FormKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;

      const current = event.target;
      if (!(current instanceof HTMLInputElement || current instanceof HTMLSelectElement || current instanceof HTMLTextAreaElement)) return;

      const isTextarea = current instanceof HTMLTextAreaElement;
      const isExpandableInput = current instanceof HTMLInputElement && ['number', 'date', 'time', 'range'].includes(current.type);
      const isChoiceInput = current instanceof HTMLInputElement && ['checkbox', 'radio', 'file'].includes(current.type);
      const fields = getFields(current);
      const index = fields.indexOf(current);
      if (index < 0) return;

      let direction = 0;
      if (event.key === 'Enter' && !event.shiftKey && !isTextarea && !isChoiceInput) direction = 1;
      if (event.key === 'ArrowDown' && !isTextarea && !(current instanceof HTMLSelectElement) && !isExpandableInput) direction = 1;
      if (event.key === 'ArrowUp' && !isTextarea && !(current instanceof HTMLSelectElement) && !isExpandableInput) direction = -1;
      if (!direction) return;

      event.preventDefault();
      const next = fields[index + direction];
      if (next) {
        focusField(next);
        return;
      }

      // Enter on the final field submits through the browser's native form
      // validation and the existing React onSubmit handler.
      if (event.key === 'Enter' && direction === 1 && current.form) {
        current.form.requestSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
};

export default FormKeyboardNavigation;
