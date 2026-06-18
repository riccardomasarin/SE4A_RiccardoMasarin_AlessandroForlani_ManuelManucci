import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="state-block">
      <strong>Page not found</strong>
      <p>This route is not part of the NightOUT demo.</p>
      <Link className="secondary-action" to="/feed">Back to feed</Link>
    </section>
  )
}
