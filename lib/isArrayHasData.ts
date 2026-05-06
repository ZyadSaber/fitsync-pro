const isArrayHasData = <T>(arr?: T[]): arr is T[] => Array.isArray(arr) && arr.length > 0;

export default isArrayHasData;
