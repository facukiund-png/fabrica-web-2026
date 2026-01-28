const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ruta absoluta obligatoria
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'db.json'); // Persistencia de datos

const readDB = () => {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
    catch (e) { return {}; }
};
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

app.get('/editar/:id', (req, res) => {
    const db = readDB();
    const data = db[req.params.id] || {};
    res.render('formulario', { id: req.params.id, data });
});

app.post('/guardar/:id', (req, res) => {
    const db = require('fs'); // Asegura acceso a fs para escritura
    const dbData = readDB();
    dbData[req.params.id] = {
        ...req.body,
        services: JSON.parse(req.body.services_json || '[]')
    };
    writeDB(dbData);
    res.redirect(`/v/${req.params.id}`);
});

app.get('/v/:id', (req, res) => {
    const db = readDB();
    const data = db[req.params.id];
    if (!data) return res.status(404).send('Landing no encontrada. Configurála en /editar/id');
    res.render('plantilla', { data });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Elite running on port ${PORT}`));
