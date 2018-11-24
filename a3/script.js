$(document).ready(function() {

    var table = $('<table>');
    table.attr('id', 'minesweeperTable');

    let totalSeconds = 0; // for timer
    let minesCount = 0;
    let markedMineCount = 0;
    var timer = false;
    var gameStarted = false;
    var scores = [];
    if (localStorage.getItem("scores")) {
        scores = JSON.parse(localStorage.getItem("scores"));
    }

    $('#newGameButton').click(function() {

        if (gameStarted) { // if new game, call endGame()
            endGame(false);
        }
        
        minesCount = 0;
        markedMineCount = 0;

        gameStarted = true;

        $('#minesweeperTable').html(''); // resets table

        // timer
        document.getElementById("timer").innerHTML = ("0 minutes & 0 seconds");
        timer = setInterval(countTimer, 1000);

        var rows = $("#numOfRows").val(); // gets & sets # of rows
        var cols = $("#numOfCols").val(); // gets & sets # of columns
        var mines = $("#numOfMines").val(); // gets & sets # of mines

        if (rows >= 8 && rows < 30 && cols >= 8 && cols <= 40) {
            if (mines >= 1 && mines <= (rows * cols) - 1) {
            // check to make sure input data is within parameters

                for (var rowCount = 0; rowCount < rows; rowCount++) {
                    var newRow = $('<tr>');

                    for (var colCount = 0; colCount < cols; colCount++) {
                        var newCol = $('<td>');
                        newCol.attr('id', `${rowCount}_${colCount}`);
                        newRow.append(newCol);
                    }

                    table.append(newRow); // creates table

                }
            }

        }
        
        $("#table").append(table); // appends table

        $('td').click(function(event) { // when user clicks on a cell
            var targetCol = $(this).index();
            var targetRow = $(this).parent().index();
            var targetCell = $(this);
            
            if (targetCell.hasClass("clicked")) {
                return;
            }
            
            console.log(targetCell);

            if (event.shiftKey) { // if left click + shift key down
                if (!targetCell.hasClass("markedMine")) { // if cell isn't marked as a mine, mark the cell
                    targetCell.addClass("markedMine");
                    targetCell.css("background-color", "black");
                    markedMineCount++; // increase marked mine counter
                    numOfMinesLeft(markedMineCount);
                } else { // if cell is already marked as mine, unmark the cell
                    targetCell.removeClass("markedMine");
                    targetCell.css("background-color", "lightpink");
                    markedMineCount--;
                    numOfMinesLeft(markedMineCount);
                }
            } else { // no shift key
                if (!targetCell.hasClass("markedMine")) { // if cell is not marked, click!
                    targetCell.addClass("clicked");
                    if (targetCell.hasClass("hasMine")) { // if didn't shift key down & clicked cell has a mine
                        endGame(false);
                    } else if (targetCell.hasClass("hasAdjMine")) {
                        var adjMines = parseInt(targetCell.html());
                        var numAdjMarked = findMarkedMines(targetCell, targetRow, targetCol);
                        if (adjMines == numAdjMarked) {
                            clickAdjCells(targetRow, targetCol);
                        }
                    } else { // if didn't shift key down & clicked cell doesn't have a mine
                        findAdjMineCount(targetCell, targetRow, targetCol);

                        targetCell.addClass("hasAdjMine");
                        targetCell.css("background-color", "rgb(255, 224, 229)");
                    }
                }
                if ($(".clicked").length == ((rows*cols) - mines) && gameStarted)  {
                    endGame(true);
                }
            }
        });

        placeMines(mines); document.getElementById("minesLeft").innerHTML = ("Number of mines left: " + minesCount);

    });
    
    function findMarkedMines(targetCell, targetRow, targetCol) {
        let numAdjMarked = 0;
        for (var rowCount = 1; rowCount >= -1; rowCount--) {
            for (var colCount = 1; colCount >= -1; colCount--) {
                var adjCell = $('#' + (targetRow - rowCount) + '_' + (targetCol -   colCount)); // find all adjacent cells

                if (adjCell.hasClass("markedMine")) {
                    numAdjMarked++; // if adjacent cell has mine, increase mine counter
                }
            }
        }
        return numAdjMarked;
    }
    
    function findAdjMineCount(targetCell, targetRow, targetCol) {
        let adjMineCount = 0;
        for (var rowCount = 1; rowCount >= -1; rowCount--) {
            for (var colCount = 1; colCount >= -1; colCount--) {
                var adjCell = $('#' + (targetRow - rowCount) + '_' + (targetCol -   colCount)); // find all adjacent cells

                if (adjCell.hasClass("hasMine")) {
                    adjMineCount++; // if adjacent cell has mine, increase mine counter
                }
            }
        }

        if (adjMineCount != 0) { // if cell has adj mines
            targetCell.html(adjMineCount); // show number of adjacent mines on clicked cell
        } else { // if cell has no adj mines
            clickAdjCells(targetRow, targetCol);
            // click all adj cells // recursive!
        }
    }

    function clickAdjCells(targetRow, targetCol) {
        for (var rowCount = 1; rowCount >= -1; rowCount--) {
            for (var colCount = 1; colCount >= -1; colCount--) {
                if (rowCount == 0 && colCount == 0) {
                    continue;
                }
                var adjCell = $('#' + (targetRow - rowCount) + '_' + (targetCol - colCount));
                if (!adjCell.hasClass("clicked")) {
                    adjCell.click();
                }

            }
        }
    }

    function placeMines(mines) { // randomly adds mines to cells
        while (minesCount < mines) {
            var randomRow = Math.floor(Math.random() * (parseInt($("#numOfRows").val())));
            var randomCol = parseInt(Math.floor(Math.random() * ($("#numOfCols").val())));
            var randomCell = $('#' + randomRow + '_' + randomCol);

            if (!randomCell.hasClass("hasMine")) {
                randomCell.addClass("hasMine");
                minesCount++;
            }
        }
    }

    function countTimer() {
        ++totalSeconds;
        var hour = Math.floor(totalSeconds / 3600);
        var minute = Math.floor((totalSeconds - hour * 3600) / 60);
        var seconds = totalSeconds - (hour * 3600 + minute * 60);

        document.getElementById("timer").innerHTML = minute + " minutes & " + seconds + " seconds";
    }

    function numOfMinesLeft(numOfMarkedMines) {
        var minesLeft = minesCount - numOfMarkedMines;
        document.getElementById("minesLeft").innerHTML = "Number of mines left: " + minesLeft;
    }

    function endGame(win) {
        gameStarted = false;
        if (win == true) {
            highScore(totalSeconds);
        }
        totalSeconds = 0;
        clearInterval(timer);
        timer = false;
        $(".hasMine").css("background-color", "red");
        minesCount = 0;
    }
    
    function highScore(totalTime) {
        scores.push(totalTime);
        scores.sort(function(a, b) {return a-b});
        localStorage.setItem("scores", JSON.stringify(scores)); // convert back to array when get
        var scoreList = $("#highscore ol");
        scoreList.empty();
        var numScores = Math.min(scores.length, 10);
        for (var i = 0; i < numScores; i++) {
            var item = $("<li>");
            console.log(typeof scores[i] + ", " + scores[i]);
            item.append(scores[i]);
            scoreList.append(item);
        }
    }


});