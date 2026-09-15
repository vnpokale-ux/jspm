/**
 * TSSM's BSCOER & JSPM Campus Lost & Found Initial Dataset & Constants
 */

const COLLEGE_LOGO_URL = 'images/college_logo.jpg';
const CAMPUS_BANNER_URL = 'images/campus_banner.png';

const INITIAL_CATEGORIES = [
  { id: 'electronics', name: 'Electronics & Gadgets', icon: '💻', count: 24 },
  { id: 'accessories', name: 'Accessories & Bags', icon: '🎒', count: 18 },
  { id: 'cards', name: 'College IDs & Wallets', icon: '🪪', count: 15 },
  { id: 'clothing', name: 'Clothing & Lab Coats', icon: '🧥', count: 12 },
  { id: 'books', name: 'Textbooks & Journals', icon: '📚', count: 9 },
  { id: 'keys', name: 'Bike/Car Keys & Fobs', icon: '🔑', count: 14 },
  { id: 'waterbottles', name: 'Bottles & Tumblers', icon: '🍶', count: 8 },
  { id: 'other', name: 'Miscellaneous Items', icon: '📦', count: 7 }
];

const CAMPUS_LOCATIONS = [
  'BSCOER Central Library & Digital Reading Hall (3rd Floor)',
  'Computer Science Dept - Lab 204 (TSSM Block)',
  'Mechanical Engineering Workshop & CAD Lab',
  'JSPM Main Campus Amphitheatre & Central Lawns',
  'TSSM Central Canteen & Food Court',
  'Civil Engineering Department Seminar Hall',
  'Student Section & Admin Building (Ground Floor)',
  'E&TC Dept Robotics & IoT Lab',
  'BSCOER Main Entrance Gate & Security Cabin',
  'Hostel Block A & Sports Ground'
];

const OFFICIAL_ADMIN = {
  id: 1,
  clerkId: 'admin_sanjay_patil',
  email: 'sb@patil.bscoer.gmail.com',
  password: 'SB_patil@123',
  firstName: 'Sanjay',
  lastName: 'Patil',
  role: 'ADMIN',
  status: 'APPROVED',
  avatar: 'SP'
};

const SAMPLE_REPORTER_A = {
  id: 101,
  clerkId: 'user_student_101',
  email: 'student.desk@gmail.com',
  firstName: 'Campus',
  lastName: 'Student',
  role: 'USER',
  status: 'APPROVED',
  avatar: 'CS'
};

const SAMPLE_REPORTER_B = {
  id: 102,
  clerkId: 'user_finder_102',
  email: 'finder.desk@gmail.com',
  firstName: 'Campus',
  lastName: 'Finder',
  role: 'USER',
  status: 'APPROVED',
  avatar: 'CF'
};

const DEMO_USERS = {
  admin: OFFICIAL_ADMIN
};

const INITIAL_ITEMS = [];
const INITIAL_CLAIMS = [];
const INITIAL_MATCHES = [];
const INITIAL_NOTIFICATIONS = [];
