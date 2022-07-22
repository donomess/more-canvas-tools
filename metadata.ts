import { Metadata } from "userscript-metadata";
import {
    BuildConfig,
} from "userscripter/build";

import U from "./src/userscript";

export default function(_: BuildConfig): Metadata {
    return {
        name: U.name,
        version: U.version,
        description: U.description,
        author: U.author,
        match: [
            `*://${U.hostname}/*`
        ],
        namespace: U.namespace,
        run_at: U.runAt,
        grant: 'none',
        updateURL: "https://ud-cis-teaching.github.io/more-canvas-tools/more-canvas-tools.user.js",
        downloadURL: "https://ud-cis-teaching.github.io/more-canvas-tools/more-canvas-tools.user.js"
    };
}
