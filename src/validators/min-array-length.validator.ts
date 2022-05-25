import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";

/*
* This validator is responsible for checking the minimum of an array agains the desired minimum
* */
@ValidatorConstraint({name: 'MinArrayLength', async: true})
export class MinArrayLengthValidator implements ValidatorConstraintInterface{


    //Raise a flag if the array length is less than the desired length
    async validate(identifier: [], args: ValidationArguments) {
        if (!MinArrayLengthValidator.hasConstraints(args)) return true;
        return identifier.length >= args.constraints[0];
    }

    private static hasConstraints(args: ValidationArguments) {
        return args && args.constraints && args.constraints.length;
    }

    //error shown when the array length is less than the desired length
    defaultMessage(args: ValidationArguments) {
        return `${args.targetName} must have a minimum length of ${args.constraints[0]}`;
    }
}