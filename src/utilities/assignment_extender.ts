import { loadDialog, startDialog } from "~src/canvas/dialog";
import { getAll, getBaseCourseUrl, getAssignmentId, getBaseApiUrl, getCourseId, getBaseAssignmentUrl} from "../canvas/settings";
import {User, Assignment, AssignmentOverride} from "../canvas/interfaces";

//Global const for Luxon library.
const { DateTime } = require("luxon");
let dt = DateTime.now();

/*Top-level DOM */
const ASSIGNMENT_EXTENDER_DIALOGUE = `
<div>Status: <span id="assignment-extender-status">Selecting options</span></div>
<br/>
<div id="select-student"></div>
<br/>
<div id="show-deadline"></div>
<br/>
<div id="select-new-date"></div>
<br/>
<div id="extend-button"></div>
`;

/* Actual button you see on the assignment page. Clicking this pops up the menu. */
const ASSIGNMENT_EXTENDER_BUTTON = `
<li>
    <button title='Assignment Extender' class='btn' id='assgn-extend-load'>EZ-Extender</button>
</li>
`;

/* HTML and CSS for the dropdown menu to select a student. Also displays the name and current deadline for the selected student */
const SELECT_STUDENT = `
<div class="select-student">
    <label class="dropdown" id="select">Select Student</label>
    <select id="actual-dropdown" class="student-list">
        <option id="placeholder">Select a Student</option>
    </select>
</div>
<script>
function listStudentsButton(){
    document.getElementById("actual-dropdown")?.classList.toggle("show");
}
document.getElementById("select").addEventListener("click", listStudentsButton, false); 
</script>
`;

const DISPLAY_DEADLINE = `
<div class="current-deadline">
    <p>Currently due at: </p> <span id="current-due-for-student"></span>
    <p>Currently locks at: </p> <span id="current-lock-for-student"></span>
</div>
`

const SELECT_NEW_DATE = `
<div class="select-extension-date">
    Extend assignment to: <input id="new-date" type="date">  at:  <input id="new-time" type="time">
    Or, quick dates: <button id="tonight" type="button">Tonight</button> <button id="tmrnight" type="button">Tomorrow Night</button> <button id="treday" type="button">Three Days</button> <button id="week" type="button">One Week</button>

</div>
`;

const EXTEND_BUTTON = `
<div class="extend-assignment">
    <button id="extend-now" type="button">Extend Assignment!</button>
</div>
`;

//Handler function for the extension.
export function loadExtenderButton(){
    console.log("Success!")
    $("#sidebar_content").append($(ASSIGNMENT_EXTENDER_BUTTON));
    $("#assgn-extend-load").click(() => {
        getStudents();
        startDialog("Easy Assignment Extender", ASSIGNMENT_EXTENDER_DIALOGUE);
        $("#select-student").html(SELECT_STUDENT);
        $("#show-deadline").html(DISPLAY_DEADLINE);
        $("#select-new-date").html(SELECT_NEW_DATE);
        $("#extend-button").html(EXTEND_BUTTON);
        $("#actual-dropdown").on("change", function(){
            updateDate();
            updateStatus("Selecting options")
        });
        $("#new-date").on("change", function(){
            updateNewDate();
        });
        $("#new-time").on("change", function(){
            updateNewTime();
        });
        $("#extend-now").on("click", function(){
            extendAssignment(generateNewDueDate());
            updateStatus("Extended assignment for this user.");
        });
        $("#tonight").on("click", function(){
            tonightButton();
        });
        $("#tmrnight").on("click", function(){
            tmrnightButton();
        });
        $("#treday").on("click", function(){
            threeDaysButton();
        });
        $("#week").on("click", function(){
            oneWeekButton();
        });
    });
}

function updateStatus(message: string){
    $("#assignment-extender-status").html(message);
}

// Gets all students enrolled in the current class.
async function getStudents(){
    const studentList : User[] = await getAll($.get, "users", { 'enrollment_type[]': 'student' });
    let newstudents = studentList.map((student: User) => { return{ student : student } } );
    for (let astudent of newstudents){
        let opt = new Option( astudent.student.name, String(astudent.student.id) );
        $(opt).html(opt.text)
        $("#actual-dropdown").append(opt)
    }   
    return studentList;
    
}

/* Function updates the due date presented in the Assignment extension screen.
Logic essentially takes both an assignment and overrides for the assignment
and decides what lock date needs to be presented. */
async function updateDate(){
    let assignment: Assignment = await $.get(`${getBaseCourseUrl()}/assignments/${getAssignmentId()}`);
    let override: AssignmentOverride[] = await $.get(`${getBaseCourseUrl()}/assignments/${getAssignmentId()}/overrides/`);
    let selid = $("#actual-dropdown").find('option:selected').attr('value');

    //If there are no overrides
    if(!override.length){
        $("#current-due-for-student").text(makeReadableDue(assignment));
        $("#current-lock-for-student").text(makeReadableLock(assignment));
    }

    //If there is an override
    if(override.length > 0){
        for(let aoverride of override){
            for(let astudent of aoverride.student_ids!){
                if(astudent === Number(selid)){
                    document.getElementById("current-due-for-student")!.innerText = makeOverrideReadableDue(override, assignment)!;
                    document.getElementById("current-lock-for-student")!.innerText = makeOverrideReadableLock(override,assignment)!;
                }
                else{
                    document.getElementById("current-due-for-student")!.innerText = makeReadableDue(assignment);
                    document.getElementById("current-lock-for-student")!.innerText = makeReadableLock(assignment);
                }
            }
        }
    }
}

