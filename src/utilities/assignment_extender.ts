import { startDialog } from "~src/canvas/dialog";

const ASSIGNMENT_EXTENDER_BUTTON = `
<li>
    <button title='Assignment Extender' class='btn' id='assgn-extend-load'>EZ-Extender</button>
</li>
`;

const ASSIGNMENT_EXTENDER_DIALOGUE_HTML = `
<div id ="assignmentExtendStatus">Loading assignment, please wait...</div>
`;


export function loadExtenderButton(){
    $("#page-action-list").append($(ASSIGNMENT_EXTENDER_BUTTON));
    $("#assgn-extend-load").click(() => {
        startDialog("Easy Assignment Extender", ASSIGNMENT_EXTENDER_DIALOGUE_HTML);
    });
}


/* Promises are something that essentially says that the thing you want will be there, but you need to wait, so 
that's why we use await before functions. 

When you make a new promise, you must pass in functions, but you don't need to return anything when you define something like
const Promise = new Promise<type>(resolve: <a function that consumes an x and returns nothing>, reject <>) => (void) { 
    Doesnt matter what is in the function as long as you call resolve at some point with the thing you promised.
}

ajax is equivelant to fetch 
$when().then() when takes a list of promises and then does whatever you put inside of then (maybe it's done as well).
*/
