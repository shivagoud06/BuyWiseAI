import { LAPTOPS } from "../src/data/laptops";

console.log("Total laptops:", LAPTOPS.length);
LAPTOPS.forEach((l, i) => {
  console.log(`${i + 1}. [${l.id}] ${l.name} -> ${l.image}`);
});
