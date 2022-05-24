import {Validate} from "class-validator";
import {IsHolidayValidator} from "../../validators/is-holiday.validator";

export class ScheduleDto {
    @Validate(IsHolidayValidator, [])
    CC!: string;
    from!: string;
    to!: string;
}