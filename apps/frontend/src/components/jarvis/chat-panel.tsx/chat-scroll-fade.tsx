/** Top gradient fade for chat message list (inside scroll container) */
export function JarvisChatScrollFadeTop() {
  return (
    <div className="pointer-events-none sticky top-0 z-10">
      <div className="h-2 bg-background-secondary" />
      <div className="h-4 bg-linear-to-t from-transparent to-background-secondary" />
    </div>
  );
}

/** Bottom gradient fade above sticky input (messages scroll underneath) */
export function JarvisChatScrollFadeBottom() {
  return (
    <div className="pointer-events-none" aria-hidden>
      <div className="h-6 bg-linear-to-b from-transparent to-background-secondary" />
      <div className="h-2 bg-background-secondary" />
    </div>
  );
}
