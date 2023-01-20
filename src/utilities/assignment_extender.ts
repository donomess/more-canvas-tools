import { startDialog } from "~src/canvas/dialog";
import { getAll, getBaseCourseUrl, CanvasRequestOptions, getAssignmentID} from "../canvas/settings";
import {User, Assignment, AssignmentOverride} from "../canvas/interfaces";
import { extend, get } from "jquery";
import { updateNew } from "typescript";


const ASSIGNMENT_EXTENDER_DIALOGUE = `
<div>Status: <span id="assignment-extender-status">Selecting options</span></div>
<br/>
<div id="select-student"></div>
<br/>
<div id="show-deadline"></div>
<br/>
<div id="select-new-date"></div>
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
    Current deadline: <span id="current-deadline-for-student"></span>
</div>
`

const SELECT_NEW_DATE = `
<div class="select-extension-date">
    Extend assignment to: <input id="new-date" type="date">  at:  <input id="new-time" type="time">
</div>
`;

export function loadExtenderButton(){
    console.log("Success!")
    $("#sidebar_content").append($(ASSIGNMENT_EXTENDER_BUTTON));
    $("#assgn-extend-load").click(() => {
        startDialog("Easy Assignment Extender", ASSIGNMENT_EXTENDER_DIALOGUE);
        $("#select-student").html(SELECT_STUDENT);
        $("#show-deadline").html(DISPLAY_DEADLINE);
        $("#select-new-date").html(SELECT_NEW_DATE);
        getStudents();
        $("#actual-dropdown").on("change", function(){
            updateDate();
        });
        $("#new-date").on("change", function(){
            updateNewDate();
            generateNewDueDate(updateNewDate(),updateNewTime());
        });
        $("#new-time").on("change", function(){
            updateNewTime();
            generateNewDueDate(updateNewDate(),updateNewTime());
        });
    });
}

function updateStatus(message: string){
    $("#assignment-extender-status").html(message);
}

async function getStudents(){
    const studentList : User[] = await getAll($.get, "users", { 'enrollment_type[]': 'student' });
    let newstudents = studentList.map((student: User) => { return{ student : student, options: {"student_ids[]": student.id} } });
    for (let astudent of newstudents){
        //console.log(astudent)
        $("#actual-dropdown").append($(`<option id=${astudent.student.id}>${astudent.student.name}<option>`))
        //console.log("trying to add " + astudent.student.name +" to list");
    }   
    return studentList;
    
}

async function updateDate(){
    //updates date
    let select = document.getElementById("actual-dropdown") as HTMLSelectElement;
    let aId = getAssignmentID();
    console.log(aId);
    const students : User[] = await getAll($.get, "users", { 'enrollment_type[]': 'student' });
    let newstudents = students.map((student: User) => { return{ student : student, options: {"student_ids[]": student.id} } });
    let selid = select.options[select.selectedIndex].id;
    for(let astudent of newstudents){
        if(String(astudent.student.id) === selid){
            let dueDate: Assignment = await $.get(`${getBaseCourseUrl()}/assignments/${aId}`);
            console.log(dueDate);
        }
    }
        
}

function updateNewDate(){
    let newdate = (<HTMLInputElement> document.getElementById("new-date")).value;
    return newdate;
}

function updateNewTime(){
    let newtime = (<HTMLInputElement> document.getElementById("new-time")).value;
    return newtime;
}

function generateNewDueDate(date: string, time: string){
    console.log(updateNewDate() + "T" + updateNewTime() + ":00-06:00");
    return(updateNewDate() + "T" + updateNewTime() + ":00-06:00");
}


//REFERENCE THIS FOR FINDING ASSIGNMENT DUE DATE
// const submission: Submission = await $.get(`${getBaseCourseUrl()}/assignments/${speedGraderInfo.assignmentId}/submissions/${studentId}`, {
//     "include[]": "user,visibility,submission_comments,rubric_assessment,full_rubric_assessment"
// })