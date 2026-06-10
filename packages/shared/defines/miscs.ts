export type JSONValue =
  | null
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray;
type JSONObject = {
  [key: string]: JSONValue | undefined;
};
type JSONArray = JSONValue[];
