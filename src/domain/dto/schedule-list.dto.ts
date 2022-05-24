
import {IsDefined, Validate, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import 'reflect-metadata';
import {MinArrayLengthValidator} from "../../validators/min-array-length.validator";
import {ScheduleDto} from "./schedule.dto";

export class ScheduleDtoList {
    @IsDefined()
    @ValidateNested()
    @Type(() => ScheduleDto)
    @Validate(MinArrayLengthValidator, [1], {message: "Schedules must not be empty"})
    schedules!: ScheduleDto[];
}