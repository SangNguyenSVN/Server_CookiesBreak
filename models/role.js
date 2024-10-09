// models/role.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    permissions: [{
        type: String // Danh sách các quyền (permissions) có thể là chuỗi
    }]
});

module.exports = mongoose.model('Role', roleSchema);
