'use client';

import { useRef, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

type InputFormProps = {
  visible: boolean;
  value: string;
  setVisible: (value: boolean) => void;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
};

export default function InputForm({
  visible,
  setVisible,
  value,
  onChange,
  onSubmit,
  onInteractionStart,
  onInteractionEnd,
}: InputFormProps) {
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const [additionalValues, setAdditionalValues] = useState<string[]>([]);

  const endInteractionIfInactive = () => {
    if (!isHoveredRef.current && !isFocusedRef.current) {
      onInteractionEnd();
    }
  };

  return (
    <form
      id="inputForm"
      className={`absolute h-max left-5 top-20 z-10 flex items-end gap-2 rounded-xl border border-white/20 bg-black/30 p-2 backdrop-blur-sm transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        isFocusedRef.current = false;
        isHoveredRef.current = false;
        onInteractionEnd();
        onSubmit([value, ...additionalValues].filter(Boolean).join('\n'));
      }}
      onMouseEnter={() => {
        isHoveredRef.current = true;
        setVisible(true);
        onInteractionStart();
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        endInteractionIfInactive();
      }}
    >
      <div className="flex flex-col gap-2">
        {[value, ...additionalValues].map((inputValue, index) => (
          <div key={index} className="group relative">
            <input
              type="text"
              id={index === 0 ? 'stringInput' : `stringInput-${index + 1}`}
              value={inputValue.toUpperCase()}
              onChange={(event) => {
                const nextValue = event.target.value.toUpperCase();
                if (index === 0) {
                  onChange(nextValue);
                } else {
                  setAdditionalValues((current) => {
                    const nextValues = [...current];
                    nextValues[index - 1] = nextValue;
                    return nextValues;
                  });
                }
              }}
              onFocus={() => {
                isFocusedRef.current = true;
                setVisible(true);
                onInteractionStart();
              }}
              onBlur={() => {
                isFocusedRef.current = false;
                endInteractionIfInactive();
              }}
              className="w-40 rounded-md border border-white/20 bg-black/60 px-3 py-2 text-sm text-green-300 outline-none placeholder:text-green-200/60"
            />
            {index > 0 && (
              <span className="absolute -top-1 z-50 -right-1 rounded-full border border-zinc-300/40 bg-stone-900 p-1 text-zinc-300/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:border-red-800/80 hover:text-red-800/80 focus:opacity-100 focus:outline-none">
                <TrashIcon aria-label={`Remove input line ${index + 1}`} onClick={() => setAdditionalValues((current) => current.filter((_, valueIndex) => valueIndex !== index - 1))} className="h-4 w-4" />
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 h-full place-items-end">
        <button
          type="submit"
          id="submitBtn"
          className="rounded-lg bg-linear-to-r border from-white/5 to-white/10 px-4 py-2.5 text-sm font-medium leading-none text-zinc-300/60 border-white/20 transition hover:border-white/40 hover:text-zinc-300 hover:scale-105 hover:from-white/10"
        >
          Submit!
        </button>
        {additionalValues.length < 2 && (
          <button
            type="button"
            aria-label="Add input line"
            onClick={() => setAdditionalValues((current) => [...current, ''])}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-2xl font-black leading-none text-zinc-300/60 transition hover:border-white/40 hover:text-zinc-300 hover:scale-105"
          >
            +
          </button>
        )}
      </div>
    </form>
  );
}
