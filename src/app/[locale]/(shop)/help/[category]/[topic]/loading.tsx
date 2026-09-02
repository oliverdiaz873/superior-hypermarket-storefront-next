export default function HelpTopicLoading() {
  return (
    <div className="help-container" style={{ minHeight: "320px" }}>
      <div className="animate-pulse">
        <div className="h-8 bg-white/10 rounded w-2/3 mx-auto mb-4" />
        <div className="h-4 bg-white/10 rounded w-full mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 mb-3">
            <div className="w-7 h-7 bg-white/10 rounded-full shrink-0" />
            <div className="h-5 bg-white/10 rounded flex-1" />
          </div>
        ))}
        <div className="h-16 bg-white/10 rounded-xl mt-6" />
      </div>
    </div>
  );
}
