export default function JarvisUserEntry({ text }: { text: string }) {
  return (
    <div className="flex flex-row gap-3 justify-end my-6 text-sm">
      <p className="bg-muted p-4 rounded-lg whitespace-pre-wrap max-w-md overflow-auto">
        {text}
      </p>
    </div>
  );
}
