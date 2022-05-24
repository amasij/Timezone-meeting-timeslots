import {Inject, Service} from "typedi";
import {RedisClientType} from "redis";
import {Constants} from "../constants/constants";

/*
* A wrapper class that interfaces with the redis API
*
* only strings are being handle as per the project's needs
*
*/
@Service()
export class RedisClient {
    private EXPIRE_IN_SECONDS: number = 15780000; // equivalent to 6 months

    constructor(@Inject(Constants.REDIS_CONNECTION) private _client: RedisClientType<any, any, any>) {
    }

    public async set(key: string, value: string) {
        await this._client.set(key, value, {
            EX: this.EXPIRE_IN_SECONDS,
            NX: true
        });
    }

    public async get(key: string): Promise<string | null> {
        return await this._client.get(key);
    }
}