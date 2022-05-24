import express, {Express} from 'express';
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
import http from "http";
import {HttpStatusCode} from "./domain/enums/http-status-code";


const Application = async () => {
    const app = express();
    let server: http.Server | Express;
    app.use(express.json());
    const port = 4000;

    initializeTransactionalContext();
    if (!isTestEnvironment()) patchTypeORMRepositoryWithBaseRepository();
    await initializeDataBaseConnection().catch();
    await initializeRedisClient().catch();
    await loadMasterRecords();
    Routes.register(app);

    app.use((e: any, req: any, res: any, next: any) => {
        res.status(HttpStatusCode.INTERNAL_SERVER, 'An error occurred');
    });

    server = app;
    if (!isTestEnvironment()) {
        server = app.listen(port, () => {
            console.log(`The application is listening on port ${port}`);
        });
    }
    return server;
}

Application();

function isTestEnvironment(): boolean {
    return process.env.NODE_ENV === 'test';
}

async function initializeDataBaseConnection() {
    const connection: DataSource = await createConnection({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'admin',
        password: 'admin',
        database: 'lumitest',
        entities: [
            __dirname + "/models/entity/*.ts"
        ],
        synchronize: true,
    } as PostgresConnectionOptions).catch();

    Container.set<DataSource>(Constants.DB_CONNECTION, connection);
}

async function loadMasterRecords() {
    await new MasterRecordLoader().load();
}

async function initializeRedisClient() {
    const redisClient = createClient({url: 'redis://localhost:6379'});
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect().catch();
    Container.set<RedisClientType<any, any, any>>(Constants.REDIS_CONNECTION, redisClient);

}


export {Application};


