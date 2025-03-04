const courseListElement = document.getElementById("courseList");
const studentListElement = document.getElementById("studentList");
const selectedCourseNameElement = document.getElementById("selectedCourseName");

async function loadCourses() {
    try {
        const response = await fetch("https://localhost:7125/api/Courses");
        if (!response.ok) {
            throw new Error("Failed to fetch courses");
        }
        const courses = await response.json();
        displayClickCourses(courses);
    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

function displayClickCourses(courses) {
    courseListElement.innerHTML = "";

    courses.forEach(course => {
        console.log(course);
        const li = document.createElement("li");
        li.textContent = `${course.courseName} - ${new Date(course.courseDateTime).toLocaleString()}`;
        li.addEventListener("click", () => {
            loadStudents(course.courseID);
            updateSelectedCourseName(course.courseName);
        });
        courseListElement.appendChild(li);
    });
}

// Funkcja do aktualizacji nazwy wybranego kursu
function updateSelectedCourseName(courseName) {
    selectedCourseNameElement.textContent = courseName;
}

// Funkcja do pobierania studentów dla wybranego kursu
async function loadStudents(courseID) {
    try {
        studentListElement.innerHTML = " ";
        const response = await fetch(`https://localhost:7125/api/Registrations/Course/${courseID}`);
        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }
        const students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error("Error loading students:", error);
    }
}

// Funkcja do wyświetlania listy studentów
function displayStudents(students) {
    studentListElement.innerHTML = "";

    if (students.length === 0) {
        studentListElement.innerHTML = "<li>No students enrolled in this course.</li>";
        return;
    }

    students.forEach(student => {
        const li = document.createElement("li");
        li.textContent = `${student.firstName} ${student.lastName}`;
        studentListElement.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {

    //console.log("JavaScript działa!");
    loadCourses();
});
