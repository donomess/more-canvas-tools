// This file cannot contain Webpack-resolved imports (e.g. "~src/foo").

import U from "./userscript";

export const NAME = U.sitename;
export const HOSTNAME = U.hostname;

export const PATH = {
    PEOPLE_PAGE: /courses\/\d+\/users/,
    SPEED_GRADER: /courses\/\d+\/gradebook\/speed_grader/,
    SUBMISSION_PAGE: /courses\/\d+\/assignments\/\d+\/submissions\/\d+/,
} as const;