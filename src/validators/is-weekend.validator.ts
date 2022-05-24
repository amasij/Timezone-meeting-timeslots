import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {ScheduleDto} from "../domain/dto/schedule.dto";
import {DateTime} from "luxon";

@ValidatorConstraint({name: 'isWeekend', async: true})
export class IsWeekendValidator implements ValidatorConstraintInterface {

    async validate(identifier: string, args: ValidationArguments) {
        const dto: ScheduleDto = args.object as ScheduleDto;
        const dateTime = DateTime.fromISO(dto.from);
        return !IsWeekendValidator.isWeekend(dateTime);
    }

    private static isWeekend(dateTime: DateTime): boolean {
        const [saturday, sunday] = [6, 7];
        return (dateTime.weekday == saturday) || (dateTime.weekday == sunday);
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.value} is a weekend`;
    }
}