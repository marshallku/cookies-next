import { OptionsType, setCookie } from "../src";

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

it("Should not override decoded cookies when setting cookie", () => {
    const { req, res } = getDummyContext();

    setCookie("job", "Front-end developer", { req, res });

    expect(`${req?.headers.cookie}`).toContain("John%20Doe");
});
