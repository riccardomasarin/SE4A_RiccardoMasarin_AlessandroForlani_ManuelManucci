interface StateBlockProps {
  title: string
  message: string
}

export function StateBlock({ title, message }: StateBlockProps) {
  return (
    <section className="state-block">
      <strong>{title}</strong>
      <p>{message}</p>
    </section>
  )
}
