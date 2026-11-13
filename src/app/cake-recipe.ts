export const flavors = [
  { name: "Ube", sponge: "#88589a", icing: "#c895ce", filling: "#b179ba", garnish: "ube" },
  { name: "Dark chocolate", sponge: "#47261d", icing: "#69392c", filling: "#8d5642", garnish: "chocolate" },
  { name: "Mango", sponge: "#db974a", icing: "#eaa74c", filling: "#efbb63", garnish: "mango" },
  { name: "Matcha", sponge: "#72804a", icing: "#8d9d57", filling: "#a5ac72", garnish: "matcha" },
  { name: "Vanilla", sponge: "#d5a36c", icing: "#efe1c6", filling: "#f6e1be", garnish: "vanilla" },
  { name: "Strawberry", sponge: "#bf6875", icing: "#e698a3", filling: "#d86275", garnish: "strawberry" },
] as const;

export type Flavor = typeof flavors[number];
export type CakeRecipe = { formation: "triangle" | "stack"; flavors: (number | null)[] };

export function cakeFormationLabel(recipe: CakeRecipe) {
  return recipe.formation === "triangle" ? "6-slice Triangle wheel" : `${recipe.flavors.length}-layer Stack`;
}
