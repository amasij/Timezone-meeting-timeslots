import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Container} from "typedi";
import {DateTime} from "luxon";
import {AppRepository} from "../repositories/app.repository";
import {ScheduleDto} from "../domain/dto/schedule.dto";
import {Holiday} from "../models/entity/Holiday";

@ValidatorConstraint({name: 'isHoliday', async: true})
export class IsHolidayValidator implements ValidatorConstraintInterface {
    private appRepository!: AppRepository;
    private holidayDescription!: string;

    constructor() {
        this.appRepository = Container.get(AppRepository);
    }

    async validate(identifier: string, args: ValidationArguments) {
        const dto: ScheduleDto = args.object as ScheduleDto;
        const dateTime = DateTime.fromISO(dto.from);
        const dayOfMonth: number = dateTime.day;
        const month: number = dateTime.month;
        try {

            const queryString: string = `SELECT *
                                         FROM holiday
                                         WHERE day_of_month = $1 AND month = $2
                                           AND UPPER(country_code) = $3 LIMIT 1`;
            const res: [] = await this.appRepository.getRepository(Holiday).query(queryString, [dayOfMonth, month, dto.CC.toUpperCase()]);

            if (res && res.length) {
                this.holidayDescription = (res as any)[0]['description'];
                return false;
            }
        } catch (e) {

        }
        return true;
    }


    defaultMessage(args: ValidationArguments) {
        const dto: ScheduleDto = args.object as ScheduleDto;
        return `${dto.from} is a holiday (${this.holidayDescription ?? ''}) in ${dto.CC}`;
    }
}