import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";


@ValidatorConstraint({name: 'MinArrayLength', async: true})
export class MinArrayLengthValidator implements ValidatorConstraintInterface{


    async validate(identifier: [], args: ValidationArguments) {
        if (!MinArrayLengthValidator.hasConstraints(args)) return true;
        return identifier.length >= args.constraints[0];
    }

    private static hasConstraints(args: ValidationArguments) {
        return args && args.constraints && args.constraints.length;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.targetName} must have a minimum length of ${args.constraints[0]}`;
    }
}