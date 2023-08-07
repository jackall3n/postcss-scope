import { ChildNode, Plugin } from "postcss";
import type { Root } from "postcss-selector-parser";

const parser = require("postcss-selector-parser");

import Comment from "postcss/lib/comment";

export const PLUGIN_NAME = "postcss-scope";

export interface Options {
  scope: string | string[];
}

export interface Config {
  scope: string | string[];
  ignoreFile: boolean;
  ignoreRules: number[];
}

const parse = (scope: string) =>
  parser((selectors: Root) => {
    let done = false;

    selectors.walkNesting((nesting) => {
      done = true;

      nesting.replaceWith(parser.string({ value: scope }));
    });

    if (done) {
      return;
    }

    selectors.first.prepend(
      parser.selector({
        value: "scope",
        nodes: [parser.string({ value: scope + " " })],
      })
    );
  });

function processNode(node: ChildNode, scopes: string[]) {
  if (node.type === "atrule") {
    node.nodes.forEach((node) => processNode(node, scopes));

    return;
  }

  if (node.type === "rule") {
    if (/^(body|html|:root)/.test(node.selector)) {
      node.selector = node.selector.replace(
        /^(body|html|:root)/,
        scopes.join(", ")
      );
      return;
    }

    const selectors: string[] = [];

    for (const scope of scopes) {
      const scoped = node.selectors.map((selector) => {
        return parse(scope).processSync(selector);
      });

      selectors.push(...scoped);
    }

    node.selectors = selectors;
  }
}

function includes<T>(array: T[], item: T): boolean {
  return array.some((i) => i === item);
}

function getConfig(nodes: ChildNode[]): Config {
  const config: Config = {
    scope: "",
    ignoreFile: false,
    ignoreRules: [],
  };

  for (const node of nodes) {
    if (node.type !== "comment") {
      continue;
    }

    const comment = node as Comment;

    const index = nodes.indexOf(comment);

    if (!comment.text.startsWith(`${PLUGIN_NAME}:`)) {
      continue;
    }

    const [, action] = comment.text.split(":");

    switch (action) {
      case "ignore-file":
        config.ignoreFile = true;
        break;

      case "ignore":
        config.ignoreRules.push(index + 1);
        break;

      default:
        config.scope = action;
    }
  }

  return config;
}

/**
 * Initialise the plugin with options
 * @param options
 */
function plugin(options: Options | string): Plugin {
  const opts = typeof options === "string" ? { scope: options } : options;

  return {
    postcssPlugin: PLUGIN_NAME,
    Root(root) {
      const { nodes } = root;

      const config = getConfig(nodes);

      if (config.ignoreFile) {
        return;
      }

      const scope = config.scope || opts.scope;
      const scopes = Array.isArray(scope) ? scope : [scope];

      for (const node of nodes) {
        const index = nodes.indexOf(node);

        if (includes(config.ignoreRules, index)) {
          continue;
        }

        processNode(node, scopes);
      }
    },
  };
}

// @ts-ignore
module.exports.postcss = true;
// @ts-ignore
module.exports = plugin;

export default plugin;
