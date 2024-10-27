document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const createCourseBtn = document.getElementById('btn-create-course');
    const addStudentBtn = document.getElementById('btn-add-student');
    const showCoursesBtn = document.getElementById('btn-show-courses');
    
    const unauthorizedSection = document.getElementById('unauthorized');
    const authorizedSection = document.getElementById('authorized');

    // Обработка авторизации
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            unauthorizedSection.style.display = 'none';
            authorizedSection.style.display = 'block';
            alert('Успешная авторизация');
        } else {
            alert('Неверный логин или пароль');
        }
    });

    createCourseBtn.addEventListener('click', async () => {
        const courseName = document.getElementById('course-name').value;
        
        if (!courseName) {
            alert("Введите название курса");
            return;
        }

        const response = await fetch('/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: courseName }),
        });

        if (response.ok) {
            alert('Курс создан');
            document.getElementById('course-name').value = ''; // Сбросить поле после создания
            showCourses();
        } else {
            alert('Ошибка при создании курса');
        }
    });

    addStudentBtn.addEventListener('click', async () => {
        const courseId = document.getElementById('student-course-id').value;
        const studentName = document.getElementById('student-name').value;
        const studentEmail = document.getElementById('student-email').value;

        if (!courseId || !studentName || !studentEmail) {
            alert("Заполните все поля для добавления ученика");
            return;
        }

        const response = await fetch('/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId, name: studentName, email: studentEmail }),
        });

        if (response.ok) {
            alert('Ученик добавлен');
            document.getElementById('student-course-id').value = '';
            document.getElementById('student-name').value = '';
            document.getElementById('student-email').value = '';
            showStudents(courseId);
        } else {
            alert('Ошибка при добавлении ученика');
        }
    });

    showCoursesBtn.addEventListener('click', async () => {
        showCourses();
    });

    async function showCourses() {
        const response = await fetch('/courses');
        if (response.ok) {
            const courses = await response.json();
            const coursesList = document.getElementById('courses-list');
            coursesList.innerHTML = ''; // Очистить список курсов
            courses.forEach(course => {
                const li = document.createElement('li');
                li.textContent = `Курс: ${course.name} (ID: ${course.id})`;
                li.style.cursor = 'pointer'; // показываем курсор, чтобы указать на кликабельность
                li.addEventListener('click', () => showStudents(course.id)); // Обработчик на клик

                // Добавляем кнопки редактирования и удаления
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Редактировать';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Не запускаем событие клика на главном элементе
                    editCourse(course.id);
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Удалить';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Не запускаем событие клика на главном элементе
                    deleteCourse(course.id);
                });

                li.appendChild(editBtn);
                li.appendChild(deleteBtn);
                coursesList.appendChild(li);
            });
        } else {
            alert('Ошибка при получении курсов');
        }
    }

    async function showStudents(courseId) {
        const response = await fetch(`/students/${courseId}`);
        if (response.ok) {
            const students = await response.json();
            const studentsList = document.getElementById('students-of-course');
            studentsList.innerHTML = `<h3>Ученики курса ID ${courseId}:</h3>`;
            if (students.length === 0) {
                studentsList.innerHTML += '<p>Нет учеников в этом курсе.</p>';
            } else {
                students.forEach(student => {
                    studentsList.innerHTML += `<p>${student.name} (${student.email}) 
                        <button onclick="editStudent(${student.id}, '${student.name}', '${student.email}')">Редактировать</button>
                        <button onclick="deleteStudent(${student.id})">Удалить</button>
                    </p>`;
                });
            }
            studentsList.style.display = 'block'; // Показать список учеников
        } else {
            alert('Ошибка при получении студентов');
        }
    }

    // Изменение курса
    async function editCourse(courseId) {
        const newName = prompt("Введите новое название курса:");
        if (newName) {
            const response = await fetch(`/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });
            if (response.ok) {
                alert('Курс обновлен');
                showCourses(); // Обновляем список курсов
            } else {
                alert('Ошибка при обновлении курса');
            }
        }
    }

    // Удаление курса
    async function deleteCourse(courseId) {
        const response = await fetch(`/courses/${courseId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert('Курс удален');
            showCourses(); // Обновляем список курсов
        } else {
            alert('Ошибка при удалении курса');
        }
    }

    // Изменение ученика
    window.editStudent = async (studentId, currentName, currentEmail) => {
        const newName = prompt("Введите новое имя ученика:", currentName);
        const newEmail = prompt("Введите новый e-mail ученика:", currentEmail);
        if (newName && newEmail) {
            const response = await fetch(`/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName, email: newEmail }),
            });
            if (response.ok) {
                alert('Ученик обновлен');
                const courseId = document.getElementById('student-course-id').value;
                showStudents(courseId); // Обновляем список студентов
            } else {
                alert('Ошибка при обновлении ученика');
            }
        }
    };

    // Удаление ученика
    window.deleteStudent = async (studentId) => {
        const response = await fetch(`/students/${studentId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert('Ученик удален');
            const courseId = document.getElementById('student-course-id').value;
            showStudents(courseId); // Обновляем список студентов
        } else {
            alert('Ошибка при удалении ученика');
        }
    };
});