export default function JarvisUserEntry({ text }: { text: string }) {
  return (
    <div className="flex flex-row gap-3 justify-end text-sm">
      <p className="bg-background border p-3 rounded-xl whitespace-pre-wrap max-w-md overflow-auto">
        {text}
      </p>
    </div>
  );
}
