export const maybeParseJson = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return json;
  }
};
