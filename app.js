const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

const db = new sqlite3.Database('education.db');

// Middleware
app.use(express.json());
app.use(express.static('public')); // Подключение статических файлов

// Создание таблиц в БД, если они не существуют
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, course_id INTEGER, name TEXT, email TEXT, FOREIGN KEY (course_id) REFERENCES courses(id))");
});

// Простая авторизация
const adminCredentials = {
    username: 'admin',
    password: 'admin'
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.status(200).send('Успешная авторизация');
    } else {
        res.status(401).send('Неверный логин или пароль');
    }
});

// Обработка POST-запросов для создания курсов и учеников
app.post('/courses', (req, res) => {
    const { name } = req.body;
    addCourse({ name })
        .then(() => res.status(201).send('Курс создан'))
        .catch((err) => res.status(500).send('Ошибка при создании курса'));
});

app.post('/students', (req, res) => {
    const { courseId, name, email } = req.body;
    addStudent(courseId, { name, email })
        .then(() => res.status(201).send('Ученик добавлен'))
        .catch((err) => res.status(500).send('Ошибка при добавлении ученика'));
});

// Получение всех курсов
app.get('/courses', (req, res) => {
    getCourses()
        .then(courses => res.json(courses))
        .catch(err => res.status(500).send('Ошибка при получении курсов'));
});

// Получение студентов для конкретного курса
app.get('/students/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    getStudents(courseId)
        .then(students => res.json(students))
        .catch(err => res.status(500).send('Ошибка при получении студентов'));
});

// Удаление курса
app.delete('/courses/:id', (req, res) => {
    const courseId = req.params.id;
    deleteCourse(courseId)
        .then(() => res.status(204).send())
        .catch(err => res.status(500).send('Ошибка при удалении курса'));
});

// Удаление ученика
app.delete('/students/:id', (req, res) => {
    const studentId = req.params.id;
    deleteStudent(studentId)
        .then(() => res.status(204).send())
        .catch(err => res.status(500).send('Ошибка при удалении ученика'));
});

// Обновление курса
app.put('/courses/:id', (req, res) => {
    const courseId = req.params.id;
    const { name } = req.body;
    updateCourse(courseId, { name })
        .then(() => res.status(204).send())
        .catch(err => res.status(500).send('Ошибка при обновлении курса'));
});

// Обновление ученика
app.put('/students/:id', (req, res) => {
    const studentId = req.params.id;
    const { name, email } = req.body;
    updateStudent(studentId, { name, email })
        .then(() => res.status(204).send())
        .catch(err => res.status(500).send('Ошибка при обновлении ученика'));
});

// Функции для взаимодействия с данными
function getCourses() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM courses', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function addCourse(course) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO courses (name) VALUES (?)', [course.name], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID); // Возвращаем ID нового курса
            }
        });
    });
}

function addStudent(courseId, student) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO students (course_id, name, email) VALUES (?, ?, ?)', [courseId, student.name, student.email], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getStudents(courseId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM students WHERE course_id = ?', [courseId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function deleteCourse(courseId) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM courses WHERE id = ?', [courseId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function deleteStudent(studentId) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM students WHERE id = ?', [studentId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function updateCourse(courseId, course) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE courses SET name = ? WHERE id = ?', [course.name, courseId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function updateStudent(studentId, student) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE students SET name = ?, email = ? WHERE id = ?', [student.name, student.email, studentId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});