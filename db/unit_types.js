// Registry for relevant unit types (unit types that are actually used by upgrades and advisors as targets)

export const unitTypes = []

export function addUnitType(type) {
  if (!unitTypes.includes(type)) {
    unitTypes.push(type)
  }
}
