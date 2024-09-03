import { canvas } from "./main";
import {
  BACKGROUND_LAYER_1,
  callRenderFunctions,
  PLAYER_LAYER,
  PLAYER_LAYER_UNDERLAY,
  registerRenderFunction,
} from "./scheduling/drawing";
import {
  runPreloadWork,
  runSetupWork,
  schedulePreloadWork,
  scheduleSetupWork,
} from "./scheduling/initialization";
import { reset, schedule, start } from "./scheduling/scheduler";
import { fromHex } from "./utils/drawing/Color";
import {
  AnimatedFishSpriteHelper,
  createAnimatedFishSpriteHelper,
} from "./utils/drawing/spritesheets/createAnimatedFishSpriteHelper";
import {
  initAnimatedNpcFishSpriteHelper,
  NPC_SPRITE_DIMENSIONS,
  preloadNpcFishSprites,
  setupNpcFishSprites,
  Variant,
} from "./utils/drawing/spritesheets/createAnimatedNpcFishSpriteHelper";
import { AnimatedSpriteHelper } from "./utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { SpriteSheet } from "./utils/drawing/spritesheets/types";

const PADDING = 10;

export function showTestHarness() {
  canvas.clear();

  {
    let animationFrameHelpers: AnimatedSpriteHelper[];
    let npcSpriteSheet: SpriteSheet;
    let playerSpriteSheet: AnimatedFishSpriteHelper;

    schedulePreloadWork(async () => {
      npcSpriteSheet = preloadNpcFishSprites();

      playerSpriteSheet = createAnimatedFishSpriteHelper({
        size: {
          width: 25,
          height: 13,
        },
        source: "/images/sprites/fish-player.gif",
      });

      initAnimatedNpcFishSpriteHelper();
    });

    scheduleSetupWork(() => {
      animationFrameHelpers = NPC_SPRITE_DIMENSIONS.map((_, index) =>
        setupNpcFishSprites((index + 1) as Variant)
      );
    });

    let xPosition = 25;
    let yPosition = 25;

    registerRenderFunction((data, canvas) => {
      canvas.fill(fromHex("#008ca7"));
      canvas.rect(0, 0, canvas.width, canvas.height);
    }, BACKGROUND_LAYER_1);

    registerRenderFunction((data, canvas) => {
      xPosition = PADDING;

      canvas.drawSprite(
        playerSpriteSheet.getSprite("forward", false),
        xPosition,
        yPosition
      );
      canvas.drawSprite(
        playerSpriteSheet.getSprite("forward", true),
        PADDING,
        yPosition + playerSpriteSheet.size.height + PADDING
      );

      xPosition += playerSpriteSheet.size.width + PADDING;
    }, PLAYER_LAYER);

    registerRenderFunction((data, canvas) => {
      animationFrameHelpers.forEach((animationHelper) => {
        const sprite = animationHelper.getFrame();
        canvas.drawSprite(sprite, xPosition, yPosition);

        xPosition += sprite.width + PADDING;
      });
    }, PLAYER_LAYER_UNDERLAY);
  }

  initScheduler();
}

async function initScheduler() {
  await runPreloadWork();
  runSetupWork();
  schedule((data) => {
    callRenderFunctions(canvas, data);
  });
  reset();
  start();
}
