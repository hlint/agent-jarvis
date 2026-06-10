import type { JSONValue } from "@repo/shared/defines/miscs";
import type { ReactNode } from "react";
import JsonPreview from "./primitives/json-preview";
import PreBlock from "./primitives/pre-block";
import ToolSection from "./primitives/section";
import { asRecord, asString } from "./utils";

export default function GenericToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: JSONValue;
  output: JSONValue;
  showOutput: boolean;
}) {
  return (
    <>
      <ToolSection label="Input">{renderValue(input)}</ToolSection>
      {showOutput ? (
        <ToolSection label="Output">{renderValue(output)}</ToolSection>
      ) : null}
    </>
  );
}

function renderValue(value: JSONValue): ReactNode {
  const text = asString(value);
  if (text != null) {
    return <PreBlock>{text}</PreBlock>;
  }

  const record = asRecord(value);
  if (record) {
    return <JsonPreview data={record} />;
  }

  if (Array.isArray(value)) {
    return <JsonPreview data={{ items: value }} collapsed={1} />;
  }

  if (value == null) {
    return <p className="text-xs text-muted-foreground">(empty)</p>;
  }

  return <PreBlock>{String(value)}</PreBlock>;
}
