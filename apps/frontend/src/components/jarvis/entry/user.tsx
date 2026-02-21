export default function JarvisUserEntry({ text }: { text: string }) {
  return (
    <div className="flex flex-row gap-3 justify-end text-sm">
      <p className="bg-primary/40 border border-foreground/10 p-3 rounded-xl whitespace-pre-wrap max-w-md overflow-auto">
        {text}
      </p>
    </div>
  );
}
