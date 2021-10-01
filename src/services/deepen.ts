import { getLogger } from "./winston";

const logger = getLogger("api");

export function deepen(
  flatObject: Record<string, any>,
  fields: string[]
): Record<string, any> {
  logger.debug("Deepening object:", flatObject);
  const deepObject = {};
  fields.forEach((field) => assignDeep(deepObject, field, flatObject[field]));
  logger.debug("Object deepened:", deepObject);
  return deepObject;
}

function assignDeep(object: Record<string, any>, dotField: string, value: any) {
  const route = dotField.split(".");
  const travelRoute = route.slice(0, -1);
  const lastField = route[route.length - 1];

  let currentObject = object;
  for (const field of travelRoute) {
    if (!currentObject[field]) currentObject[field] = {};
    currentObject = currentObject[field];
  }
  currentObject[lastField] = value;
  return object;
}
