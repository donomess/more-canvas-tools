// This file cannot contain Webpack-resolved imports (e.g. "~src/foo").

import U from "./userscript";

export const NAME = U.sitename;
export const HOSTNAME = U.hostname;

export const PATH = {
    PEOPLE_PAGE: /courses\/\d+\/users/,
    SPEED_GRADER: /courses\/\d+\/gradebook\/speed_grader/,
    SUBMISSION_PAGE: /courses\/\d+\/assignments\/\d+\/submissions\/\d+/,
    ASSIGNMENT_PAGE: /courses\/\d+\/assignments.*/
    //Will be similar to submission page, but need to be much more specific than that as to not confused the page. Abuse regex101.
} as const;