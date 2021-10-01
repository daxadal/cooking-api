import { getLogger } from "./winston";

const logger = getLogger();

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

export const filterNullValues = (
  object: Record<string, any>,
  fields: string[]
): Record<string, any> =>
  fields
    .filter((field) => object[field] !== null)
    .reduce<Record<string, any>>((newObject, field) => {
      newObject[field] = object[field];
      return newObject;
    }, {});

function assignDeep(object: Record<string, any>, dotField: string, value: any) {
  const route = dotField.split("_");
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