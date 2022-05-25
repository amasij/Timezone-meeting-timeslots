import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

/*
* Entity class for the Holiday table in the database
* */
@Entity()
export class Holiday{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({name:'country_code'})
    countryCode!: string;

    @Column()
    description!: string;

    @Column({name:'day_of_month'})
    dayOfMonth!: number;

    @Column()
    month!: number;

}