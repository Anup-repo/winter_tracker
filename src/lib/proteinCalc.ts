export interface ProteinGoalOption {
  value: string
  label: string
  gramsPerKg: number
  hint: string
}

export const PROTEIN_GOALS: ProteinGoalOption[] = [
  { value: 'maintenance', label: 'General health / maintenance', gramsPerKg: 0.8, hint: '0.8 g/kg — baseline (RDA)' },
  { value: 'active', label: 'Active / general fitness', gramsPerKg: 1.2, hint: '1.2 g/kg — regular training' },
  { value: 'muscle', label: 'Muscle building / strength training', gramsPerKg: 1.8, hint: '1.6–2.2 g/kg — hypertrophy range' },
  { value: 'fatloss', label: 'Fat loss (preserve muscle)', gramsPerKg: 2.0, hint: '2.0 g/kg — higher protein while cutting' },
  { value: 'endurance', label: 'Endurance athlete', gramsPerKg: 1.4, hint: '1.4 g/kg — running/cycling focus' },
]

export function calcProteinTarget(bodyWeightKg: number, gramsPerKg: number): number {
  return Math.round(bodyWeightKg * gramsPerKg)
}
