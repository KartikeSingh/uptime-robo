"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlModel = exports.robot = void 0;
const axios_1 = require("axios");
const mongoose_1 = require("mongoose");
const storage = require("quick.db");
const urls_1 = require("./models/urls");
class robot {
    constructor(mongoURI = "quick.db") {
        this.urls = [];
        this.mongo = "quick.db";
        this._connecting = false;
        if (typeof (mongoURI) !== "string")
            throw new Error("Mongo URI should be a string but recived " + JSON.stringify(mongoURI));
        if (mongoURI !== "quick.db")
            this._connecting = true;
        this.mongo = mongoURI;
        if (this.mongo === "quick.db") {
            this.urls = storage.get('urls') || [];
            this._ping();
        }
        else {
            const mongo = new mongoose_1.Mongoose();
            mongo.connect(this.mongo).then(v => {
                this._connecting = false;
                robot.URLS = mongo.model("urls_config", urls_1.default);
                robot.URLS.find((e, data) => {
                    this.urls = data || [];
                    console.log(data);
                    this._ping();
                });
            }).catch(() => {
                throw new Error("I was unable to connect to mongo DB, probably invalid URI was provided");
            });
        }
    }
    add(url, time = 60000) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("A");
                if (this._connecting)
                    yield new Promise((res) => setTimeout(res, 6000));
                console.log("AA");
                if (typeof (url) !== "string" || url.length < 6 || !url.startsWith("http"))
                    throw new Error("Invalid url was provided");
                if (typeof (time) !== "number" || time < 1000)
                    throw new Error("Time should be a number and at least 1000");
                if (this.urls.some(v => v.url === url))
                    throw new Error("url already exists");
                yield axios_1.default.get(url);
                const urls = storage.get('urls') || [], data = { url, time };
                this.urls.push(data);
                urls.push(data);
                if (this.mongo === "quick.db")
                    storage.set('urls', urls);
                else
                    yield robot.URLS.create(data);
                setInterval(() => {
                    axios_1.default.get(url).catch(e => { });
                }, time);
            }
            catch (e) {
                if (e.isAxiosError)
                    throw new Error("I was unable to make a request to the provided url");
                else
                    throw new Error(e);
            }
            return this;
        });
    }
    remove(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._connecting)
                yield new Promise((res) => setTimeout(res, 5000));
            if (typeof (url) !== "string" || url.length < 6 || !url.startsWith("http"))
                throw new Error("Invalid url was provided");
            if (!this.urls.some(v => v.url === url))
                throw new Error("url do not exists");
            this.urls = this.urls.filter(v => v.url !== url);
            if (this.mongo === "quick.db")
                storage.set('urls', this.urls);
            else
                yield robot.URLS.findOneAndDelete({ url });
            return this;
        });
    }
    _ping() {
        return __awaiter(this, void 0, void 0, function* () {
            this.urls.forEach(v => {
                setInterval(() => {
                    axios_1.default.get(v.url).catch(e => { });
                }, v.time);
            });
        });
    }
}
exports.robot = robot;
exports.urlModel = robot.URLS;
