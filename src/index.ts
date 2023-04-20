import { ChildNode, Plugin } from "postcss";

import Comment from "postcss/lib/comment";

export const PLUGIN_NAME = "postcss-scope";

export interface Options {
  scope: string;
}

export interface Config {
  scope: string;
  ignoreFile: boolean;
  ignoreRules: number[];
}

function processNode(node: ChildNode, scope: string) {
  if (node.type === "atrule") {
    node.nodes.forEach((node) => processNode(node, scope));

    return;
  }

  if (node.type === "rule") {
    if (/^(body|html|:root)/.test(node.selector)) {
      node.selector = node.selector.replace(/^(body|html|:root)/, scope);
      return;
    }

    node.selector = `${scope} ${node.selector}`;
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

      for (const node of nodes) {
        const index = nodes.indexOf(node);

        if (includes(config.ignoreRules, index)) {
          continue;
        }

        processNode(node, scope);
      }
    },
  };
}

export const postcss = true;

export default plugin;
