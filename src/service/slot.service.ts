import {Service} from "typedi";
import {DateTime} from "luxon";
import {Slot} from "../models/slot.model";
import {ScheduleDto} from "../domain/dto/schedule.dto";

@Service()
export class SlotService {
    constructor() {
    }

    public async getSlots(schedules: ScheduleDto[]): Promise<Slot[]> {
        let fromMap = SlotService.searchFrom(schedules);

        let fromArr = [];

        for (let x of fromMap.keys()) {
            if (fromMap.get(x) == schedules.length) {
                fromArr.push(x);
            }
        }

        let resultArr: DateTime[][] = [];
        let printArr = [];
        for (let s = 0; s < schedules.length; s++) {
            const tempArr = [];
            const printTemp = [];
            for (let i = 0; i < fromArr.length; i++) {
                const slot = DateTime.fromISO(schedules[s].from).toUTC().plus({hour: fromArr[i]}).toUTC();
                tempArr.push(slot);
                printTemp.push(slot.toString());
            }
            resultArr.push(tempArr);
            // printArr.push(printTemp);
        }
        // console.log(printArr)

        let availableSlots: DateTime[] = [];
        for (let i = 0; i < resultArr[0].length; i++) {
            const hour = resultArr[0][i].hour;
            let isCommon = true;
            for (let k = 1; k < resultArr.length; k++) {
                isCommon = (resultArr[k].map(x => x.hour).includes(hour));
                if (!isCommon) {
                    break;
                }
            }
            if (isCommon) {
                availableSlots.push(resultArr[0][i]);
            }
        }
        return availableSlots.map(x => {
            const from = x.toString();
            const to = x.plus({hour: 2}).toString();
            return new Slot(from, to);
        });
    }

    private static searchFrom(schedules: ScheduleDto[]): Map<number, number> {
        let hourMap = new Map<number, number>();
        for (let i = 0; i < 24; i++) {
            let originalTimeFrom = DateTime.fromISO(schedules[0].from).toUTC();
            let originalTimeTo = DateTime.fromISO(schedules[0].to).toUTC();
            let newTime = DateTime.fromISO(schedules[0].from).plus({hour: i}).toUTC();
            if (SlotService.inRange(newTime, originalTimeFrom, originalTimeTo)) {
                hourMap.set(i, 1)
            } else {
                continue
            }

            for (let j = 1; j < schedules.length; j++) {
                let newTime = DateTime.fromISO(schedules[j].from).plus({hour: i}).toUTC()
                let originalTimeFrom = DateTime.fromISO(schedules[j].from).toUTC();
                let originalTimeTo = DateTime.fromISO(schedules[j].to).toUTC();
                if (SlotService.inRange(newTime, originalTimeFrom, originalTimeTo)) {
                    hourMap.set(i, (hourMap.get(i) ?? 0) + 1);
                }
            }
        }
        return hourMap;
    }


    private static inRange(newTime: DateTime, originalTimeFrom: DateTime, originalTimeTo: DateTime): boolean {
        return (newTime.toUTC().toMillis() >= originalTimeFrom.toUTC().toMillis() && newTime.toUTC().toMillis() < originalTimeTo.toUTC().toMillis());
    }

}