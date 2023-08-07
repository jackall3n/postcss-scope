import postcss from "postcss";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import plugin, { Options } from "../src";

function fixture(name: string, ext = "css") {
  return readFileSync(resolve("tests/fixtures", `${name}.${ext}`), "utf8");
}

function process(options: Options | string | string[], input: string) {
  return postcss(plugin(options)).process(input, { from: undefined });
}

describe("postcss-scope", () => {
  it("should scope css", async () => {
    const options = {
      scope: ".foo",
    };

    const input = fixture("base");
    const expected = fixture("base.expected");

    const actual = await process(options, input);

    expect(actual.css).toEqual(expected);
    expect(actual.warnings()).toHaveLength(0);
  });

  it("should ignore file", async () => {
    const options = {
      scope: ".foo",
    };

    const input = fixture("ignore");

    const actual = await process(options, input);

    expect(actual.css).toEqual(input);
    expect(actual.warnings()).toHaveLength(0);
  });

  it("should ignore rule", async () => {
    const options = {
      scope: ".foo",
    };

    const input = fixture("ignore-rule");
    const expected = fixture("ignore-rule.expected");

    const actual = await process(options, input);

    expect(actual.css).toEqual(expected);
    expect(actual.warnings()).toHaveLength(0);
  });

  it("should set scope", async () => {
    const options = {
      scope: ".foo",
    };

    const input = fixture("set-scope");
    const expected = fixture("set-scope.expected");

    const actual = await process(options, input);

    expect(actual.css).toEqual(expected);
    expect(actual.warnings()).toHaveLength(0);
  });

  it("should scope multiple selectors", async () => {
    const options = {
      scope: ".foo",
    };

    const input = fixture("multiple-selectors");
    const expected = fixture("multiple-selectors.expected");

    const actual = await process(options, input);

    expect(actual.css).toEqual(expected);
    expect(actual.warnings()).toHaveLength(0);
  });

  it("should support multiple scopes", async () => {
    const options = [".foo", ".bar"];

    const input = fixture("multiple-scopes");
    const expected = fixture("multiple-scopes.expected");

    const actual = await process(options, input);

    expect(actual.css).toEqual(expected);
    expect(actual.warnings()).toHaveLength(0);
  });
});
