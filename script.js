let playerMatrix, compMatrix, playerName, compName;

/*
	Проверка введения данных в поля никнейм
	Начало игры при не пустых значениях
*/

function validateNames() {
	playerName = document.getElementById("nicknamePlayer").value;
	compName = document.getElementById("nicknameComp").value;

	if (playerName != "" && compName != "") {
		startGame();
	} else if (playerName == "" && compName != "") {
		document.getElementsByTagName("label")[0].style.color = 'red';
		document.getElementsByTagName("label")[1].style.color = 'blue';
	} else if (playerName != "" && compName == "") {
		document.getElementsByTagName("label")[0].style.color = 'blue';
		document.getElementsByTagName("label")[1].style.color = 'red';
	} else {
		document.getElementsByTagName("label")[0].style.color = 'red';
		document.getElementsByTagName("label")[1].style.color = 'red';
	}
}

/*
	Функция инициализации старта игры
	Добавление таблице соперника события "атаки" при нажатии
	Проверка выигрыша после попадания(иначе продолжение хода) и смена хода после промаха
	0 в массиве пустое поле
	1 лодка
	2 попадание по лодке
	3 попадание по пустому полю
*/

function startGame() {
	hideWelocme();
	playerMatrix = randomShipLocation();
	compMatrix = randomShipLocation();

	drawPlayerField(playerMatrix);
	drawCompField(compMatrix);

	document.getElementsByClassName("res")[0].innerHTML = `&#8592; ${playerName} стреляет первым`;	

	let compTable = document.getElementsByTagName("table")[1];

	for (let i = 0; i < compTable.rows.length; i++) {
		for (let j = 0; j <compTable.rows[i].cells.length; j++) {
			compTable.rows[i].cells[j].onclick = function() {
				let row = this.parentElement.rowIndex;
				let cell = this.cellIndex;

				if (compMatrix[row][cell] == 1) {
					compTable.rows[i].cells[j].textContent = "\u274C";
					compMatrix[row][cell] = 2;
					let check = checkWinning(compMatrix);
					if (check) {
						displayWinner(true);
					} else {
						document.getElementsByClassName("res")[0].innerHTML = `	&#8592; ${playerName} попал. Снова стреляет ${playerName}`;
					}
				} else if (compMatrix[row][cell] == 0) {
					compTable.rows[i].cells[j].textContent = "\u26ab";
					compMatrix[row][cell] = 3;
					document.getElementsByClassName("res")[0].innerHTML = `${playerName} промахнулся. Стреляет ${compName} &#8594;`;
					//sleep(5000);
					counterAttack();
				}
			}
		}
	}
}

/*
	Смена экрана приветствия на экран игры
*/

function hideWelocme() {
	let welcome = document.getElementsByClassName("welcomePlayer")[0];
	let battleField = document.getElementsByClassName("battlefield")[0];

	welcome.style.display = "none";
	battleField.style.display = "block";
}

/*
	Создание пустого массива массивов 10x10
*/

function createMatrix() {
	let arr = [10];

	for (let i = 0; i < 10; i++) {
		arr[i] = new Array(10).fill(0);
	}

	return arr;
}

/*
	Случайное число от 0 до n
*/

function getRandom(n) {
	return Math.floor(Math.random() * (n + 1));
}


/*
	Функция для поочередного расположения лодок в массиве
	1 четырехпалубная
	2 трехпалубных
	3 двухпаоубных
	4 однопалубных
*/

function randomShipLocation() {
	let availableShips = [
		[1, 4],
		[2, 3],
		[3, 2],
		[4, 1],
	];

	matrix = createMatrix();

	for (let i = 0; i < availableShips.length; i++) {
		let decksCount = availableShips[i][1];

		for (let j = 0; j < availableShips[i][0]; j++) {
			getShipRandomCoordinates(decksCount);
		}
	}

	return matrix;
}

/*
	Генерация случайного положения(горизонтально или вертикально) для лодки
	и последующая проверка возможности добавить её
*/

function getShipRandomCoordinates(decks) {
	let shipX = getRandom(1);
	let shipY = (shipX == 0) ? 1 : 0;
	let x, y;

	if (shipX == 0) {
		x = getRandom(9);
		y = getRandom(10 - decks);
	} else {
		x = getRandom(10 - decks);
		y = getRandom(9);
	}

	let res = validateCoordinates(x, y, shipX, shipY, decks);

	if (!res) {
		getShipRandomCoordinates(decks);
	} else {
		addShip(x, y, shipX, shipY, decks);
	}
}

/*
	Функция для проверки возможности добавления лодки в соответствии с правилами игры
*/

