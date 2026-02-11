import { ClockIcon } from "lucide-react";

export default function JarvisCronTrigger({ name }: { name: string }) {
  return (
    <div className="flex flex-row gap-2 items-center text-muted-foreground pl-1">
      <ClockIcon className="size-4 " />
      <span className="text-sm">{name}</span>
    </div>
  );
}
