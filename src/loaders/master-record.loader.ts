import {Container, Service} from "typedi";
import {Transactional} from "typeorm-transactional-cls-hooked";
import {AppRepository} from "../repositories/app.repository";
import {Holiday} from "../models/entity/Holiday";

const holidayJSON = require('../resources/holiday.json');

/*
* Loads resources from external sources (e.g JSON file)  into the database
* */

@Service()
export class MasterRecordLoader {
    private appRepository: AppRepository = Container.get(AppRepository); //inject database wrapper class

    constructor() {
        return this;
    }

    public async load() {
        // Checks if the table already has data (i.e number of rows = 0 )
        //If there are items in the table the loading process is skipped
        // This prevents the records from being loaded on every startup
        if (await this.appRepository.getRepository(Holiday).count() == 0) {
            await this.loadHolidays();
        }
    }

    //Load all holidays from the json file into the Holiday table in the database
    @Transactional() // enables automatic commits and roll-back
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
        await this.appRepository.getRepository(Holiday).save(holidays); //save all the holidays in the db and commit
        console.log('<=================== Holidays Loaded ===================>')
    }
}

interface IHoliday {
    countryCode: string;
    holidays: { date: string; description: string }[]
}