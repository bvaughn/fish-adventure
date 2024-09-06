import { initializeSharedState } from "./game/sharedState";
import { canvas } from "./main";
import {
  runPreloadWork,
  runSetupWork,
  schedulePreloadWork,
  scheduleSetupWork,
} from "./scheduling/initialization";
import {
  Layer,
  runRenderPipeline,
  scheduleRenderWork,
} from "./scheduling/rendering";
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
import {
  AnimatedSpriteHelper,
  createAnimatedSpriteHelper,
} from "./utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { SpriteSheet } from "./utils/drawing/spritesheets/types";

const PADDING = 10;

export function showTestHarness() {
  initializeSharedState();

  canvas.clear();

  {
    let animationFrameHelpers: AnimatedSpriteHelper[];
    let npcSpriteSheet: SpriteSheet;
    let playerSpriteSheet: AnimatedFishSpriteHelper;
    let playerTurningSprite: AnimatedSpriteHelper;

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

      playerTurningSprite = createAnimatedSpriteHelper({
        frames: [
          // Swim forward
          playerSpriteSheet.spriteSheet.getSpriteInCell(2, 0),
          playerSpriteSheet.spriteSheet.getSpriteInCell(3, 0),

          // Turn around
          playerSpriteSheet.spriteSheet.getSpriteInCell(4, 0),
          playerSpriteSheet.spriteSheet.getSpriteInCell(5, 0),
          playerSpriteSheet.spriteSheet.getSpriteInCell(6, 0),
          playerSpriteSheet.spriteSheet.getSpriteInCell(7, 0),

          // Swim backward
          playerSpriteSheet.spriteSheet.getSpriteInCell(3, 1),
          playerSpriteSheet.spriteSheet.getSpriteInCell(2, 1),

          // Turn around
          playerSpriteSheet.spriteSheet.getSpriteInCell(4, 1),
          playerSpriteSheet.spriteSheet.getSpriteInCell(5, 1),
          playerSpriteSheet.spriteSheet.getSpriteInCell(6, 1),
          playerSpriteSheet.spriteSheet.getSpriteInCell(7, 1),
        ],
        framesPerSecond: 9,
        loop: true,
      });
    });

    let xPosition = 25;
    let yPosition = 25;

    scheduleRenderWork((data, canvas) => {
      canvas.fill(fromHex("#008ca7"));
      canvas.rect(0, 0, canvas.width, canvas.height);
    }, Layer.BACKGROUND_LAYER_1);

    scheduleRenderWork((data, canvas) => {
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

      canvas.drawSprite(
        playerTurningSprite.getFrame(),
        PADDING,
        yPosition + 2 * (playerSpriteSheet.size.height + PADDING)
      );

      xPosition += playerSpriteSheet.size.width + PADDING;
    }, Layer.PLAYER_LAYER);

    scheduleRenderWork((data, canvas) => {
      animationFrameHelpers.forEach((animationHelper) => {
        const sprite = animationHelper.getFrame();
        canvas.drawSprite(sprite, xPosition, yPosition);

        xPosition += sprite.width + PADDING;
      });
    }, Layer.PLAYER_LAYER_UNDERLAY);
  }

  initScheduler();
}

async function initScheduler() {
  await runPreloadWork();
  runSetupWork();
  schedule(() => {
    runRenderPipeline(canvas);
  });
  reset();
  start();
}