async function put(endpoint : string | number, parameters : any) {
    let url = `${getBaseCourseUrl()}/assignments/${getAssignmentId()}/overrides/${endpoint}`;
    return await $.ajax({ url,
        type: 'PUT',
        data: "" + new URLSearchParams(parameters)
    });
}
async function post(parameters: any) {
    let url = `${getBaseCourseUrl()}/assignments/${getAssignmentId()}/overrides`;
    return await $.post(url, parameters);
}

async function extendAssignment(newDate : string){
    let override: AssignmentOverride[] = await $.get(`${getBaseCourseUrl()}/assignments/${getAssignmentId()}/overrides/`);
    let selid = $("#actual-dropdown").find('option:selected').attr('value');
    let data = {'assignment_override[student_ids][]':selid, 'assignment_override[title]' : "Updated extension", 'assignment_override[lock_at]': newDate};
    let didput = false;
    //Case where an override doesn't exist - do a post.
    if(!override.length){
        await post(data);
    }
    //Case where override DOES exist - do a put, or if new student, do a put with a new.
    else if(override.length > 0){ 
        for(let aoveride of override){
            for(let astudent of aoveride.student_ids!){
                if(astudent === Number(selid)){
                    console.log(override, override[0].id);
                    didput = true;
                    await put(override[0].id!, data);
                }
            } 
        }
        if(!didput){
            await post(data);
        }
    }
}

function makeOverrideReadableDue(override: AssignmentOverride[], assignment: Assignment){
    let selid = $("#actual-dropdown").find('option:selected').attr('value');
    let found = false;
    for(let aoverride of override){
        for(let astudent of aoverride.student_ids!){
            if(astudent === Number(selid) && aoverride.due_at){
                found = true;
                let duestr = String(aoverride.due_at);
                let duedate = new Date(duestr)
                return(duedate.toLocaleString("en-US", {
                    timeZone: "America/New_York"
                }));
            }
        }
    }
    if(!found){
        return makeReadableDue(assignment);
    }
}

function makeOverrideReadableLock(override: AssignmentOverride[], assignment : Assignment){
    let selid = $("#actual-dropdown").find('option:selected').attr('value');
    let found = false;
    for(let aoveride of override){
        for(let astudent of aoveride.student_ids!){
            if(astudent === Number(selid)){
                let lockstr = String(aoveride.lock_at);
                let lockdate = new Date(lockstr);
                found = true;
                return(lockdate.toLocaleString("en-US", {
                    timeZone: "America/New_York"
                }));
            }
        }
    }
    if(!found){
        return makeReadableLock(assignment);
    }

}

function makeReadableDue(assignment: Assignment){
    let duestr = String(assignment.due_at);
    let duedate = new Date(duestr)
    return(duedate.toLocaleString("en-US", {
        timeZone: "America/New_York"
    }));
}

function makeReadableLock(assignment: Assignment){
    let lockstr = String(assignment.due_at);
    let lockdate = new Date(lockstr)
    return(lockdate.toLocaleString("en-US", {
                    timeZone: "America/New_York"
                }));
}

function updateNewDate(){
    let newdate = (<HTMLInputElement> document.getElementById("new-date")).value;
    return newdate;
}

function updateNewTime(){
    let newtime = (<HTMLInputElement> document.getElementById("new-time")).value;
    return newtime;
}

function tonightButton(){
    (<HTMLInputElement> document.getElementById("new-date")).value = dt.toISODate();
    (<HTMLInputElement> document.getElementById("new-time")).value = "23:59";
}

function tmrnightButton(){
    (<HTMLInputElement> document.getElementById("new-date")).value = dt.plus({days: 1}).toISODate();
    (<HTMLInputElement> document.getElementById("new-time")).value = "23:59";
}

function threeDaysButton(){
    (<HTMLInputElement> document.getElementById("new-date")).value = dt.plus({days: 3}).toISODate();
    (<HTMLInputElement> document.getElementById("new-time")).value = "23:59";
}

function oneWeekButton(){
    (<HTMLInputElement> document.getElementById("new-date")).value = dt.plus({days: 7}).toISODate();
    (<HTMLInputElement> document.getElementById("new-time")).value = "23:59";
}

/* This date is formatted to be used as input for a new override for a 
due/lock date. */
function generateNewDueDate(){
    return(updateNewDate() + "T" + updateNewTime() + ":00-06:00");
}
