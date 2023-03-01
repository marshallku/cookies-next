import { CookieValueTypes } from "../types";

export const processValue = (value: string): CookieValueTypes => {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "undefined") return undefined;
    if (value === "null") return null;
    return value;
};

export const stringify = (value: string = "") => {
    try {
        const result = JSON.stringify(value);
        return /^[\{\[]/.test(result) ? result : value;
    } catch (e) {
        return value;
    }
};

export const decode = (str: string): string => {
    if (!str) return str;

    return str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
};