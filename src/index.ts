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


const Application = async () => {
    const app = express();
    let server;
    app.use(express.json());
    const port = 4000;

    initializeTransactionalContext();
    if (!isTestEnvironment()) patchTypeORMRepositoryWithBaseRepository();
    await initializeDataBaseConnection().catch();
    Routes.register(app);

    app.use((e: any, req: any, res: any, next: any) => {
        res.status(500, 'An error occurred');
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

export {Application};


