import {Home, Login, SubjectDetails, AssignmentDetails, Goals, GoalDetails, AddAssignment, AddGoal, AddSubject, Profile, Notification, SelectSubject, ForgotPassword} from './../Screens';
import ADD_ASSIGNMENT_IMAGE from '../Assets/Images/add-assignment.png';
import ASSIGNMENT_IMAGE from '../Assets/Images/assignment.png';
import GOAL_IMAGE from '../Assets/Images/step.png';
import ADD_GOAL_IMAGE from '../Assets/Images/add-goal.png';
import HOME_IMAGE from '../Assets/Images/home.png';
import BELL_IMAGE from '../Assets/Images/bell.png';
import ADD_SUBJECT_IMAGE from '../Assets/Images/add-subject.png';
import ACCOUNT_IMAGE from '../Assets/Images/account.png';
export const HOME_PATH = 'Home';

export const LOGIN_PATH = 'Login';
export const SUBJECT_DETAILS_PATH = 'SubjectDetails';
export const ASSIGNMENT_DETAILS_PATH = 'AssignmentDetails';
export const GOALS_PATH = 'Goals';

export const GOAL_DETAILS_PATH = 'GoalDetails';

export const ADD_ASSIGNMENT_PATH = 'Add Task';
export const ADD_GOAL_PATH = 'Add Goal';
export const ADD_SUBJECT_PATH = 'Add Category';
export const PROFILE_PATH = 'Profile';
export const NOTIFICATION_PATH = 'Notification';
export const SELECT_SUBJECT_PATH = 'SelectSubject';
export const FORGOT_PASSWORD_PATH = 'ForgotPassword';
export const ROUTES = [
  {
    path: LOGIN_PATH,
    component: Login,
    authRequired: false,
    showInSidebar: true,
  },
  {
    path: HOME_PATH,
    component: Home,
    authRequired: true,
    showInSidebar: false,
    image: HOME_IMAGE,
  },

  {
    path: SUBJECT_DETAILS_PATH,
    component: SubjectDetails,
    authRequired: true,
    showInSidebar: false,

  },
  {
    path: ASSIGNMENT_DETAILS_PATH,
    component: AssignmentDetails,
    authRequired: true,
    showInSidebar: false,
  },
  {
    path: GOALS_PATH,
    component: Goals,
    authRequired: true,
    showInSidebar: false,
    image: GOAL_IMAGE,

  },
  {
    path: GOAL_DETAILS_PATH,
    component: GoalDetails,
    authRequired: true,
    showInSidebar: false,
  },
  {
    path: ADD_ASSIGNMENT_PATH,
    component: AddAssignment,
    authRequired: true,
    showInSidebar: true,
    image: ADD_ASSIGNMENT_IMAGE,

  },
  {
    path: ADD_GOAL_PATH,
    component: AddGoal,
    authRequired: true,
    showInSidebar: true,
    image: ADD_GOAL_IMAGE,

  },
  {
    path: ADD_SUBJECT_PATH,
    component: AddSubject,
    authRequired: true,
    showInSidebar: true,
    image: ADD_SUBJECT_IMAGE,
  },
  {
    path: PROFILE_PATH,
    component: Profile,
    authRequired: true,
    showInSidebar: true,
    image: ACCOUNT_IMAGE,
  },
  {
    path: NOTIFICATION_PATH,
    component: Notification,
    authRequired: true,
    showInSidebar: true,
    image: BELL_IMAGE,
  },
  {
    path: SELECT_SUBJECT_PATH,
    component: SelectSubject,
    authRequired: true,
    showInSidebar: false,
    image: BELL_IMAGE,
  },
  {
    path: FORGOT_PASSWORD_PATH,
    component: ForgotPassword,
    authRequired: false,
    showInSidebar: false,
    image: BELL_IMAGE,
  },
];
