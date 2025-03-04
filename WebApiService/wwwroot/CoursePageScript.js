document.addEventListener("DOMContentLoaded", () => {

    const courseDropdown = document.getElementById("courseDropdown");
    const deleteCourseDropdown = document.getElementById("deleteCourseDropdown");
    const addCourseForm = document.getElementById("addCourseForm");
    const editCourseForm = document.getElementById("editCourseForm");
    const deleteCourseForm = document.getElementById("deleteCourseForm");
    const addMessage = document.getElementById("addMessage");
    const editMessage = document.getElementById("editMessage");
    const deleteMessage = document.getElementById("deleteMessage");

    //console.log("JavaScript działa!");

    // Funkcja do załadowania kursów
    async function loadCourses() {
        try {
            const response = await fetch("https://localhost:7125/api/Courses");
            if (!response.ok) {
                throw new Error("Failed to fetch courses.");
            }
            const courses = await response.json();
            populateDropdown(courseDropdown, courses);
            populateDropdown(deleteCourseDropdown, courses);
        } catch (error) {
            console.error("Error loading courses:", error);
        }
    }

    // Funkcja do wypełnienia dropdowna kursami
    function populateDropdown(dropdown, courses) {
        dropdown.innerHTML = `<option value="">-- Wybierz kurs --</option>`;
        courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.courseID;
            option.textContent = `${course.courseName} - ${new Date(course.courseDateTime).toLocaleString()}`;
            dropdown.appendChild(option);
        });
    }

    // Obsługa formularza dodawania kursu
    addCourseForm.addEventListener("submit", async (event) => {

        event.preventDefault();
        const formData = {
            courseName: document.getElementById("courseName").value,
            courseDateTime: document.getElementById("courseDateTime").value
        };

        //console.log("Wysyłane dane:", formData);

        try {
            const response = await fetch("https://localhost:7125/api/Courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!formData.courseName || !formData.courseDateTime) {
                addMessage.textContent = "Wszystkie pola są wymagane.";
                addMessage.style.color = "red";
                return;
            }

            if (!response.ok) {
                throw new Error("Nie można dodać kursu");
            }

            addMessage.textContent = "Dodano kurs!";
            addMessage.style.color = "green";
            addCourseForm.reset();
            loadCourses(); // Odśwież dropdown
        } catch (error) {
            console.error("Error submitting form:", error);
            addMessage.textContent = "Błąd podczas dodawania. Spróbuj ponownie.";
            addMessage.style.color = "red";
        }
    });

    // Obsługa formularza edycji kursu
    editCourseForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const courseID = courseDropdown.value;

        if (!courseID) {
            editMessage.textContent = "Należy wybrać kurs do modyfikacji.";
            editMessage.style.color = "red";
            return;
        }

        const formData = {
            courseID: parseInt(courseID),
            courseName: document.getElementById("editCourseName").value,
            courseDateTime: document.getElementById("editCourseDateTime").value
        };

        //console.log("Wysyłane dane:", formData);

        try {
            const response = await fetch(`https://localhost:7125/api/Courses/${courseID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Nie można zmodyfikować kursu");
            }

            editMessage.textContent = "Kurs zmodyfikowany pomyślnie!";
            editMessage.style.color = "green";
            editCourseForm.reset();
            loadCourses();
        } catch (error) {
            console.error("Błąd podczas modyfikacji kursu:", error);
            editMessage.textContent = "Błąd podczas modyfikacji. Spróbuj ponownie.";
            editMessage.style.color = "red";
        }
    });

    // Obsługa formularza usuwania kursu
    deleteCourseForm.addEventListener("submit", async (event) => {

        //console.log("Zdarzenie submit zostało wywołane.");

        event.preventDefault();
        const courseID = deleteCourseDropdown.value;

        //console.log("Wybrany kurs ID:", courseID);

        if (!courseID) {
            deleteMessage.textContent = "Należy wybrać kurs do usunięcia.";
            deleteMessage.style.color = "red";
            return;
        }

        try {
            const response = await fetch(`https://localhost:7125/api/Courses/${courseID}`, {
                method: "DELETE"
            });

            //console.log("Formularz usuwania został wysłany.");
            //console.log("Zmienna deleteMessage:", deleteMessage);
            //console.log("Zmienna deleteCourseDropdown:", deleteCourseDropdown);

            if (!response.ok) {
                throw new Error("Nie udało się usunąć kursu.");
            }

            deleteMessage.textContent = "Kurs usunięty pomyślnie!";
            deleteMessage.style.color = "green";
            
            loadCourses();
        } catch (error) {
            console.error("Błąd podczas usuwania kursu:", error);
            deleteMessage.textContent = "Błąd podczas usuwania kursu. Spróbuj ponownie.";
            deleteMessage.style.color = "red";
        }
    });

    // Wywołaj załadowanie kursów przy starcie
    loadCourses();
});
