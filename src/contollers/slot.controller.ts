import express, {NextFunction, Request, Response} from "express";
import {SlotService} from "../service/slot.service";
import {Container} from "typedi";
import {plainToInstance} from "class-transformer";
import {ScheduleDtoList} from "../domain/dto/schedule-list.dto";

export class SlotController {
    private slotService!: SlotService;

    constructor(private app: express.Application, private version: string = 'v1', private prefix: string = 'api') {
        this.slotService = Container.get(SlotService);
    }

    register() {
        this.app.post(`/${this.prefix}/${this.version}/get-slots`, async (req: Request, res: Response, next: NextFunction) => {
            const dto: ScheduleDtoList = (plainToInstance(ScheduleDtoList, req.body));
            const slotService: SlotService = Container.get(SlotService);
            const availableSlots = await slotService.getSlots(dto.schedules);
            return res.status(200).json(availableSlots && availableSlots.length ? availableSlots : 'There are no available meeting slots');
        });

        return this.app;
    }
}