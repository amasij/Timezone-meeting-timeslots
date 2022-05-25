
import {IsDefined, Validate, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import 'reflect-metadata';
import {MinArrayLengthValidator} from "../../validators/min-array-length.validator";
import {ScheduleDto} from "./schedule.dto";

/*
* Holds the list of items passed from the client (POSTMAN or Browser etc)
* */
export class ScheduleDtoList {
    @IsDefined()
    @ValidateNested() // validate individual items in the list
    @Type(() => ScheduleDto)
    @Validate(MinArrayLengthValidator, [1], {message: "Schedules must not be empty"})
    schedules!: ScheduleDto[];
}