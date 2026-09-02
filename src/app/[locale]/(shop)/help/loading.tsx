export default function HelpLoading() {
  return (
    <div className="help-container" style={{ minHeight: "320px" }}>
      <div className="animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-white/10 rounded w-2/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
