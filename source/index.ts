import axios from 'axios';
import { Mongoose } from 'mongoose';
import * as storage from 'quick.db';
import urlSchema from './models/urls';

export class robot {
    urls: Array<urlConfig> = [];
    mongo: string = "quick.db";
    _connecting: boolean = false;
    static URLS: any;

    constructor(mongoURI: string = "quick.db") {
        if (typeof (mongoURI) !== "string") throw new Error("Mongo URI should be a string but recived " + JSON.stringify(mongoURI));
        if (mongoURI !== "quick.db") this._connecting = true;

        this.mongo = mongoURI;
        if (this.mongo === "quick.db") {
            this.urls = storage.get('urls') || [];
            this._ping();
        } else {
            const mongo = new Mongoose();
            mongo.connect(this.mongo).then(v => {
                this._connecting = false;
                robot.URLS = mongo.model("urls_config", urlSchema);
                robot.URLS.find((e, data) => {
                    this.urls = data || [];
                    this._ping();
                });
            }).catch(() => {
                throw new Error("I was unable to connect to mongo DB, probably invalid URI was provided")
            });
        }
    }

    async add(url: string, time: number = 60000): Promise<this> {
        try {
            if (this._connecting) await new Promise((res) => setTimeout(res, 4000));

            if (typeof (url) !== "string" || url.length < 6 || !url.startsWith("http")) throw new Error("Invalid url was provided");
            if (typeof (time) !== "number" || time < 1000) throw new Error("Time should be a number and at least 1000");
            if (this.urls.some(v => v.url === url)) throw new Error("url already exists");

            await axios.get(url);

            const urls = storage.get('urls') || [], data = { url, time };
            this.urls.push(data);
            urls.push(data);

            if (this.mongo === "quick.db") storage.set('urls', urls);
            else await robot.URLS.create(data);

            setInterval(() => {
                axios.get(url).catch(e => { })
            }, time)
        } catch (e) {
            if (e.isAxiosError) throw new Error("I was unable to make a request to the provided url");
            else throw new Error(e);
        }

        return this;
    }

    async remove(url: string) {
        if (this._connecting) await new Promise((res) => setTimeout(res, 5000));

        if (typeof (url) !== "string" || url.length < 6 || !url.startsWith("http")) throw new Error("Invalid url was provided");
        if (!this.urls.some(v => v.url === url)) throw new Error("url do not exists");

        this.urls = this.urls.filter(v => v.url !== url);

        if (this.mongo === "quick.db") storage.set('urls', this.urls);
        else await robot.URLS.findOneAndDelete({ url });

        return this;
    }

    private async _ping() {
        this.urls.forEach(v => {
            setInterval(() => {
                axios.get(v.url).catch(e => { })
            }, v.time)
        })
    }
}

export const urlModel = robot.URLS;

interface urlConfig {
    url: string,
    time: number,
}