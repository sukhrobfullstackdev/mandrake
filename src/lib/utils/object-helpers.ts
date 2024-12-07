import { RecursiveRecord, RecursiveRecordArray } from '@custom-types/util';
import { type CamelCase } from 'type-fest';

export enum OriginCase {
  Snake = 'snake',
  Kabob = 'kabob',
}

export type CamelCaseObjectDeep<ObjectType> = ObjectType extends object
  ? {
      [Key in keyof ObjectType as CamelCase<Key>]: ObjectType[Key] extends object
        ? ObjectType[Key] extends Array<infer NestedArrayType>
          ? Array<CamelCaseObjectDeep<NestedArrayType>>
          : CamelCaseObjectDeep<ObjectType[Key]>
        : ObjectType[Key];
    }
  : ObjectType;

export const camelizeKeys = <T>(objToConvert: T, originalCase = OriginCase.Snake): CamelCaseObjectDeep<T> => {
  const converted: RecursiveRecord<unknown> = {};
  const selector = originalCase === OriginCase.Snake ? /(_\w)/g : /(-\w)/g;

  if (typeof objToConvert !== 'object' || !objToConvert) {
    return objToConvert as CamelCaseObjectDeep<T>;
  }

  Object.keys(objToConvert).forEach((k: string) => {
    const key: keyof T = k as keyof T;
    const newKey = k.replace(selector, w => w[1].toUpperCase());

    converted[newKey] = objToConvert[key];

    if (Array.isArray(objToConvert[key])) {
      converted[newKey] = (objToConvert[key] as RecursiveRecordArray<unknown>).map(item =>
        camelizeKeys(item, originalCase),
      );
    } else if (typeof objToConvert[key] !== 'object') {
      converted[newKey] = objToConvert[key];
    } else {
      converted[newKey] = camelizeKeys(objToConvert[key], originalCase);
    }
  });

  return converted as CamelCaseObjectDeep<T>;
};

export function isObjectEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}
