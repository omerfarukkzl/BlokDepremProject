import { IsNotEmpty, IsObject, ValidatorConstraint, ValidatorConstraintInterface, Validate } from 'class-validator';

@ValidatorConstraint({ name: 'NonNegativeIntegers', async: false })
export class NonNegativeIntegersConstraint implements ValidatorConstraintInterface {
  validate(quantities: Record<string, number>): boolean {
    if (!quantities || typeof quantities !== 'object') {
      return false;
    }
    return Object.values(quantities).every(
      (value) => typeof value === 'number' && Number.isInteger(value) && value >= 0,
    );
  }

  defaultMessage(): string {
    return 'All quantities must be non-negative integers';
  }
}

export class ConfirmDeliveryDto {
  @IsNotEmpty()
  @IsObject()
  @Validate(NonNegativeIntegersConstraint)
  actual_quantities: Record<string, number>;
  // Example: { tent: 145, container: 48, food_package: 990, blanket: 495 }
}
