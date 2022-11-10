const express = require('express');
const app = express();

const mongoose = require('mongoose');

const bodyParse = require('body-parser');
const { Console } = require('console');
//carpeta de ejs (como los html)
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');  //motor de views ejs
//aqui estan los css style
app.use(express.static(__dirname + '/static'));

app.use(bodyParse.urlencoded({ extended: true }));
//conexion a la bdd, la crea sino existe y se llama dbChat
mongoose.connect('mongodb://localhost/dcChat', {useNewUrlParser: true});
//schema hijo de posteo, schema comentario solo puede tener 1 padre que es posteo
const ComentarioSchema = new mongoose.Schema({
    nombre: {type: String, min:2, max:100, require: [true, 'Favor de ingresar el Nombre'],},
    comentario: {type: String, min:2, max:200, require: [true, 'comentario obligatorio']}
})
//schema padre, schema posteo tiene 1 o muchos hijos comentarios
const PosteoSchema = new mongoose.Schema({
    nombre: {type: String, min:2, max:100, require: [true, 'Favor de ingresar el Nombre'],},
    comentario: {type: String, min:2, max:200, require: [true, 'comentario obligatorio']},
    postcomentario: [ComentarioSchema]
})
//modelo de posteo al schema
const Chat = mongoose.model('chat', PosteoSchema);

//ejs de : mensaje metodo :GET
app.get('/mensaje', (req, res) => {
    Chat.find({})   //encuentra todos los chat
    .then(chat => {
        //console.log("2222");
        res.render("mensaje",{chat: chat, mensaje: ''});
    })
    .catch(error => handleError(error))
})
//ejs de : mensaje metodo :POST retorna segun form
app.post('/mensaje', function(req, res) {
    let { nombre, comentario} = req.body
   //console.log("111",req.body);
    let chat = new Chat()
    chat.nombre = nombre
    chat.comentario = comentario
    chat.save()
    .then(
        () => res.redirect("/mensaje")
    )
    .catch(error => handleError(error))
})
app.post('/chatcomment/:id', function(req, res) {
    Chat.findOneAndUpdate           //update a _id seleccionado
        ({_id: req.params.id}, {$push: {postcomentario: req.body}})
    .then(
        () => res.redirect("/mensaje")
    )
    .catch(error => handleError(error))
})



function handleError(error) {
    // if (error.code === 11000) {
    //     return `Email duplicate: ${error.keyValue.email}`
    // } else if (error.errors.email.path === 'email') {
    //     return `Email invalid: ${error.errors.email.value} `
    // } else {
        console.log(error);
        return error
    // }
}







app.listen(5000, function() {
    console.log ("Escuchando http://localhost:5000/mensaje en puerto 5000");
})