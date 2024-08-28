import { getWater } from "../../dom";
import { FishAPI } from "./initializeFish";

export function initializePlayerGun({ fish }: { fish: FishAPI[] }) {
  const waterElement = getWater();

  function onClick(event: MouseEvent) {
    // TODO
  }

  waterElement.addEventListener("click", onClick);

  return function destroy() {
    waterElement.removeEventListener("click", onClick);
  };
}
