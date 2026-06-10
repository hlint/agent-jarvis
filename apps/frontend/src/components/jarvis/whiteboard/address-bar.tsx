import { ChevronRightIcon, HomeIcon, RefreshCwIcon } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { WHITEBOARD_HOME_PATH } from "./constants";

export default function JarvisWhiteboardAddressBar({
  path,
  recentPaths,
  onNavigate,
  onRefresh,
  onHidePanel,
}: {
  path: string;
  recentPaths: string[];
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  onHidePanel?: () => void;
}) {
  const [input, setInput] = useState(path);

  useEffect(() => {
    setInput(path);
  }, [path]);

  const filteredPaths = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) return recentPaths;
    return recentPaths.filter((item) => item.toLowerCase().includes(query));
  }, [input, recentPaths]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onNavigate(trimmed);
  };

  return (
    <form className="flex min-w-0 items-center gap-1.5" onSubmit={handleSubmit}>
      {onHidePanel ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Hide whiteboard"
          aria-label="Hide whiteboard"
          onClick={onHidePanel}
        >
          <ChevronRightIcon />
        </Button>
      ) : null}
      <div className="min-w-0 flex-1">
        <Combobox
          items={filteredPaths}
          inputValue={input}
          onInputValueChange={setInput}
          onValueChange={(value) => {
            if (value) onNavigate(String(value));
          }}
        >
          <ComboboxInput
            placeholder="File path, e.g. home.html"
            aria-label="Whiteboard file path"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            showClear={false}
            className="w-full font-mono"
          />
          <ComboboxContent>
            <ComboboxList>
              {filteredPaths.map((item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty>No matching recent paths</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        title="Refresh"
        aria-label="Refresh"
        onClick={onRefresh}
      >
        <RefreshCwIcon />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        title="Go home"
        aria-label="Go home"
        onClick={() => onNavigate(WHITEBOARD_HOME_PATH)}
      >
        <HomeIcon />
      </Button>
    </form>
  );
}
