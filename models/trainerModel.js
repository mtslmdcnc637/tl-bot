const mongoose = require('mongoose');
const { Schema } = mongoose;
const treinerModel = new Schema({
    quest: { type: String, required: true },
    category: { type: String, required: true },
    userId: { type: String, required: true },
    type: { type: String, required: true },

});
const trainerData = mongoose.model('treinerModel', treinerModel);
module.exports = trainerData;