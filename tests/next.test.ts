import { OptionsType, getCookie, setCookie } from "../src";

const getDummyContext = () =>
    ({
        req: {
            headers: {
                cookie: "name=John%20Doe;age=20",
            },
        },
        res: {
            setHeader() {},
            getHeader() {
                return [""];
            },
        },
    } as unknown as OptionsType);

describe("Server side cookie", () => {
    it("Should not override decoded cookies when setting cookie", () => {
        const { req, res } = getDummyContext();
        const job = "Front-end developer";

        setCookie("job", job, { req, res });

        expect(`${req?.headers.cookie}`).toContain("John%20Doe");
    });

    it("Should encode value when setting to headers", () => {
        const { req, res } = getDummyContext();
        const status = { foo: true, bar: true };

        setCookie("status", status, { req, res });

        expect(`${req?.headers.cookie}`).toContain(
            encodeURIComponent(JSON.stringify(status))
        );
    });

    it("Should return decoded value", () => {
        const { req, res } = getDummyContext();
        const name = getCookie("name", { req, res });

        expect(name).toBe("John Doe");
    });
});
