export type RecursiveRecord<T> = { [key: string]: T | RecursiveRecord<T> };

export type RecursiveRecordArray<T> = Array<T | RecursiveRecordArray<T>>;
