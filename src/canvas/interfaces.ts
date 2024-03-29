export interface User {
    display_name: string;
    id: number,
    name: string,
    email?: string
}

export type Assignment = {
    id: number,
    published: boolean;
    rubric: RubricCriterion[];
    due_at: String,
    lock_at: String
}

export type AssignmentOverride = {
  all_day: boolean | null,
  all_day_date: string | null, 
  assignment_id: number | null, 
  due_at: string | null, 
  id: number | null, 
  lock_at : string | null, 
  student_ids : number[] | null, 
  title: string | null, 
  unlock_at: string | null 
}

export enum WorkflowState {
    submitted = "submitted",
    unsubmitted = "unsubmitted",
    graded = "graded",
    pending_review = "pending_review"
}

export interface Submission {
    id: number,
    user: User,
    assignment: Assignment,
    submitted_at: string,
    graded_at: string,
    grader_id: number,
    grade: string,
    score: number,
    late_policy_status: string|null,
    seconds_late: number,
    excused: boolean,
    workflow_state: WorkflowState,
    attachments: SubmissionAttachment[] | null,
    full_rubric_assessment?: FullRubricAssessment;
    submission_comments: Comment[];
    preview_url: string;
}

export interface Comment {
    author: User;
    author_id: number;
    author_name: string;
    avatar_path: string;
    comment: string;
    created_at: string;
    edited_at: string|null;
    id: number;
}

export interface SubmissionAttachment {
    url: string;
}

export type SubmissionGroup = {
    user_id: number,
    submissions: Submission[]
}

export interface SpeedGraderInfo {
    assignmentId: number;
    assignmentTitle: string;
    currentUser: User;
}

export interface FullRubricAssessment {
    assessor_id: number;
    assesor_name: string;
    data: RubricRating[]
}

export interface RubricRating {
    comments: string;
    comments_enabled: boolean;
    criterion_id: string;
    description: string;
    id: string;
    points: number;
}

export interface RubricCriterion {
    id: string;
    description: string;
    long_description: string;
    points: number;
}