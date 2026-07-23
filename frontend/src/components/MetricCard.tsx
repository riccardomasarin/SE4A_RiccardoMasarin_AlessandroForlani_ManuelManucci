interface MetricCardProps {
  label: string
  value: string | number
  hint?: string
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <article className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
      {hint && <small>{hint}</small>}
    </article>
  )
}
