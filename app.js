/***********************************************\
 Alperen Gökdeniz tarafından yazılmıştır.
 https://alperen.cc
\***********************************************/

/*const deger = 10

if (deger == 10){
    console.log('deger: ' + deger)
}

else{
    console.log(`deger 10dan dusuk`)
}
setInterval(() => {
    console.log('sa')
}, 1000);

const isimsoyle = (isim) => {
    console.log('isim: ' + isim);
}

isimsoyle('alperen');
*/

// app.js

const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3131
app.listen(PORT, () =>{
    console.log('sunucu çalışıyo. port = ' + PORT);
})