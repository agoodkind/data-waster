interface StatProps {
  label: string;
  value: number;
}

export function Stat({ label, value }: StatProps) {
  return (
    <div>
      <span className={"block text-gray-500"}>{label}</span>
      <span className={"font-mono"}>{value.toFixed(2)}</span>
    </div>
  );
}
