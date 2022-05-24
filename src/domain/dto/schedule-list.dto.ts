import {IsDefined, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import 'reflect-metadata';
import {ScheduleDto} from "./schedule.dto";

export class ScheduleDtoList {
    @IsDefined()
    @ValidateNested()
    @Type(() => ScheduleDto)
    schedules!: ScheduleDto[];
}