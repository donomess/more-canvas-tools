import { startDialog } from "~src/canvas/dialog";
import {
    getAll, makeLastWeek, ParseSizes, getAllBatched, CanvasRequestOptions
} from "../canvas/settings";
import {User, Assignment, SubmissionGroup, Submission, WorkflowState} from "../canvas/interfaces";

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
    <button class="dropdown" id="select">Select Student</button>Selected student: <span id="selected-student"></span>
    <div id="actual-dropdown" class="student-list">
        <p>test</p>
    </div>
</div>

<div class="current-deadline">
    Current deadline: <span id="current-deadline-for-student"></span>
</div>
<script>
function listStudentsButton(){
    document.getElementById("actual-dropdown")?.classList.toggle("show");
}
document.getElementById("select").addEventListener("click", listStudentsButton, false); 
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
    Extend assignment to: <input type="date">  at:  <input type="time">
</div>
`;

export function loadExtenderButton(){
    console.log("Success!")
    $("#sidebar_content").append($(ASSIGNMENT_EXTENDER_BUTTON));
    $("#assgn-extend-load").click(() => {
        startDialog("Easy Assignment Extender", ASSIGNMENT_EXTENDER_DIALOGUE);
        $("#select-student-and-current-deadline").html(STUDENT_AND_CURRENT_DEADLINE);
        $("#select-new-date").html(SELECT_NEW_DATE);
        addMeter(getAll($.get, "users", { 'enrollment_type[]': 'student' }), "Students")
    });
}

function updateStatus(message: string){
    $("#assignment-extender-status").html(message);
}

// async function getStudents() : User[]{
//     var studentList: User[] = [];
//     studentList = (getAll($.get, "users", { 'enrollment_type[]': 'student' }))
// }

function addMeter(d: any, meter: string): any {
    let meterObj = $(`<span id="assignment-extender-status${meter}">${meter}</span>`);
    $("#assignment-extender-status").append(meterObj);
    function updateStatus(meter: string) {
        return (soFar: any, sizes: ParseSizes) => {
            if (sizes === undefined || sizes.last === sizes.current) {
                $("#assignment-extender-status" + meter).remove();
            } else if (sizes.last === undefined) {
                $("#assignment-extender-status" + meter).html(meter + `<span class='badge'>${soFar.length} so far</span>`);
            } else {
                $("#assignment-extender-status" + meter).html(meter + `<span class='badge'>${sizes.last - sizes.current}</span>`);
            }
        };
    }
    console.log("added student")
    return d.progress(updateStatus(meter)).done(updateStatus(meter));
    //Takes a promise and updates information/renders information progressively.
}

