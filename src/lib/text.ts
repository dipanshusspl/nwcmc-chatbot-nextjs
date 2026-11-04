/** Postgres text columns cannot contain NUL characters. */
export const stripNul = (s: string) => s.replace(/\u0000/g, "");
