import { startDialog } from "~src/canvas/dialog";
import {
    getAll, makeLastWeek, ParseSizes, getAllBatched, CanvasRequestOptions
} from "../canvas/settings";
import {User, Assignment, SubmissionGroup, Submission, WorkflowState} from "../canvas/interfaces";
import { get } from "jquery";

const ASSIGNMENT_EXTENDER_BUTTON = `
<li>
    <button title='Assignment Extender' class='btn' id='assgn-extend-load'>EZ-Extender</button>
</li>
`;

const STUDENT_AND_CURRENT_DEADLINE = `
<style>
/* Dropdown Button */
/*THIS CSS DOES NOT BELONG TO ME CREDIT TO - https://www.w3schools.com/howto/howto_js_dropdown.asp */
.dropdown {
  background-color: #3498DB;
  color: white;
  padding: 12px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

/* Dropdown button on hover & focus */
.dropdown:hover, .dropdown:focus {
  background-color: #2980B9;
}

/* The container <div> - needed to position the dropdown content */
.select-student {
  position: relative;
  display: inline-block;
}

/* Dropdown Content (Hidden by Default) */
.student-list {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 120px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.student-list p {
  color: black;
  padding: 10px 14px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.student-list p:hover {background-color: #ddd;}

/* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
.show {display:block;}
</style>

<div class="select-student">
    <button class="dropdown" id="select">Select Student</button><p>&nbsp</p>
    <select id="actual-dropdown" class="student-list">
    </select>
    Selected student: <span id="selected-student"></span>
</div>

<div class="current-deadline">
    Current deadline: <span id="current-deadline-for-student"></span>
</div>
<script>
function listStudentsButton(){
    document.getElementById("actual-dropdown")?.classList.toggle("show");
}
document.getElementById("select").addEventListener("click", listStudentsButton, false); 
function updateSelected(){
    let select = document.getElementById("actual-dropdown");
    let seluser = select.options[select.selectedIndex].value;
    $("#selected-student").html(seluser);
}
</script>
`;

const ASSIGNMENT_EXTENDER_DIALOGUE = `
<div>Status: <span id="assignment-extender-status">Selecting options</span></div>
<br/>
<div id="select-student-and-current-deadline"></div>
<br/>
<div id="select-new-date"></div>
`;

const SELECT_NEW_DATE = `
<div class="select-extension-date">
    Extend assignment to: <input id="new-date" type="date" onchange="updateNewDate()">  at:  <input id="new-time" type="time" onchange="updateNewTime()">
</div>
<script>
function updateNewDate(){
    let newdate = document.getElementById("new-date");
    console.log("New date: " + newdate);
    return newdate;
}

function updateNewTime(){
    let newtime = document.getElementById("new-time");
    console.log("New time: " + newtime);
    return newtime;
}
</script>
`;

export function loadExtenderButton(){
    console.log("Success!")
    $("#sidebar_content").append($(ASSIGNMENT_EXTENDER_BUTTON));
    $("#assgn-extend-load").click(() => {
        startDialog("Easy Assignment Extender", ASSIGNMENT_EXTENDER_DIALOGUE);
        $("#select-student-and-current-deadline").html(STUDENT_AND_CURRENT_DEADLINE);
        $("#select-new-date").html(SELECT_NEW_DATE);
        getStudents();
    });
}

function updateStatus(message: string){
    $("#assignment-extender-status").html(message);
    var test = "blah"
}

// function getCurrentDue(){
//     let dueDate= get(document.location.pathname/due_at)
// }

async function getStudents(){
    const studentList : User[] = await getAll($.get, "users", { 'enrollment_type[]': 'student' });
    let newstudents = studentList.map((student: User) => { return{ student : student, options: {"student_ids[]": student.id} } });
    for (let astudent of newstudents){
        console.log(astudent)
        $("#actual-dropdown").append($(`<option id=${astudent.student.id}>${astudent.student.name}<option>`))
        console.log("trying to add " + astudent.student.name +" to list");
    }   
    return studentList;
    
}

//REFERENCE THIS FOR FINDING ASSIGNMENT DUE DATE
// const submission: Submission = await $.get(`${getBaseCourseUrl()}/assignments/${speedGraderInfo.assignmentId}/submissions/${studentId}`, {
//     "include[]": "user,visibility,submission_comments,rubric_assessment,full_rubric_assessment"
// })