import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-gold-dim">Table not found</p>
      <h1 className="mb-4 font-sans text-2xl md:text-3xl font-bold uppercase tracking-tight text-text">This page isn't on the books.</h1>
      <Link to="/" className="text-gold hover:text-gold-soft">
        Back to the front door
      </Link>
    </div>
  );
}
