export const maybeParseJson = (json?: string) => {
  if (typeof json !== 'string') {
    return json;
  }

  try {
    return JSON.parse(json);
  } catch (error) {
    return json;
  }
};
