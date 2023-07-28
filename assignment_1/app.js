const express = require('express');
const app = express();
const mysql = require('mysql');

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'student',
    database: 'wallpaper_site'

});
connection.connect(err => {
    if (err) console.log("Cant connect to database")
});


app.get('/', (req, res) => {
    connection.query('select * from wallpaper', (err, rows) => {
        if (err) {
            console.log(err);
        }

        res.render('pages/index.ejs', { data: rows })
    })
})

app.get('/wallpaper/upload', (req, res)=>{
    res.render('pages/upload.ejs')
})

app.get('/wallpaper/:id', async (req, res) => {
    // Extract from DB wallpaper with id = :id
    let result = await querryDB(req.params.id);
    console.log(result);
    if (result.length === 0) {
        res.redirect('../*')
    }
    res.render('pages/wallpaper.ejs', { item: result })
})


/* TODO: Implement an about and a category page */
app.get('/about', (req, res) => {
    res.send('Not implemented yet');
})

app.get('/category/all', (req, res) => {
    res.send('Not implemented yet');
})


app.all('*', (req, res) => {
    res.status(404).send('Page not found')
})

app.listen(5000, () => { console.log('App is listening on port 5000...') })


const querryDB = async (wallpaper_id) => {
    return await new Promise(resolve => {
        connection.query('select * from wallpaper where id = ?', [wallpaper_id], (err, rows) => {
            if (err) {
                console.log(err);
            }
            resolve(rows)
        })
    })
}