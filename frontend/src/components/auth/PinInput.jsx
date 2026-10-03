import React, { useRef, useEffect } from 'react';

export function PinInput({ value = '', onChange, onComplete, disabled = false, autoFocus = true, error = false }) {
  const inputRefs = useRef([]);

  // Ensure value is 6 chars max
  const digits = Array(6).fill('').map((_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index, text) => {
    // Handle paste of multiple characters
    const clean = text.replace(/[^0-9]/g, '');
    if (clean.length > 1) {
      const newDigits = clean.slice(0, 6);
      onChange(newDigits);
      if (newDigits.length === 6 && onComplete) {
        onComplete(newDigits);
      }
      const nextIndex = Math.min(newDigits.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    // Single character input
    const currentVal = digits.slice();
    currentVal[index] = clean;
    const combined = currentVal.join('');
    onChange(combined);

    if (clean && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    if (combined.length === 6 && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      if (pastedData.length === 6 && onComplete) {
        onComplete(pastedData);
      }
      const nextIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 my-2" onPaste={handlePaste}>
      {Array(6).fill(0).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i]}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl border transition-all outline-hidden
            ${
              error
                ? 'border-2 border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                : digits[i]
                ? 'border-2 border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-950 dark:text-white shadow-xs'
                : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs'
            }
            focus:border-2 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 focus:scale-[1.03] disabled:opacity-50`}
        />
      ))}
    </div>
  );
}

export default PinInput;
