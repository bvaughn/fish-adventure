export type LeftRight = "left" | "right";
export type UpDown = "up" | "down";
export type OnChange = (
  leftRight: LeftRight | null,
  upDown: UpDown | null
) => void;

export function arrowKeyWatcher(onChange: OnChange) {
  const leftRightKeyStack = new Array<LeftRight>();
  const upDownKeyStack = new Array<UpDown>();

  function onBlur() {
    leftRightKeyStack.splice(0);
    upDownKeyStack.splice(0);
    callOnChange();
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
      case "s":
      case "S": {
        if (addToStack<UpDown>("down", upDownKeyStack)) {
          callOnChange();
        }
        event.preventDefault();
        break;
      }
      case "ArrowLeft":
      case "a":
      case "A": {
        if (addToStack<LeftRight>("left", leftRightKeyStack)) {
          callOnChange();
        }
        event.preventDefault();
        break;
      }
      case "ArrowRight":
      case "d":
      case "D": {
        if (addToStack<LeftRight>("right", leftRightKeyStack)) {
          callOnChange();
        }
        event.preventDefault();
        break;
      }
      case "ArrowUp":
      case "w":
      case "W": {
        if (addToStack<UpDown>("up", upDownKeyStack)) {
          callOnChange();
        }
        event.preventDefault();
        break;
      }
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
      case "s":
      case "S": {
        if (removeFromStack<UpDown>("down", upDownKeyStack)) {
          callOnChange();
        }
        event.preventDefault();
        break;
      }
      case "ArrowLeft":
      case "a":
      case "A": {
        if (removeFromStack<LeftRight>("left", leftRightKeyStack)) {
          callOnChange();
        }
        event.preventDefault();
        break;
      }
      case "ArrowRight":
      case "d":
      case "D": {
        if (removeFromStack<LeftRight>("right", leftRightKeyStack)) {
          callOnChange();
        }
        event.preventDefault();
        break;
      }
      case "ArrowUp":
      case "w":
      case "W": {
        if (removeFromStack<UpDown>("up", upDownKeyStack)) {
          callOnChange();
        }
        event.preventDefault();
        break;
      }
    }
  }

  function addToStack<Type>(value: Type, stack: Type[]) {
    if (!stack.includes(value)) {
      stack.push(value);
      return true;
    }
    return false;
  }

  function callOnChange() {
    onChange(
      leftRightKeyStack[leftRightKeyStack.length - 1] || null,
      upDownKeyStack[upDownKeyStack.length - 1] || null
    );
  }

  function removeFromStack<Type>(value: Type, stack: Type[]) {
    const index = stack.indexOf(value);
    if (index >= 0) {
      stack.splice(index, 1);
      return true;
    }
    return false;
  }

  window.addEventListener("blur", onBlur);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return function destroy() {
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}
