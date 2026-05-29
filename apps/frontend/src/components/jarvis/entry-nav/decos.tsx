export function JarvisEntryNavDecoTop() {
  return (
    <div className="sticky top-0 z-10">
      <div className="h-4 bg-background" />
      <div className="h-6 bg-from-transparent to-background bg-linear-to-t" />
    </div>
  );
}
export const JarvisEntryNavDecoBottom = () => {
  return (
    <div className="sticky bottom-0 z-10">
      <div className="h-4 bg-from-transparent to-background bg-linear-to-b" />
      <div className="h-6 bg-background" />
    </div>
  );
};
