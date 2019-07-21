const successResult = 'success!';
const failResult = 'fail!';
const successModifier = 'result--success';
const start = document.querySelector('.start');
const result = document.querySelector('.result');
const fieldElement = document.querySelector('.field');
const cellsElements = document.querySelectorAll('.field__cell');
const pieceElement = document.querySelector('.piece');
const directionNames = ['up', 'right', 'down', 'left'];
let stepper;

class Field {
  constructor() {
    this.field = fieldElement;
    this.cells = cellsElements;
    this.opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
  }

  onTheSameRow(current, next) {
    return (current - (current % 10)) / 10 === (next - (next % 10)) / 10;
  }

  findNextCell(currentIndex, direction) {
    let nextIndex = currentIndex;

    switch (direction) {
      case 'up':
        nextIndex = currentIndex - 10;
        if (nextIndex < 0) {
          nextIndex = -1;
        }
        break;

      case 'right':
        nextIndex = currentIndex + 1;
        if (!this.onTheSameRow(currentIndex, nextIndex)) {
          nextIndex = -1;
        }
        break;

      case 'down':
        nextIndex = currentIndex + 10;
        if (nextIndex > 100) {
          nextIndex = -1;
        }
        break;

      case 'left':
        nextIndex = currentIndex - 1;
        if (!this.onTheSameRow(currentIndex, nextIndex)) {
          nextIndex = -1;
        }
        break;

      default:
        nextIndex = -1;
        break;
    }

    return this.cells[nextIndex];
  }

  isTheWallThere(position, direction) {
    let cellIndex = position.top * 10 + position.left;
    let cell = this.cells[cellIndex];
    let nextCell = this.findNextCell(cellIndex, direction);

    return (
      cell.classList.toString().indexOf(direction) !== -1 ||
      typeof nextCell === 'undefined' ||
      nextCell.classList.toString().indexOf(this.opposites[direction]) !== -1
    );
  }
}

function createPiece() {
  let field = new Field();

  let rotatePiece = direction => {
    let dir = direction;
    moves.unshift(function() {
      pieceElement.style.transform = 'rotate(' + dir * 90 + 'deg)';
    });
  };

  let movePiece = position => {
    let top = position.top * 50;
    let left = position.left * 50;

    moves.unshift(function() {
      pieceElement.style.top = top + 'px';
      pieceElement.style.left = left + 'px';
    });
  };

  // let isPieceOut = () => {
  //   return (
  //     pieceElement.style.top === '450px' && pieceElement.style.left === '0px'
  //   );
  // };

  /**
   * Checkout README.md for additional info
   */
  let isPieceOut = () => {
    return position.left * 50 === 0 && position.top * 50 === 450;
  };

  let direction = Math.floor(Math.random() * directionNames.length);
  let stepsCount = 0;
  let turnsCount = 0;
  let moves = [];
  let position = {
    left: Math.floor(Math.random() * 10),
    top: Math.floor(Math.random() * 10)
  };

  let piecePublicApi = {
    isThereWay() {
      const isTheWallThere = field.isTheWallThere(
        position,
        directionNames[direction]
      );
      return !isTheWallThere;
    },

    turnLeft() {
      turnsCount += 1;
      direction -= 1;
      direction = direction < 0 ? 3 : direction;
      rotatePiece(direction);
    },

    turnRight() {
      turnsCount += 1;
      direction += 1;
      direction = direction > 3 ? 0 : direction;
      rotatePiece(direction);
    },

    goForward() {
      stepsCount += 1;
      if (!this.isThereWay()) {
        return false;
      }

      switch (direction) {
        case 0:
          position.top -= 1;
          break;
        case 1:
          position.left += 1;
          break;
        case 2:
          position.top += 1;
          break;
        case 3:
          position.left -= 1;
          break;
        default:
          return false;
      }

      movePiece(position);
    },
    amIFree() {
      return isPieceOut();
    }
  };

  stepper = setInterval(() => {
    let nextMove = moves.pop();

    if (typeof nextMove === 'function') {
      nextMove();
    } else {
      let success = isPieceOut();

      if (success) {
        result.textContent = successResult;
        result.classList.add(successModifier);
      } else {
        result.textContent = failResult;
        result.classList.remove(successModifier);
      }

      clearInterval(stepper);
      console.log({ stepsCount, turnsCount });
    }
  }, 200);

  pieceElement.style.top = position.top * 50 + 'px';
  pieceElement.style.left = position.left * 50 + 'px';
  pieceElement.style.transform = 'rotate(' + direction * 90 + 'deg)';
  pieceElement.style.display = 'block';

  return piecePublicApi;
}

function resetField() {
  clearInterval(stepper);
  result.textContent = '';
  result.classList.remove(successModifier);
}

function escapePlan() {
  const piece = createPiece();

  let method = 'turnRight',
    count;

  while (!piece.amIFree()) {
    if (piece.isThereWay()) {
      piece.goForward();
    } else {
      count = 0;

      while (!piece.isThereWay()) {
        piece[method]();
        count++;
      }

      if (count === 2) {
        piece[method]();

        method = 'turnLeft';
      }
    }
  }
}

function main() {
  resetField();
  escapePlan();
}

start.addEventListener('click', main);