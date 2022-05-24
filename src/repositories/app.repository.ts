import {Inject, Service} from "typedi";
import "reflect-metadata";
import {DataSource, Repository} from "typeorm";
import {Constants} from "../constants/constants";

@Service()
export class AppRepository {

    constructor(@Inject(Constants.DB_CONNECTION) private _connection: DataSource) {

    }

    get connection(): DataSource {
        return <DataSource>this._connection;
    }

    getRepository(klass:any):Repository<any>{
        return this.connection.getRepository(klass);
    }

    async close() {
        if (this._connection) {
            await this._connection.close();
        }
    }

}