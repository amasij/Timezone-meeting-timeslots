import express from 'express';
import {
    initializeTransactionalContext,
    patchTypeORMRepositoryWithBaseRepository
} from "typeorm-transactional-cls-hooked";
import {createConnection, DataSource} from "typeorm";
import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
import {Container} from "typedi";
import 'reflect-metadata';
import {Constants} from "./constants/constants";
import {Routes} from "./routes/routes";
import {MasterRecordLoader} from "./loaders/master-record.loader";
import {createClient, RedisClientType} from "redis";
import {HttpStatusCode} from "./domain/enums/http-status-code";


const Application = async () => {
    const app = express();
    app.use(express.json());
    const port = 4000;

    initializeTransactionalContext(); // To enable use of @Transactional() on a method when carrying out a db transaction
    if (!isTestEnvironment()) patchTypeORMRepositoryWithBaseRepository();
    await initializeDataBaseConnection().catch(); // obtain a database connection
    await initializeRedisClient().catch(); // obtain a redis server connection
    await loadMasterRecords(); // load master records from external resources to the database
    Routes.register(app); // Register application routes

    //fallback middleware to catch all application errors
    app.use((e: any, req: any, res: any, next: any) => {
        res.status(HttpStatusCode.INTERNAL_SERVER, 'An error occurred');
    });


    //Avoid port binding in test environment. Let the test framework handle it
    if (!isTestEnvironment()) {
        app.listen(port, () => {
            console.log(`The application is listening on port ${port}`);
        });
    }
    return app;
}

Application(); //LAUNCH APPLICATION

function isTestEnvironment(): boolean {
    return process.env.NODE_ENV === 'test';
}

//Acquire a database connection and register it with the DI client
async function initializeDataBaseConnection() {
    const connection: DataSource = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [
            __dirname + "/models/entity/*.ts"
        ],
        synchronize: true,
    } as PostgresConnectionOptions).catch();
    Container.set<DataSource>(Constants.DB_CONNECTION, connection); //register singleton instance with DI client
}

//load master records to database
async function loadMasterRecords() {
    await new MasterRecordLoader().load();
}

//Attempt connection with redis server and then register client instance to DI client
async function initializeRedisClient() {
    const redisClient = createClient({url: 'redis://redis-server:6379'});
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect().catch();
    Container.set<RedisClientType<any, any, any>>(Constants.REDIS_CONNECTION, redisClient);

}


export {Application};


