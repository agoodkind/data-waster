interface ToggleProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export function Toggle({ active, label, onClick }: ToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded border border-blue-600 transition
                  ${active ? "bg-blue-600 text-white" : "text-blue-600"}`}
    >
      {label}
    </button>
  );
}
