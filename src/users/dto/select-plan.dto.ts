// select-plan.dto.ts

import { IsEnum } from "class-validator";
import { Plans } from "../plans.enum";

export class SelectPlanDto {
  @IsEnum(Plans)
  selectedPlan: Plans;
}