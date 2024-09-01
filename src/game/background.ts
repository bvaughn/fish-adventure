import { BACKGROUND_LAYER_1, registerDraw } from "../drawing";
import { fromHex } from "../utils/drawing/Color";

export function initBackground() {
  registerDraw((data, canvas) => {
    canvas.fill(fromHex("#008ca7"));
    canvas.rect(0, 0, canvas.width, canvas.height);
  }, BACKGROUND_LAYER_1);
}
