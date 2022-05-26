import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Container} from "typedi";
import {DateTime} from "luxon";
import {AppRepository} from "../repositories/app.repository";
import {ScheduleDto} from "../domain/dto/schedule.dto";
import {Holiday} from "../models/entity/Holiday";
import {RedisClient} from "../integrations/redis-client";

/*
* This validator is responsible for checking if a given date is a holiday in the given country code
* */
@ValidatorConstraint({name: 'isHoliday', async: true})
export class IsHolidayValidator implements ValidatorConstraintInterface {
    private appRepository!: AppRepository;
    private redisClient!: RedisClient;

    constructor() {
        this.appRepository = Container.get(AppRepository); // Inject database wrapper
        this.redisClient = Container.get(RedisClient); // Inject redis client
    }

    async validate(identifier: string, args: ValidationArguments) {
        const dto: ScheduleDto = args.object as ScheduleDto;
        const dateTime = DateTime.fromISO(dto.from); // parse data from string to DateTime
        const dayOfMonth: number = dateTime.day;
        const month: number = dateTime.month;
        try {

            //Check if the given date is already cached in redis
            //if it is, just return the value (holiday description) stored in redis -
            // no need going to the database.
            const redisKey = this.formatRedisKey(dto.CC, dayOfMonth, month);
            const holidayDescription = await this.isHolidayCached(redisKey);
            if (holidayDescription) {
                (args.constraints[0] as Map<string,string>).set(dto.CC,holidayDescription);
                return false;
            }

            //If key is not in database, then check against the Holiday table if the date is a holiday, by using the month, day of month and country code (CC)
            const queryString: string = `SELECT *
                                         FROM holiday
                                         WHERE day_of_month = $1 AND month = $2
                                           AND UPPER(country_code) = $3 LIMIT 1`;
            const res: [] = await this.appRepository.getRepository(Holiday).query(queryString, [dayOfMonth, month, dto.CC.toUpperCase()]);

            if (res && res.length) {
                //This means that the given date is a holiday
                //so cache the result in redis and return
                const holidayDescription = (res as any)[0]['description'];
                await this.cacheHoliday(redisKey, holidayDescription);
                (args.constraints[0] as Map<string,string>).set(dto.CC,holidayDescription);
                return false;
            }
        } catch (e) {

        }

        return true; // Allow safe passage - this is not a holiday
    }

    //generate the redis key with the desired format (eg Christmas in Nigeria is NG:25:12)
    private formatRedisKey(countryCode: string, dayOfMonth: number, month: number): string {
        return `${countryCode}:${dayOfMonth}:${month}`;
    }

    //if holiday is cached, return the holiday description else return null
    private async isHolidayCached(redisKey: string): Promise<string | null> {
        return await this.redisClient.get(redisKey);
    }

    //Cache the holiday description with the given key
    private async cacheHoliday(redisKey: string, holidayDescription: string) {
        await this.redisClient.set(redisKey, holidayDescription);
    }

//Error message displayed when a violation is made
    defaultMessage(args: ValidationArguments) {
        const dto: ScheduleDto = args.object as ScheduleDto;
        return `${dto.from} is a holiday (${(args.constraints[0] as Map<string,string>).get(dto.CC) ?? ''}) in ${dto.CC}`;
    }
}