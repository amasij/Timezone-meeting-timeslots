import {NextFunction, Request, Response} from "express";
import {plainToInstance} from "class-transformer";
import {validate, ValidationError} from "class-validator";

export class DataValidator {

    static validate(klass: any) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const output: any = plainToInstance(klass, req.body);
            const errors = await validate(output, {skipMissingProperties: true}).catch();
            const errorMessages: string[] = [];

            if (errors && errors.length) {
                for (let i = 0; i < errors.length; i++) {
                    if (errors[i] && errors[i].constraints) {
                        const constraints = (errors[i].constraints!);
                        errorMessages.push(...this.extractErrorMessages(constraints))
                    }
                    if (errors[i] && errors[i].children && errors[i].children!.length) {
                        errorMessages.push(...this.extractErrorMessages(this.filterConstraints(errors[i].children!)));
                        errors[i].children!.map(c => {
                            if (c.children && c.children.length) {
                                errorMessages.push(...this.extractErrorMessages(this.filterConstraints(c.children)));
                            }
                        });
                    }
                }
                return res.status(400).send(errorMessages);
            }
            next();
        };
    }

    private static filterConstraints(children: ValidationError[]): ({ [p: string]: string } | undefined)[] {
        return children.filter(x => x && x.constraints).map(x => x.constraints);
    }

    private static extractErrorMessages(constraints: any): string[] {
        return Object.keys(constraints).map(key => constraints[key]);
    }
}