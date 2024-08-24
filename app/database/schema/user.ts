import mongoose, { models } from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensures email addresses are unique
    },
    password: {
        type: String,
        required: true
    }
});

const userModel = models.User || mongoose.model('User', userSchema);

export default userModel;
