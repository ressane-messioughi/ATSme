export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-[var(--ff-mono)] text-xs uppercase tracking-widest text-[var(--violet-soft)] mb-2">
        {title}
      </p>
      <h1 className="text-2xl font-bold mb-3">{title}</h1>
      <div className="border border-dashed border-[var(--border)] rounded-xl px-6 py-10">
        <p className="text-sm text-[var(--text-dim)]">{description}</p>
      </div>
    </div>
  );
}
