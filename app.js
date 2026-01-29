const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'secreto-2026', resave: false, saveUninitialized: false }));

const DB_PATH = path.join(__dirname, 'db.json');
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const checkAuth = (req, res, next) => { if (req.session.userId) next(); else res.redirect('/login'); };

app.get('/editar/:id', checkAuth, (req, res) => {
    const db = readDB();
    const data = db[req.params.id] || {};
    res.render('formulario', { id: req.params.id, data });
});

app.post('/guardar/:id', checkAuth, (req, res) => {
    const dbData = readDB();
    dbData[req.params.id] = {
        ...req.body,
        products: JSON.parse(req.body.products_json || '[]') // Guardamos productos dinámicos
    };
    writeDB(dbData);
    res.redirect(`/v/${req.params.id}`);
});

app.get('/v/:id', (req, res) => {
    const db = readDB();
    const data = db[req.params.id];
    if (!data) return res.status(404).send('No encontrado');
    res.render('plantilla', { data });
});

app.listen(3000, () => console.log('SaaS Elite Running'));
