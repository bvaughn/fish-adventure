import { initBackground } from "./game/initBackground";
import { initNpcFish } from "./game/initNpcFish";
import { initPlayerFish } from "./game/initPlayerFish";

initBackground();

for (let index = 0; index < 3; index++) {
  initNpcFish();
}

initPlayerFish();
