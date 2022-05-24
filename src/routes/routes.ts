import express from "express";
import {SlotController} from "../contollers/slot.controller";

export class Routes {
    static register(app: express.Application) {
        (new SlotController(app).register());
    }
}