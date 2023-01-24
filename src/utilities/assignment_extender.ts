import { startDialog } from "~src/canvas/dialog";
import { getAll, getBaseCourseUrl, getAssignmentId} from "../canvas/settings";
import {User, Assignment, AssignmentOverride} from "../canvas/interfaces";

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
</div>
`;

const EXTEND_BUTTON = `
<div class="extend-assignment">
    <button id="extend" type="button">Extend Assignment!</button>
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
        });
        $("#new-date").on("change", function(){
            updateNewDate();
            generateNewDueDate();
        });
        $("#new-time").on("change", function(){
            updateNewTime();
            generateNewDueDate();
        });
    });
}

function updateStatus(message: string){
    $("#assignment-extender-status").html(message);
}

// Gets all students enrolled in the current class.
async function getStudents(){
    const studentList : User[] = await getAll($.get, "users", { 'enrollment_type[]': 'student' });
    let newstudents = studentList.map((student: User) => { return{ student : student, options: {"student_ids[]": student.id} } });
    for (let astudent of newstudents){
        $("#actual-dropdown").append($(`<option id=${astudent.student.id}>${astudent.student.name}<option>`))
    }   
    return studentList;
    
}

/* Function updates the due date presented in the Assignment extension screen.
Logic essentially takes both an assignment and overrides for the assignment
and decides what lock date needs to be presented. */
async function updateDate(){
    let assignment: Assignment = await $.get(`${getBaseCourseUrl()}/assignments/${getAssignmentId()}`);
    let override: AssignmentOverride = await $.get(`${getBaseCourseUrl()}/assignments/${getAssignmentId()}/overrides`);
    let selid = $("#actual-dropdown").find('option:selected').attr('id');

    //If there are no overrides
    if(!override[0].due_at && !override[0].lock_at){
        console.log("No override found");
        $("#current-due-for-student").html(makeReadableDue(assignment));
        $("#current-lock-for-student").html(makeReadableLock(assignment));
    }

    //If there is an override
    if(override[0].due_at || override[0].lock_at){
        for(let overrideStudentId of override[0].student_ids!){
            if(String(overrideStudentId) === selid){
                console.log("Match found");
                $("#current-due-for-student").html(makeOverrideReadableDue(override)); 
                $("#current-lock-for-student").html(makeOverrideReadableLock(override)); 
            }
            else{
                console.log("No student found");
                $("#current-due-for-student").html(makeReadableDue(assignment));
                $("#current-lock-for-student").html(makeReadableLock(assignment));
            }
        }
    }
}

async function extendAssignment(override: AssignmentOverride, newDate : string){
    //Case where an override doesn't exist - do a post.
    if(!override[0].lock_at){
        //await $.post(`${getBaseCourseUrl()}/assignments/${getAssignmentId()}/overrides`, {})
    }
    //Case where override DOES exist - do a put.
    else if(override[0].lock_at){
        //await $.put(`${getBaseCourseUrl()}/assignments/${getAssignmentId()}/overrides/${override[0].id}`, {})
        //Grab override id from the param 
    }
}

function makeOverrideReadableDue(override: AssignmentOverride){
    let overSplitDue = override[0].due_at!.split("T");
    let overReadableDue = overSplitDue[0] + " at " +  overSplitDue[1].slice(0,-1);
    return overReadableDue;
}

function makeOverrideReadableLock(override: AssignmentOverride){
    let overSplitLock = override[0].lock_at!.split("T");
    let overReadableLock = overSplitLock[0] + " at " +  overSplitLock[1].slice(0,-1);
    return overReadableLock;
}

function makeReadableDue(assignment: Assignment){
    let splitDue = assignment.due_at.split("T");
    let readableDue = splitDue[0] + " at " +  splitDue[1].slice(0,-1);
    return readableDue;
}

function makeReadableLock(assignment: Assignment){
    let splitLock = assignment.lock_at.split("T");
    let readableLock = splitLock[0] + " at " +  splitLock[1].slice(0,-1);
    return readableLock;
}

function updateNewDate(){
    let newdate = (<HTMLInputElement> document.getElementById("new-date")).value;
    return newdate;
}

function updateNewTime(){
    let newtime = (<HTMLInputElement> document.getElementById("new-time")).value;
    return newtime;
}

/* This date is formatted to be used as input for a new override for a 
due/lock date. */
function generateNewDueDate(){
    console.log(updateNewDate() + "T" + updateNewTime() + ":00-06:00");
    return(updateNewDate() + "T" + updateNewTime() + ":00-06:00");
}