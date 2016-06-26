window.onload = init;

function init() {
	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;

	model.generateShipLocations();
};
// при нажатии на кнопку fire
function handleFireButton() {
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value;
	controller.processGues(guess);
	guessInput.value = "";
};
// при нажатии на enter в input
function handleKeyPress(e) {
	var fireButton = document.getElementById("fireButton");
	if (e.keyCode === 13) {
		fireButton.click();
		return false;
	}
};
// парсим выстрел в числа
function parseGuess(guess) {
	var alphabet = ["A","B","C","D","E","F","G"];

	if (guess === null || guess.length !== 2) {
		alert("Oops, please enter a letter and a number on the board.");
	} else {
		firstChar = guess.charAt(0);
		var row = alphabet.indexOf(firstChar);
		var column = guess.charAt(1);

		if (isNaN(row) || isNaN(column)) {
			alert("Oops, that isn't on the board.");
		} else if (row<0 || row>=model.boardSize || column<0 ||
		 column>=model.boardSize) {
			alert("Oops, that's off the board!");
		} else {
			return row + column;
		}
	}
	return null;
};
// представление
var view = {
		displayMessage: function(msg) {
			var messageArea = document.getElementById("messageArea");
			messageArea.innerHTML = msg;
		},
		displayMiss: function(location) {
			var cell = document.getElementById(location);
			cell.setAttribute("class","miss");
		},
		displayHit: function(location) {
			var cell = document.getElementById(location);
			cell.setAttribute("class","hit");
		}
	};
// модель
var model = {
			boardSize: 7,
			numShips: 3,
			shipLength: 3,
			shipsSunk: 0,
			ships: [{ locations: ["0", "0", "0"], hits: ["", "", ""] },
							{ locations: ["0", "0", "0"], hits: ["", "", ""] },
							{ locations: ["0", "0", "0"], hits: ["", "", ""] }],
			// генерируем координаты кораблей
			generateShipLocations: function() {
				var locations;
				for (var i = 0; i < this.numShips; i++) {
					do {
						locations = this.generateShip();
					} while (this.collision(locations)); // пока нет уникальных координат
						this.ships[i].locations = locations;
				}
			},

			generateShip: function() {
				var direction = Math.floor(Math.random() * 2);
				var row, col;
				if (direction === 1) {
					// Сгенерировать начальную позицию для горизонтального корабля
					row = Math.floor(Math.random() * this.boardSize);
					col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
				} else {
					// Сгенерировать начальную позицию для вертикального корабля
					row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
					col = Math.floor(Math.random() * this.boardSize);
				}
				var newShipLocations = [];
				for (var i = 0; i < this.shipLength; i++) {
					if (direction === 1) {
					// добавить в массив горизонтального корабля
						newShipLocations.push(row + "" + (col + i));
					} else {
					// добавить в массив вертикального корабля
						newShipLocations.push((row + i) + "" + col);
					}
				}
				return newShipLocations;
			},
			// проверяем нет ли кораблей с такими же координатами
			collision: function(locations) {
				for (var i = 0; i < this.numShips; i++) {
					var ship = model.ships[i];
					for (var j = 0; j < locations.length; j++) {
						var location = locations[j];
						var near = this.near(location);
						if (ship.locations.indexOf(locations[j]) >= 0 || this.contrastNear(near,ship)) {
							return true;
						}
					}
				}
				return false;
			},
			// создаем массив с координатами окружения
			near: function (locations) {
				var firstLoc = parseInt(locations.charAt(0)),
						secondLoc = parseInt(locations.charAt(1));
				var LocMas = [firstLoc + 1, firstLoc - 1, secondLoc + 1, secondLoc -1];
				var near = [LocMas[1] + "" + LocMas[3],
										LocMas[1] + "" + secondLoc,
										LocMas[1] + "" + LocMas[2],
										firstLoc + "" + LocMas[3],
										firstLoc + "" + LocMas[2],
										LocMas[0] + "" + LocMas[3],
										LocMas[0] + "" + secondLoc,
										LocMas[0] + "" + LocMas[2]];

				return near;
			},
			// проверяем на совпадение координат в окружении
			contrastNear: function(near,ship) {
				for (var i = 0; i < near.length; i++) {
					if (ship.locations.indexOf(near[i]) >= 0) {
							return true;
						}
				} return false;
			},
			// выстрел
			fire: function(guess) {
				for (i=0; i<this.numShips;i++) {
					var ship = this.ships[i],
							index = ship.locations.indexOf(guess);
							if (index >= 0) {
								if (ship.hits[index] == "hit") {
									view.displayMessage("You have already shot here!");
									return true;
								}
								ship.hits[index] = "hit";
								view.displayHit(guess);
								view.displayMessage("HIT!");
								if (this.isSunk(ship)) {
									view.displayMessage("You sank my battleship!");
									this.shipsSunk++;
								}
								return true;
							}
				}
				view.displayMiss(guess);
				view.displayMessage("You are missed!");
				return false;
			},
			// проверяем потоплен ли данный корабль
			isSunk: function(ship) {
				for (var i=0; i < this.shipLength; i++) {
					if (ship.hits[i] !=="hit") {
						return false;
					}
				}
				return true;
			}
		};
// контроллер
var controller = {
			guesses: 0, // общее кол-во выстрелов

			processGues: function(guess) {
				var location = parseGuess(guess);
				if (location) {
					this.guesses++;
					var hit = model.fire(location);
					if (hit && model.shipsSunk === model.numShips) { 				// если все корабли потоплены
						view.displayMessage("You sank all my battleships, in "
						 +this.guesses+" guesses");
					}
				}
			}
		};