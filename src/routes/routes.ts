import express from "express";
import {SlotController} from "../contollers/slot.controller";

/*
* Controller classes and application routes are initialized and registered here respectively
* */
export class Routes {
    static register(app: express.Application) {
        (new SlotController(app).register());
    }
}