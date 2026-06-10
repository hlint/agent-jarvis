export function JarvisSidebarDecoTop() {
  return (
    <div className="pointer-events-none sticky top-0 z-10">
      <div className="h-1 bg-background" />
      <div className="h-2 bg-linear-to-t from-transparent to-background" />
    </div>
  );
}

export function JarvisSidebarDecoBottom() {
  return (
    <div className="pointer-events-none sticky bottom-0 z-10">
      <div className="h-2 bg-linear-to-b from-transparent to-background" />
      <div className="h-1 bg-background" />
    </div>
  );
}
