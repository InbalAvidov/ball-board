'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/glue.png">'

var gBallCounter
var gBallAround
var gIdBall
var gIdGlue
var gIsGlue = false


// Model:
var gBoard
var gGamerPos

function onInitGame() {
    reset()
    gBoard = buildBoard()
    renderBoard(gBoard)
    gIdBall = setInterval(addBall, 4000)
    gIdGlue = setInterval(addGlue, 5000)
    // setInterval(checkVictory, 100)
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                if (i === 5 || j === 5) continue
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL

    console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {
    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }


            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    checkNegs(i, j)
    const targetCell = gBoard[i][j]

    if (gIsGlue) return
    if (targetCell.type === WALL) return
    
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    
        if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (iAbsDiff === gBoard.length - 1 && jAbsDiff === 0) || (jAbsDiff === gBoard[0].length - 1 && iAbsDiff === 0)) {
            
            if (targetCell.gameElement === BALL) {
            var audio = new Audio('sounds/eating.mp3')
            audio.play()
            gBallCounter++
            var elH2 = document.querySelector(".collected")
            elH2.innerText = `Balls collected so far : ${gBallCounter}`
            
        }  

        if (targetCell.gameElement === GLUE) {
            renderMove(i, j)
            gIsGlue = true
            setTimeout(() => {
                gIsGlue = false
            }, 3000)
        }
        renderMove(i, j)
        checkVictory()
    }

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
    
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    
    switch (event.key) {
        case 'ArrowLeft':
            if (i === 5 && j === 0) moveTo(5, 11)
            else moveTo(i, j - 1)
            break
        case 'ArrowRight':
            if (i === 5 && j === 11) moveTo(5, 0)
            else moveTo(i, j + 1)
            break
        case 'ArrowUp':
            if (i === 0 && j === 5) moveTo(9, 5)
            else moveTo(i - 1, j)
            break
        case 'ArrowDown':
            if (i === 9 && j === 5) moveTo(0, 5)
            else moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
function addBall() {
    checkNegs(gGamerPos.i, gGamerPos.j)
    const i = getRandomInt(1, gBoard.length - 1)
    const j = getRandomInt(1, gBoard[0].length - 1)
    const currClass = { i, j }
    if (gBoard[i][j].gameElement === BALL || gBoard[i][j].gameElement === GAMER) return
    else {
        renderCell(currClass, BALL_IMG)
        gBoard[i][j].gameElement = BALL
    }

}
function addGlue() {
    const i = getRandomInt(1, gBoard.length - 1)
    const j = getRandomInt(1, gBoard[0].length - 1)
    const currClass = { i, j }
    if (gBoard[i][j].gameElement === BALL || gBoard[i][j].gameElement === GAMER) return
    else {
        renderCell(currClass, GLUE_IMG)
        gBoard[i][j].gameElement = GLUE
    }
    setTimeout(() => {
        if (gBoard[i][j].gameElement === GAMER) return
        else renderCell(currClass, '')
    }, 3000)

}

function checkVictory() {
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 12; j++) {
            if (gBoard[i][j].gameElement === BALL) return
        }
    }
    win()
    clearInterval(gIdBall)
    clearInterval(gIdGlue)
}

function win() {
    var elVictory = document.querySelector(".victory")
    elVictory.style.display = "inline-block"
}

function renderMove(i, j) {
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    renderCell(gGamerPos, '')
    gBoard[i][j].gameElement = GAMER
    gGamerPos = { i, j }
    renderCell(gGamerPos, GAMER_IMG)

}

function checkNegs(cellI, cellJ) {
    gBallAround = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].gameElement === BALL) gBallAround++
        }
    }
    const elAround = document.querySelector(".around")
    elAround.innerText = `Balls around you : ${gBallAround}`
}

function reset() {
    gBallCounter = 0
    gGamerPos = { i: 2, j: 9 }
    var elVictory = document.querySelector(".victory")
    elVictory.style.display = "none"
    var elH2 = document.querySelector(".collected")
    elH2.innerText = `Balls collected so far : ${gBallCounter}`

}