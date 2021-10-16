import { Schema, model } from 'mongoose';

const urlSchema = new Schema({
    url: String,
    time: Number,
});

export default urlSchema;