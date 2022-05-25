import {Service} from "typedi";
import {DateTime} from "luxon";
import {Slot} from "../models/slot.model";
import {ScheduleDto} from "../domain/dto/schedule.dto";

@Service()
export class SlotService {
    private static NUMBER_OF_HOURS_IN_DAY: number = 24;
    private static MEETING_DURATION_IN_HOURS: number = 2;

    constructor() {
    }

    //Receive a list of schedules (timezones) and return available 2-Hour meeting slots from them
    public async getSlots(schedules: ScheduleDto[]): Promise<Slot[]> {
        let addableHourMap = SlotService.getAddableHours(schedules);

        let addableHours = [];

        //Get common addable hours for all timezones in schedule list
        for (let x of addableHourMap.keys()) {
            if (addableHourMap.get(x) == schedules.length) {
                addableHours.push(x);
            }
        }

        //Convert addable hours into DateTime objects for every timezone
        let validUTCTDateTimesPerTimezone: DateTime[][] = [];
        for (let s = 0; s < schedules.length; s++) {
            const tempArr = [];
            for (let i = 0; i < addableHours.length; i++) {
                const slot = DateTime.fromISO(schedules[s].from).toUTC().plus({hour: addableHours[i]}).toUTC();
                tempArr.push(slot);
            }
            validUTCTDateTimesPerTimezone.push(tempArr);
        }

        // find the common hour of days amidst all the valid UTC date times per timezone
        // This first item of the schedule is used as the anchor for the rest of the schedules/timezones
        let availableSlots: DateTime[] = [];
        for (let dateTime = 0; dateTime < validUTCTDateTimesPerTimezone[0].length; dateTime++) {
            const hour = validUTCTDateTimesPerTimezone[0][dateTime].hour;
            let isCommon = true;
            for (let k = 1; k < validUTCTDateTimesPerTimezone.length; k++) {
                isCommon = (validUTCTDateTimesPerTimezone[k].map(x => x.hour).includes(hour));
                if (!isCommon) {
                    //if the hour is not common for all timezones, go to the next hour and search again
                    break;
                }
            }
            if (isCommon) {
                //common hour of day is added to the available slots
                availableSlots.push(validUTCTDateTimesPerTimezone[0][dateTime]);
            }
        }

        //Add the meeting duration to every slot
        return availableSlots.map(x => {
            const from = x.toString();
            const to = x.plus({hour: SlotService.MEETING_DURATION_IN_HOURS}).toString();
            return new Slot(from, to);
        });
    }


    private static getAddableHours(schedules: ScheduleDto[]): Map<number, number> {
        let hourMap = new Map<number, number>();

        //Add all hours in a day to find out the hours that can be added to each date, that keeps it with its given range and stores it in a map
        // e.g (  "from": "2022-12-26T09:00:00.0+01:00", "to": "2022-12-26T17:00:00.0+01:00")
        // how many hours can you add to the 'from' date that keeps you within the range of 'T09:00:00' to 'T17:00:00'

        //The first schedule item is used as the anchor point for the rest of the items

        for (let hour = 0; hour < SlotService.NUMBER_OF_HOURS_IN_DAY; hour++) {
            let originalTimeFrom = DateTime.fromISO(schedules[0].from).toUTC();
            let originalTimeTo = DateTime.fromISO(schedules[0].to).toUTC();
            let newTime = DateTime.fromISO(schedules[0].from).plus({hour}).toUTC();
            if (SlotService.inRange(newTime, originalTimeFrom, originalTimeTo)) {
                hourMap.set(hour, 1)
            } else {
                //if the particular hour added is beyond the range just skip to the next hour, no need to check the other schedules
                continue
            }

            //get addable hours for the rest of the schedule items, using the same hour
            for (let j = 1; j < schedules.length; j++) {
                let newTime = DateTime.fromISO(schedules[j].from).plus({hour}).toUTC()
                let originalTimeFrom = DateTime.fromISO(schedules[j].from).toUTC();
                let originalTimeTo = DateTime.fromISO(schedules[j].to).toUTC();
                if (SlotService.inRange(newTime, originalTimeFrom, originalTimeTo)) {
                    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
                }
            }
        }
        return hourMap;
    }


    //checks if a given time is between the bounds of 'originalTimeFrom' and 'originalTimeTo'
    //e.g is 5AM between 9AM and 5PM - false
    //e.g is 10AM between 9AM and 5pm - true
    private static inRange(newTime: DateTime, originalTimeFrom: DateTime, originalTimeTo: DateTime): boolean {
        return (newTime.toUTC().toMillis() >= originalTimeFrom.toUTC().toMillis() && newTime.toUTC().toMillis() < originalTimeTo.toUTC().toMillis());
    }

}