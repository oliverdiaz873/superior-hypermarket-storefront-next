export default function HelpCategoryLoading() {
  return (
    <div className="help-container" style={{ minHeight: "280px" }}>
      <div className="animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mx-auto mb-3" />
        <div className="h-4 bg-white/10 rounded w-2/3 mx-auto mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-white/10 rounded-xl mb-3" />
        ))}
      </div>
    </div>
  );
}
