import { parseUnits } from "@zkchainhub/shared/utils";

describe("parseUnits", () => {
    it("parse units correctly", () => {
        const value = 1000000000000000000n;
        const decimals = 18;
        const expected = 1;

        const result = parseUnits(value, decimals);

        expect(result).toEqual(expected);
    });

    it("handle decimals correctly", () => {
        const value = 123456789n;
        const decimals = 9;
        const expected = 0.123456789;

        const result = parseUnits(value, decimals);

        expect(result).toEqual(expected);
    });

    it("handles zero value correctly", () => {
        const value = 0n;
        const decimals = 18;
        const expected = 0;

        const result = parseUnits(value, decimals);

        expect(result).toEqual(expected);
    });
});
