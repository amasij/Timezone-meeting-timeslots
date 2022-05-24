import {IsDefined, Matches, Validate, ValidationArguments} from "class-validator";
import {IsHolidayValidator} from "../../validators/is-holiday.validator";
import {IsWeekendValidator} from "../../validators/is-weekend.validator";
import {Expose} from "class-transformer";

const RFC339Format = RegExp(/^([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([\+|\-]([01][0-9]|2[0-3]):[0-5][0-9]))$/);

export class ScheduleDto {
    @IsDefined({message: 'Country code ("CC") must be present'})
    @Expose()
    @Validate(IsHolidayValidator,[])
    CC!: string;

    @IsDefined({message: '"from" must be present'})
    @Expose()
    @Validate(IsWeekendValidator,[])
    @Matches(RFC339Format, {message: ((_: ValidationArguments) => `From: ${_.value} does not match RFC 3339 format`)})
    from!: string;


    @IsDefined({message: '"to" must be present'})
    @Expose()
    @Matches(RFC339Format, {message: ((_: ValidationArguments) => `To: ${_.value} does not match RFC 3339 format`)})
    to!: string;
}