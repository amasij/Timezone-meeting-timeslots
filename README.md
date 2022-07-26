
The project takes a list of schedules from different (possibly from different timezones aswell) and returns a list of available meeting slots in UTC format

## Installations and prerequisites

Make sure you have these installed on your system before you run the project. Although only `docker` is needed, to run in `docker` container. Where no version is specified, latest is fine to use.
- `Postgres 12`
- `Redis`
- `Node`
- `Docker`

**NOTE**: When running locally, make sure you add your postgres credentials in the `.env` file located in the root of the project (I commited my `.env` file to git just for this submission process and to make this process eaiser for the tester **(would not fly in production)**)
<br>
## Running the project
The project can be ran through `docker` (You must have `docker` installed in your environment) and on your local machine (`Node `must be installed).

The commands should be ran sequentially

 **Docker**
```
docker-compose build
docker-compose up

//tearing down container and volumes
docker-compose down 
docker rm -f $(docker ps -a -q)
docker volume rm $(docker volume ls -q)
``` 

**Your local machine**
```
npm install
npm run local
```
<br>

## Runnin the test cases
NOTE: Please before running the test, run the project at leaset once to load all the holidays into the database This is as a result of my inability to mock the database in the test environment (But this won't fly in production)
```
npm test
```


## Consuming the API
Pass the list of schedules to the `get-slots` api to get the list of available slots. For example: 

```
curl -X POST -H "Content-Type: application/json" \
    -d '{
    "schedules": [
    {
        "from": "2022-12-25T09:00:00.0+01:00",
        "to": "2022-12-25T17:00:00.0+01:00",
        "CC": "NG"
    },
   
{
        "from": "2022-12-25T09:00:00.0+08:00",
        "to": "2022-12-25T17:00:00.0+08:00",
        "CC": "SG"
    }
    ,
    {
        "from": "2022-12-25T09:00:00.0+05:30",
        "to": "2022-25-25T17:00:00.0+05:30",
        "CC": "IN"
    }
]
}' \http://localhost:4000/api/v1/get-slots

```
Response:
```
[
    {
        "isHoliday": "2022-12-25T09:00:00.0+01:00 is a holiday (Christmas Day) in NG"
    },
    {
        "isWeekend": "2022-12-25T09:00:00.0+01:00 is a weekend"
    },
    {
        "isHoliday": "2022-12-25T09:00:00.0+08:00 is a holiday (Christmas Day) in SG"
    },
    {
        "isWeekend": "2022-12-25T09:00:00.0+08:00 is a weekend"
    },
    {
        "isHoliday": "2022-12-25T09:00:00.0+05:30 is a holiday (Christmas Day / क्रिसमस) in IN"
    },
    {
        "isWeekend": "2022-12-25T09:00:00.0+05:30 is a weekend"
    },
    {
        "matches": "To: 2022-25-25T17:00:00.0+05:30 does not match RFC 3339 format"
    }
]
```

## Extenal libraries used

- `luxon` - This is is successor to moment.js and was used to handle date manupulations (i.e Adding hours, subtracting minutes etc) and date parsing (i.e converting string to a DateTime object).
- `postgres` - This was uses as a postgres driver. Used to make connection and run queries for the postgres database.
- `typedi` - This was used to handle dependency injection of services and singleton objects.
- `typeorm ` - This was used as my ORM to communicate with the postgres dataset and handle automatic conversions of database rows to typescript classes. This also facilitated table creation in the database.
- `redis` - This was used as a redis driver. used to handle communication with the redis server.
- `class-validator` - This was used to facilitate request body validations on the fly.
- `jest` - This was used as the testing framwork


## Implementation Details

- I decided to use a database approach to check if the date is a holiday. The rationale behind this was that it makes caching of the data easier and discourages reliance on external APIs or services.
For day-2 operations to keep the data up-to-date, i would implement a cron job to fetch the latest data from ( https://support.google.com/business/answer/6333474?hl=en) at least once a day and store it in the db. This would be a neater solution and again minimizes reliance on external services. This wasn't implemented though, because i felt implementing the cron job was beyond the scope of the assessment.

- My appraoch to the available slot calculation was to first convert all incoming schedule dates into UTC format (This conversion automatically takes the timezone difference into account) and then run the calculations on the converted date/times and return the result in UTC format.


## Project Assumptions

- A meeting has a duration of **2 hours**
- Meetings cannot be set at the upper time frame of the schedule. eg given a time frame 9AM - 5PM, a meeting cannot be set at 5PM












