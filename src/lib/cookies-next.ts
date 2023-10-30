import { serialize, parse } from "cookie";
import { OptionsType, TmpCookiesObj, CookieValueTypes } from "../types";
import {
    isClientSide,
    processCookieValue,
    decodeCookieValue,
    stringifyCookieValue,
    tryDecodeCookieValue,
    checkUriEncodedSimply,
} from "../utils";

export const getCookies = (options?: OptionsType): TmpCookiesObj => {
    let req;
    if (options) req = options.req;
    if (!isClientSide()) {
        // if cookie-parser is used in project get cookies from ctx.req.cookies
        // if cookie-parser isn't used in project get cookies from ctx.req.headers.cookie
        if (req && req.cookies) return req.cookies;
        if (req && req.headers && req.headers.cookie)
            return parse(req.headers.cookie);
        return {};
    }

    const _cookies: TmpCookiesObj = {};
    const documentCookies = document.cookie ? document.cookie.split("; ") : [];

    for (let i = 0, len = documentCookies.length; i < len; ++i) {
        const cookieParts = documentCookies[i].split("=");

        const _cookie = cookieParts.slice(1).join("=");
        const name = cookieParts[0];

        _cookies[name] = _cookie;
    }

    return _cookies;
};

export const getCookie = (
    key: string,
    options?: OptionsType
): CookieValueTypes => {
    const _cookies = getCookies(options);
    const value = _cookies[key];
    if (value === undefined) return undefined;
    return processCookieValue(decodeCookieValue(value));
};

export const setCookie = (
    key: string,
    data: any,
    options?: OptionsType
): void => {
    let _cookieOptions: any;
    let _req;
    let _res;
    if (options) {
        const { req, res, ..._options } = options;
        _req = req;
        _res = res;
        _cookieOptions = _options;
    }

    const cookieStr = serialize(key, stringifyCookieValue(data), {
        path: "/",
        ..._cookieOptions,
    });
    if (!isClientSide()) {
        if (_res && _req) {
            let currentCookies = _res.getHeader("Set-Cookie");

            if (!Array.isArray(currentCookies)) {
                currentCookies = !currentCookies
                    ? []
                    : [String(currentCookies)];
            }
            _res.setHeader("Set-Cookie", currentCookies.concat(cookieStr));

            if (_req && _req.cookies) {
                const _cookies = _req.cookies;
                data === ""
                    ? delete _cookies[key]
                    : (_cookies[key] = stringifyCookieValue(data));
            }

            if (_req && _req.headers && _req.headers.cookie) {
                const _cookies: Record<string, string> = parse(
                    _req.headers.cookie
                );

                data === ""
                    ? delete _cookies[key]
                    : (_cookies[key] = stringifyCookieValue(data));

                _req.headers.cookie = Object.entries(_cookies).reduce(
                    (acc, [key, value]) => {
                        try {
                            const decodedValue = decodeURIComponent(value);

                            // HACK: Considered as encoded value - it might be malformed
                            if (decodedValue !== value) {
                                return acc.concat(`${key}=${value};`);
                            }

                            return acc.concat(
                                `${key}=${encodeURIComponent(value)};`
                            );
                        } catch {
                            return acc.concat(
                                `${key}=${encodeURIComponent(value)};`
                            );
                        }
                    },
                    ""
                );
            }
        }
    } else {
        document.cookie = cookieStr;
    }
};

export const deleteCookie = (key: string, options?: OptionsType): void => {
    return setCookie(key, "", { ...options, maxAge: -1 });
};

export const hasCookie = (key: string, options?: OptionsType): boolean => {
    if (!key) return false;

    const cookie = getCookies(options);
    return cookie.hasOwnProperty(key);
};

export const sanitizeCookies = (options?: OptionsType) => {
    const cookies = getCookies(options);
    const keys = Object.keys(cookies);

    for (let i = 0, len = keys.length; i < len; ++i) {
        const key = keys[i];
        const currentCookie = cookies[key];

        if (!currentCookie) {
            continue;
        }

        // Remove cookies with malformed uri
        const [parsedValue, malformedValue] =
            tryDecodeCookieValue(currentCookie);

        if (malformedValue || !parsedValue) {
            if (malformedValue) {
                deleteCookie(key);
            }

            continue;
        }

        // Encode uri-decoded values
        if (
            parsedValue &&
            parsedValue === currentCookie &&
            !checkUriEncodedSimply(parsedValue)
        ) {
            // It overrides options too
            // Consider using `deleteCookie` instead `setCookie`
            setCookie(key, encodeURIComponent(currentCookie), options);
        }
    }
};

export const sanitizeCookieString = (str: string) => {
    if (!str) {
        return str;
    }

    const cookieArray = str.split(";");
    let cookieString = "";

    for (let i = 0, max = cookieArray.length; i < max; ++i) {
        const [key, value] = cookieArray[i].split("=");
        // Remove cookies with malformed uri
        const [parsedValue, malformedValue] = tryDecodeCookieValue(value);

        if (malformedValue) {
            continue;
        }

        if (
            parsedValue === value &&
            parsedValue &&
            !checkUriEncodedSimply(parsedValue)
        ) {
            cookieString += `${key}=${encodeURIComponent(value)};`;
            continue;
        }

        cookieString += `${key}=${value};`;
    }

    return cookieString;
};
