document.addEventListener("DOMContentLoaded", () => {

    const courseDropdown = document.getElementById("courseDropdown");
    const registerForm = document.getElementById("registerForm");
    const registerMessage = document.getElementById("registerMessage");

    const emailCourses = document.getElementById("emailCourses");

    const cancelForm = document.getElementById("cancelForm");
    const cancelMessage = document.getElementById("cancelMessage");
    const cancelCourseDropdown = document.getElementById("cancelCourseDropdown");
    const emailCancel = document.getElementById("emailCancel");

    async function loadCourses() {
        try {
            const response = await fetch("https://localhost:7125/api/Courses");
            if (!response.ok) {
                throw new Error("Failed to fetch courses.");
            }
            const courses = await response.json();
            populateDropdown(courseDropdown, courses);
            populateDropdown(cancelCourseDropdown, courses);
        } catch (error) {
            console.error("Error loading courses:", error);
        }
    }

    // Funkcja do wypełnienia dropdowna kursami
    function populateDropdown(dropdown, courses) {
        dropdown.innerHTML = `<option value="">--Wybierz kurs --</option>`;
        courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.courseID;
            option.textContent = `${course.courseName} - ${new Date(course.courseDateTime).toLocaleString()}`;
            dropdown.appendChild(option);
        });
    }

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const courseID = courseDropdown.value;
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const age = document.getElementById("age").value.trim();
        const email = document.getElementById("emailRegister").value.trim();
        
        if (!courseID || !firstName || !lastName || !age || !email) {
            registerMessage.textContent = "Wszystkie pola są wymagane.";
            registerMessage.style.color = "red";
            return;
        }
        
        if (isNaN(age) || parseInt(age) <= 0) {
            registerMessage.textContent = "Wiek musi być liczbą większą od 0.";
            registerMessage.style.color = "red";
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            registerMessage.textContent = "Podaj poprawny adres email.";
            registerMessage.style.color = "red";
            return;
        }
        
        const formData = { courseID, firstName, lastName, age: parseInt(age), email };

        try {
            const response = await fetch("https://localhost:7125/api/Registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Failed to register for the course.");
            }

            registerMessage.textContent = "Rejestracja zakończona sukcesem!";
            registerMessage.style.color = "green";
            registerForm.reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            registerMessage.textContent = "Błąd podczas rejestracji. Spróbuj ponownie.";
            registerMessage.style.color = "red";
        }
    });

   

    cancelForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const courseID = cancelCourseDropdown.value;
        const email = emailCancel.value;
        
        if (!courseID || !email) {
            cancelMessage.textContent = "Należy wybrać kurs i podać adres e-mail.";
            cancelMessage.style.color = "red";
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            cancelMessage.textContent = "Podaj poprawny adres email.";
            cancelMessage.style.color = "red";
            return;
        }

        try {
            const response = await fetch(`https://localhost:7125/api/Registrations?courseId=${courseID}&email=${encodeURIComponent(email)}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Nie udało się usunąć rejestracji.");
            }

            cancelMessage.textContent = "Anulowano rejestrację pomyślnie";
            cancelMessage.style.color = "green";
            loadCourses();
        } catch (error) {
            cancelMessage.textContent = "Błąd podczas usuwania rejestracji. Spróbuj ponownie.";
            cancelMessage.style.color = "red";
        }
    });

 
    loadCourses();
});

async function loadCoursesByUserEmail() {
    const email = emailCourses.value.trim();
    const userCoursesList = document.getElementById("userCoursesList");
    
    userCoursesList.innerHTML = "";

    if (!email) {
        userCoursesList.innerHTML = "<li>Podaj adres e-mail, aby zobaczyć swoje kursy.</li>";
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        userCoursesList.innerHTML = "<li>Podaj poprawny adres e-mail</li>";
        return;
    }

    try {
        const response = await fetch(`https://localhost:7125/api/Registrations/user?email=${encodeURIComponent(email)}`);

        if (!response.ok) {
            if (response.status === 404) {
                userCoursesList.innerHTML = "<li>Nie znaleziono kursów dla podanego adresu e-mail.</li>";
            } else {
                throw new Error("Nie udało się pobrać kursów dla podanego adresu e-mail.");
            }
            return;
        }


        const courses = await response.json();
        
        if (courses.length === 0) {
            userCoursesList.innerHTML = "<li>Nie znaleziono kursów dla podanego adresu e-mail.</li>";
            return;
        }
        //console.log("Pobrane kursy:", courses);

        courses.forEach(course => {
            //console.log("Kurs:", course);
            const li = document.createElement("li");
            
            const courseName = course.courseName || "Nieznany kurs";
            const courseDateTime = course.courseDateTime
                ? new Date(course.courseDateTime).toLocaleString()
                : "Brak daty";
                
            li.textContent = `${courseName} - ${courseDateTime}`;
            userCoursesList.appendChild(li);
        });
    } catch (error) {
        console.error("Błąd podczas pobierania kursów:", error);
        userCoursesList.innerHTML = "<li>Wystąpił błąd podczas pobierania kursów. Spróbuj ponownie później.</li>";
    }
}