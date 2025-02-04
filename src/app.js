const express = require('express');
const session = require('express-session');
const pool = require('./db'); // Importamos la configuración de la base de datos
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const exphbs = require('express-handlebars');
const hbs = require('hbs');
const http = require('http');
const app = express();


// Configurar la sesión
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // 'secure' debe ser 'true' si usas HTTPS
}));


// Configuración del motor de plantillas para Express
app.set('view engine', 'hbs');  // Usamos 'hbs' para las vistas
app.set('views', path.join(__dirname, 'views'));  // Asegúrate de que apunte a la carpeta de vistas

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.redirect('/login');
});

// Ruta para mostrar el formulario de login
app.get('/login', (req, res) => {
    res.render('login/login');
});

// Asegúrate de que Express pueda manejar datos en formato JSON
app.use(express.json());






app.use('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(__dirname + '/manifest.json');
});


pool.getConnection()
  .then(connection => {
    console.log('Conexión exitosa');
    connection.release();
  })
  .catch(err => {
    console.error('Error de conexión:', err);
  });



// Ruta de login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("Datos recibidos:", { email, password });  // Ver los datos que llegan

        // Buscar el usuario por su correo electrónico
        const [rows] = await pool.execute('SELECT * FROM user WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log("No se encontró usuario con ese correo electrónico");
            return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }

        // Obtener el usuario encontrado
        const user = rows[0];

        // Verificar que la contraseña coincida con la almacenada
        console.log("Contraseña recibida:", password);  // Ver la contraseña recibida
        console.log("Contraseña almacenada:", user.password);  // Ver la contraseña almacenada

        if (password !== user.password) {
            console.log("Las contraseñas no coinciden");
            return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }

        // Autenticación exitosa
        // Guardar la información de la sesión
        req.session.loggedin = true;
        req.session.name = user.name; // Asumiendo que tienes un campo 'name' en la base de datos
        req.session.userId = user.id;

        // Redirigir a la ruta /home
        res.redirect('/home');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});









// Ruta para el home
app.get('/home', (req, res) => {
    if (req.session.loggedin === true) {
        const nombreUsuario = req.session.name;
        res.render('administracion/home.hbs', { navopertaivo: true, nombreUsuario,layout: 'layouts/nav_admin.hbs' });
    } else {
        res.redirect('/login');
    }
});










 


// Ruta para manejar el cierre de sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.redirect('/login');  // Redirige al usuario a la página de login
    });
});


























// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});