function validateCoordinates(x, y, shipX, shipY, decks) {
	let fromX, toX, fromY, toY;

	fromX = (x == 0) ? x : x - 1;
	if (shipX == 0 && x == 9) toX = x + 1;
	else if (shipX == 0 && x < 9) toX = x + 2;
	else if (shipX == 1 && (x + decks) == 10) toX = x + decks;
	else if (shipX == 1 && (x + decks) < 10) toX = x + decks + 1;

	fromY = (y == 0) ? y : y - 1;
	if (shipY == 0 && y == 9) toY = y + 1;
	else if (shipY == 0 && y < 9) toY = y + 2;
	else if (shipY == 1 && (y + decks) == 10) toY = y + decks;
	else if (shipY == 1 && (y + decks) < 10) toY = y + decks + 1;

	for (let i = fromX; i < toX; i++) {
		for (let j = fromY; j < toY; j++) {
			if (matrix[i][j] == 1) return false; 
		}
	}
	return true;
}

/*
	Добавление лодки в массив массивов для хранения поля
*/

function addShip(x, y, shipX, shipY, decks) {
	if (shipX) {
		for (let i = x; i < x + decks; i++) {
			matrix[i][y] = 1;
		}
	} else {
		for (let i = y; i < y + decks; i++) {
			matrix[x][i] = 1;
		}
	}
}

/*
	Функция отрисовки поля игрока
	На вход передается массив массовов содержащий расположение кораблей игрока
*/

function drawPlayerField(matrix) {
	let div = document.createElement("div");
	div.setAttribute("id", "playerDiv");
	let h = document.createElement("H1");           
	let t = document.createTextNode(playerName);     
	h.appendChild(t);
	div.appendChild(h);

	let table = document.createElement('table');

	for (let i = 0; i < matrix.length; i++) {
		let row = table.insertRow();
		for (let j = 0; j < matrix[i].length; j++) {
			let cell = row.insertCell();
			if (matrix[i][j] == 1) {
				cell.innerHTML = "<br />";
				cell.className += "ship"
			} else {
				cell.innerHTML = "<br />";
			}
		}
	}
	div.appendChild(table);

	document.getElementsByClassName("fieldPlayer")[0].appendChild(div);
}

/*
	Функция отрисовки поля компьютера
	На вход передается матрица содержащая расположение кораблей компьютера
*/

function drawCompField(matrix) {
	let div = document.createElement("div");
	div.setAttribute("id", "compDiv");
	let h = document.createElement("H1");            
	let t = document.createTextNode(compName);     
	h.appendChild(t);
	div.appendChild(h);

	let table = document.createElement('table');

	for (let i = 0; i < matrix.length; i++) {
		let row = table.insertRow();
		for (let j = 0; j < matrix[i].length; j++) {
			let cell = row.insertCell();
			if (matrix[i][j] == 1) {
				cell.innerHTML = "<br />";
			} else {
				cell.innerHTML = "<br />";
			}
		}
	}
	div.appendChild(table);

	document.getElementsByClassName("fieldComp")[0].appendChild(div);
}

/*
	Функция проверки победы
*/

function checkWinning(matrix) {
	for (var i = 0; i < matrix.length; i++) {
		for (var j = 0; j < matrix[i].length; j++) {
			if (matrix[i][j] == 1) return false;
		}
	}

	return true;
}

/*
	Отображение имени побежителя
*/

function displayWinner(isPlayerWon) {
	if (isPlayerWon) {
		document.getElementsByClassName("res")[0].innerHTML = `${playerName} победил!`;
		document.getElementsByClassName("res")[0].style.fontSize = "70px";
		document.getElementById("playerDiv").remove();
		document.getElementById("compDiv").remove();
		document.getElementById("revenge").style.display = 'inline-block';
	} else {
		document.getElementsByClassName("res")[0].innerHTML = `${compName} победил!`;
		document.getElementsByClassName("res")[0].style.fontSize = "70px";
		document.getElementById("playerDiv").remove();
		document.getElementById("compDiv").remove();
		document.getElementById("revenge").style.display = 'inline-block';
	}
}

/*
	Функция атаки компьютера
	Компьютер атакует случайную ячейку
	Проверка выигрыша после попадания(иначе продолжение хода) и смена хода после промаха
	0 в массиве пустое поле
	1 лодка
	2 попадание по лодке
	3 попадание по пустому полю
*/

function counterAttack() {
	let row = getRandom(9);
	let cell = getRandom(9);

	let playerTable = document.getElementsByTagName("table")[0];

	if (playerMatrix[row][cell] == 1) {
		playerTable.rows[row].cells[cell].textContent = "\u274C";
		playerMatrix[row][cell] = 2;
		let check = checkWinning(playerMatrix);
		if (check) {
			displayWinner(false);
		} else {
			document.getElementsByClassName("res")[0].innerHTML = `${compName} попал. Снова стреляет ${compName} &#8594;`;
		}
		counterAttack();

	} else if (playerMatrix[row][cell] == 0) {
		playerTable.rows[row].cells[cell].textContent = "\u26ab";
		playerMatrix[row][cell] = 3;
		document.getElementsByClassName("res")[0].innerHTML = `&#8592; ${compName} промахнулся. Стреляет ${playerName}`;
	} else {
		counterAttack();
	}
}

/*
	Функция для запуска новой игры для того же пользователя
*/

function revenge() {
	document.getElementById("revenge").style.display = 'none';
	document.getElementsByClassName("res")[0].style.fontSize = "40px";

	startGame();
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
