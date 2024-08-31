import { initBackground } from "./game/initBackground";
import { initForeground } from "./game/initForeground";
import { initNpcFish } from "./game/initNpcFish";
import { initPlayerFish } from "./game/initPlayerFish";

// Order is important because it can impact z-index

initBackground();
(["smallest", "small", "regular"] as const).forEach((size) => {
  for (let index = 0; index < 3; index++) {
    initNpcFish(size);
  }
});
initPlayerFish();
initForeground();
