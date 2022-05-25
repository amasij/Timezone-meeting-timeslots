import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {ScheduleDto} from "../domain/dto/schedule.dto";
import {DateTime} from "luxon";

/*
* This validator is responsible for checking if a given date falls on a weekend
* */
@ValidatorConstraint({name: 'isWeekend', async: true})
export class IsWeekendValidator implements ValidatorConstraintInterface {

    async validate(identifier: string, args: ValidationArguments) {
        const dto: ScheduleDto = args.object as ScheduleDto;
        const dateTime = DateTime.fromISO(dto.from);
        return !IsWeekendValidator.isWeekend(dateTime);
    }

    //return true if date falls on a weekend
    private static isWeekend(dateTime: DateTime): boolean {
        const [saturday, sunday] = [6, 7]; // date constants for saturday(6) and sunday (7)
        return (dateTime.weekday == saturday) || (dateTime.weekday == sunday);
    }

    //Message returned when this is a weekend
    defaultMessage(args: ValidationArguments) {
        return `${args.value} is a weekend`;
    }
}