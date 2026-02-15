const express = require('express');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 4001;
const app = require('./app');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL).then(() => {console.log('mongoBD connected')});

app.listen(PORT, () => {
    console.log(`Server running on the port http://localhost:${PORT}`);
})