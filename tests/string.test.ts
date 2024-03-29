import { decodeCookieValue } from "../src";

it("Should decode encoded cookies", () => {
    expect(decodeCookieValue("foo%26bar%3DHello%3BWorld")).toBe(
        "foo&bar=Hello;World"
    );
    expect(decodeCookieValue("bmFtZT0iSm9obi1Eb2UiCg==")).toBe(
        "bmFtZT0iSm9obi1Eb2UiCg=="
    );
    expect(decodeCookieValue("name%3D%22John-Doe%22")).toBe('name="John-Doe"');
});
