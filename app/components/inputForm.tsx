'use client';

import { useRef } from 'react';

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

  const endInteractionIfInactive = () => {
    if (!isHoveredRef.current && !isFocusedRef.current) {
      onInteractionEnd();
    }
  };

  return (
    <form
      id="inputForm"
      className={`absolute left-5 top-20 z-10 flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 p-2 backdrop-blur-sm transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        isFocusedRef.current = false;
        isHoveredRef.current = false;
        onInteractionEnd();
        onSubmit(value);
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
      <input
        type="text"
        id="stringInput"
        value={value.toUpperCase()}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
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
      <button
        type="submit"
        id="submitBtn"
        className="rounded-xl bg-linear-to-r from-zinc-500 to-zinc-50 px-4 py-2 text-sm font-medium text-black transition hover:scale-105 hover:from-zinc-200"
      >
        Submit!
      </button>
    </form>
  );
}
