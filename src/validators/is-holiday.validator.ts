import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Container} from "typedi";
import {DateTime} from "luxon";
import {AppRepository} from "../repositories/app.repository";
import {ScheduleDto} from "../domain/dto/schedule.dto";
import {Holiday} from "../models/entity/Holiday";
import {RedisClient} from "../integrations/redis-client";

@ValidatorConstraint({name: 'isHoliday', async: true})
export class IsHolidayValidator implements ValidatorConstraintInterface {
    private appRepository!: AppRepository;
    private redisClient!: RedisClient;
    private holidayDescription!: string;

    constructor() {
        this.appRepository = Container.get(AppRepository);
        this.redisClient = Container.get(RedisClient);
    }

    async validate(identifier: string, args: ValidationArguments) {
        const dto: ScheduleDto = args.object as ScheduleDto;
        const dateTime = DateTime.fromISO(dto.from);
        const dayOfMonth: number = dateTime.day;
        const month: number = dateTime.month;
        try {

            const redisKey = this.formatRedisKey(dto.CC, dayOfMonth, month);
            const holidayDescription = await this.isHolidayCached(redisKey);
            if (holidayDescription) {
                this.holidayDescription = holidayDescription;
                return false;
            }

            const queryString: string = `SELECT *
                                         FROM holiday
                                         WHERE day_of_month = $1 AND month = $2
                                           AND UPPER(country_code) = $3 LIMIT 1`;
            const res: [] = await this.appRepository.getRepository(Holiday).query(queryString, [dayOfMonth, month, dto.CC.toUpperCase()]);

            if (res && res.length) {
                this.holidayDescription = (res as any)[0]['description'];
                await this.cacheHoliday(redisKey, this.holidayDescription);
                return false;
            }
        } catch (e) {

        }
        return true;
    }

    private formatRedisKey(countryCode: string, dayOfMonth: number, month: number): string {
        return `${countryCode}:${dayOfMonth}:${month}`;
    }

    private async isHolidayCached(redisKey: string): Promise<string | null> {
        return await this.redisClient.get(redisKey);
    }

    private async cacheHoliday(redisKey: string, holidayDescription: string) {
        await this.redisClient.set(redisKey, holidayDescription);
    }


    defaultMessage(args: ValidationArguments) {
        const dto: ScheduleDto = args.object as ScheduleDto;
        return `${dto.from} is a holiday (${this.holidayDescription ?? ''}) in ${dto.CC}`;
    }
}