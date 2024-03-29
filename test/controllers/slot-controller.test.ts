import request from 'supertest';

import {Express} from "express";
import http from "http";
import {Application} from "../../src";
import {HttpStatusCode} from "../../src/domain/enums/http-status-code";

let server: http.Server | Express;
const url:string = '/api/v1/get-slots';

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    server = await Application();
});


describe('GET available slots', () => {

    it('should return available slots ', done => {
        request(server)
            .post(url)
            .send({
                schedules: [
                    {
                        "from": "2022-12-01T09:00:00.0+01:00",
                        "to": "2022-12-01T17:00:00.0+01:00",
                        "CC": "NG"
                    },
                    {
                        "from": "2022-12-01T09:00:00.0+08:00",
                        "to": "2022-12-01T17:00:00.0+08:00",
                        "CC": "SG"
                    },
                ]
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(HttpStatusCode.OK)
            .end((err, res) => {
                if (err) return done(err)
                expect(res.body).toBeInstanceOf(Array);
                expect((res.body as []).length).toBeGreaterThan(0);
                expect(res.body).toMatchObject([{
                    "from": "2022-12-01T08:00:00.000Z",
                    "to": "2022-12-01T10:00:00.000Z"
                }]);
                done();
            });
    });

    it('should return no available slots ', done => {
        request(server)
            .post(url)
            .send({
                schedules: [
                    {
                        "from": "2022-12-01T09:00:00.0+01:00",
                        "to": "2022-12-01T17:00:00.0+01:00",
                        "CC": "NG"
                    },
                    {
                        "from": "2022-12-01T09:00:00.0+08:00",
                        "to": "2022-12-01T12:00:00.0+08:00",
                        "CC": "SG"
                    },
                ]
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(HttpStatusCode.OK)
            .end((err, res) => {
                if (err) return done(err)
                expect(res.body).toEqual('There are no available meeting slots');
                done();
            });
    });

    it('should notify that date is a weekend ', done => {
        const weekend: string = '2022-05-29'; //SUNDAY
        request(server)
            .post(url)
            .send({
                schedules: [
                    {
                        "from": `${weekend}T09:00:00.0+01:00`,
                        "to": `${weekend}T17:00:00.0+01:00`,
                        "CC": "NG"
                    },
                    {
                        "from": `${weekend}T09:00:00.0+08:00`,
                        "to": `${weekend}T17:00:00.0+08:00`,
                        "CC": "SG"
                    },
                ]
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(HttpStatusCode.BAD_REQUEST)
            .end((err, res) => {
                if (err) return done(err)
                expect(res.body).toBeInstanceOf(Array);
                expect((res.body as []).length).toBe(2);
                expect((res.body as Array<any>)[0]).toMatchObject({"isWeekend": `${weekend}T09:00:00.0+01:00 is a weekend`});
                done();
            });
    });

    it('should catch invalid  RFC 3339 format  ', done => {
        const invalidFormat: string = '2022-12-001T107:00:00.0+01:00';
        request(server)
            .post(url)
            .send({
                schedules: [
                    {
                        "from": "2022-12-01T09:00:00.0+01:00",
                        "to": invalidFormat,
                        "CC": "NG"
                    },
                    {
                        "from": "2022-12-01T09:00:00.0+08:00",
                        "to": "2022-12-01T17:00:00.0+08:00",
                        "CC": "SG"
                    },
                ]
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(HttpStatusCode.BAD_REQUEST)
            .end((err, res) => {
                if (err) return done(err)
                expect(res.body).toBeInstanceOf(Array);
                expect((res.body as []).length).toBeGreaterThan(0);
                expect(res.body).toMatchObject([
                    {
                        matches: `To: ${invalidFormat} does not match RFC 3339 format`
                    }
                ]);
                done();
            });
    });

    it('should notify that it is a holiday ', done => {
        const nigeriaIndependence: string = '2022-10-01'; //this date happens to be a SATURDAY also
        request(server)
            .post(url)
            .send({
                schedules: [
                    {
                        "from": `${nigeriaIndependence}T09:00:00.0+01:00`,
                        "to": `${nigeriaIndependence}T17:00:00.0+01:00`,
                        "CC": "NG"
                    },
                    {
                        "from": `2022-10-01T09:00:00.0+08:00`,
                        "to": `2022-10-01T17:00:00.0+08:00`,
                        "CC": "SG"
                    },
                ]
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(HttpStatusCode.BAD_REQUEST)
            .end((err, res) => {
                if (err) return done(err)
                expect(res.body).toBeInstanceOf(Array);
                expect((res.body as []).length).toBe(3);
                expect((res.body as Array<any>)[0]).toMatchObject({
                    isHoliday: `${nigeriaIndependence}T09:00:00.0+01:00 is a holiday (Independence Day) in NG`
                });
                expect((res.body as Array<any>)[1]).toMatchObject({
                    isWeekend: `${nigeriaIndependence}T09:00:00.0+01:00 is a weekend`
                });
                done();
            });
    });

    it('should not allow submissions of empty schedules', done => {
        request(server)
            .post(url)
            .send({
                schedules: []
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(HttpStatusCode.BAD_REQUEST)
            .end((err, res) => {
                if (err) return done(err)
                expect(res.body).toBeInstanceOf(Array);
                expect((res.body as []).length).toBe(1);
                expect((res.body as Array<any>)[0]).toEqual('Schedules must not be empty');
                done();
            });
    });

});