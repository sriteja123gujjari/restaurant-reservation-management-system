import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center animate-slideup">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-district font-extrabold">404 • Not Found</p>
      <h1 className="mb-3 font-heading text-2xl md:text-3xl font-black tracking-tight text-slate-900">This table isn't on our floor plan.</h1>
      <p className="text-xs text-slate-500 mb-6 max-w-xs">
        The dining route you are looking for has moved or does not exist.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-district hover:bg-orange-600 transition-all"
      >
        Return to Floor Plan
      </Link>
    </div>
  );
}
