import {Container, Service} from "typedi";
import {Transactional} from "typeorm-transactional-cls-hooked";
import {AppRepository} from "../repositories/app.repository";
import {Holiday} from "../models/entity/Holiday";

const holidayJSON = require('../resources/holiday.json');

@Service()
export class MasterRecordLoader {
    private appRepository: AppRepository = Container.get(AppRepository);

    constructor() {
        return this;
    }

    public async load() {
        if (await this.appRepository.getRepository(Holiday).count() == 0) {
            await this.loadHolidays();
        }
    }

    @Transactional()
    private async loadHolidays() {
        const holidays: Holiday[] = [];
        const holidayList = holidayJSON as IHoliday[];
        for (let i = 0; i < holidayList.length; i++) {
            let countryCode = holidayList[i].countryCode;
            (holidayList[i].holidays).map((item, index) => {
                const monthOffset = 1;
                let holiday: Holiday = new Holiday();
                const holidayDate = new Date(item.date);
                holiday.month = holidayDate.getMonth();
                holiday.dayOfMonth = holidayDate.getDate() + monthOffset;
                holiday.description = item.description;
                holiday.countryCode = countryCode;
                holidays.push(holiday);
            });
        }
        await this.appRepository.getRepository(Holiday).save(holidays);
        console.log('<=================== Holidays Loaded ===================>')
    }
}

interface IHoliday {
    countryCode: string;
    holidays: { date: string; description: string }[]
}