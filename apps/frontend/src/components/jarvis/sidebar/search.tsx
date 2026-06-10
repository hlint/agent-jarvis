import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function JarvisSidebarSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search conversations…"
        className="h-7 border-transparent bg-transparent px-2 pl-8 text-xs/relaxed shadow-none hover:border-ring focus-visible:border-ring focus-visible:bg-input/20 focus-visible:ring-0 dark:bg-transparent dark:focus-visible:bg-input/30"
        aria-label="Search conversations"
      />
    </div>
  );
}
