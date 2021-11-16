export function parseEnvString(name: string, errors: string[]): string {
  const value = process.env[name];
  if (value && value !== "") return value;

  errors.push(`${name} must be defined and not empty`);
  return "";
}
