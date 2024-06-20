/**
 * Start is inclusive, end is not
 */
export function* range(start: number, end: number) {
  let i = start - 1;

  while (i < end - 1) {
    i++;
    yield i;
  }
}