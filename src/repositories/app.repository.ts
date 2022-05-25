import {Inject, Service} from "typedi";
import "reflect-metadata";
import {DataSource, Repository} from "typeorm";
import {Constants} from "../constants/constants";

/*
* Wrapper class used for communicating with the db.
* Exposes the database connection object
* */
@Service()
export class AppRepository {

    //Inject singleton instance
    constructor(@Inject(Constants.DB_CONNECTION) private _connection: DataSource) {

    }

    get connection(): DataSource {
        return <DataSource>this._connection;
    }

    //Creates a repository object for a given Entity class
    getRepository(klass:any):Repository<any>{
        return this.connection.getRepository(klass);
    }

    async close() {
        if (this._connection) {
            await this._connection.close();
        }
    }

}