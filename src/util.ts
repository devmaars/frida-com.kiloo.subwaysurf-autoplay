export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function csArrayToJsArray<T>(array: Il2Cpp.Array): T[] {
  const jsArray: T[] = [];

  for (let i = 0; i < array.length; i++) {
    jsArray.push(array.get(i) as T);
  }

  return jsArray;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
