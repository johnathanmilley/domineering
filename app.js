/*
** Domineering
** Players take turn laying tiles on the game board (grid). One
** player plays Left (vertical), the other Right (horizontal). 
**
** Author: John Milley 
*/

// Global variables

// get rows and cols from page inputs
let rows = document.querySelector('#rows').value;
let columns = document.querySelector('#columns').value;
let cellSize = 70;

// Subtracted from width and heightsss of the pieces
let offset = 5;

// Roundedness of piece corners
let rx = 5;
let ry = 5;

// grid determined by size of the cell and # of cols and rows
let gridWidth = cellSize * columns;
let gridHeight = cellSize * rows;

// Colour of pieces
let colorLeft = "#273c75";
let colorRight = "#e84118";

let turn = "Left"

let moves = moveMatrix();


// Interface Elements
//
//

// Undo Button
d3.select("#undo-btn").on("click", function() {
    undo()
});

// Reset Button
d3.select("#clear-btn").on("click", function() {
    reset()
});

// Grid Sizing
d3.selectAll("input")
    .on("change", () => {
        reset()
    })


// Decrease cellSize
const increase = document.querySelector('#increase');
increase.addEventListener("click", () => {
    decrease.disabled = false;
    if (cellSize < 200) {
        cellSize += 10;
        reset();
        if (cellSize == 200) {
            increase.disabled = true;
        }
    }
})

// Increase cellSize 
const decrease = document.querySelector('#decrease');
decrease.addEventListener("click", () => {
    increase.disabled = false;
    if (cellSize > 40) {
        cellSize -= 10;
        reset();
        if (cellSize == 40) {
            decrease.disabled = true;
        }
    }
})

// Keyboard Shortcuts
document.addEventListener("keydown", function(e) {
    // console.log(e.code);
    if (e.code === "KeyA") {
        undo()
    }
    // swap pieces (used for presentation purposes)
    if (e.code === "KeyS") {
        hidePreview();
        togglePreviewVisibility();
        toggleTurn();
    }
})

// Audio
// const audio = document.querySelector("#pieceLayedSound")

// General functions

function togglePreviewVisibility(t) {

    let LeftPreview = document.querySelector(".Left");
    let RightPreview = document.querySelector(".Right");

    if (t === "Left") {
    
        RightPreview.style.visibility = "hidden";
        LeftPreview.style.visibility = "visible";
    
        LeftPreview.setAttribute("x", x + offset);
        LeftPreview.setAttribute("y", y - cellSize + offset);
    } else if (t === "Right") {

        // toggle visibility
        LeftPreview.style.visibility = "hidden";
        RightPreview.style.visibility = "visible";

        // set top-Left of the rect to be drawn
        RightPreview.setAttribute("x", x + offset);
        RightPreview.setAttribute("y", y + offset);
    }
}

function reset() {
    d3.select("svg").remove();

    // reset turn label
    turn = "Left";
    document.querySelector('#turn').innerHTML = `${turn} (vertical)`;

    // get new rows and cols from DOM
    rows = document.querySelector('#rows').value;
    columns = document.querySelector('#columns').value;

    // recalulate grid size based on # rows and cols
    gridWidth = cellSize * columns;    
    gridHeight = cellSize * rows;

    // reset moveMatrix
    moves = moveMatrix();

    drawGrid();
}

function undo() {
    // Get last move from grid
    let lastMove = document.querySelector(".moves .move");
    if (lastMove != null) {
        // Get top-left x and y of last move
        let x = ((parseInt(lastMove.getAttribute("x")) - offset)) / cellSize;
        let y = ((parseInt(lastMove.getAttribute("y")) - offset)) / cellSize;
        
        if (turn === "Right") {
            // Remove left move
            moves[x][y] = 0;
            moves[x][y + 1] = 0;
        }
        if (turn === "Left") {
            // Remove right move
            moves[x][y] = 0;
            moves[x+1][y] = 0;
        }
        
        // Remove last move from the board
        d3.select(".moves .move").remove();
        hidePreview();
        toggleTurn();
    }
    console.log(moves);
}

// Sets both previews to hidden
function hidePreview() {
    d3.selectAll(".preview")
        .style("visibility", "hidden");
}

// play domino sound
// function playAudio() {
//     audio.play();
// }

function toggleTurn() {
    if (turn === "Left") {
        turn = "Right" 
    } else {
        turn = "Left"
    }

    // update HTML label
    let orientation;
    (turn === "Left") ? orientation = "vertical" : orientation = "horizontal";
    document.querySelector('#turn').innerHTML = `${turn} (${orientation})`;
    ;
}

// Generate / reset a Matrix of moves (cells occupied on the grid)
/*
** Each list in the array represents a column (x value on grid)
** Each item in list represents a row (y value on grid)
** Reference moves by [x][y]
*/
function moveMatrix() {
    let m = new Array();
    for (i = 0; i < columns; i++) {
        m[i] = [];
        for (j = 0; j < rows; j++) {
            m[i][j] = 0
        }
    }
    return m
}

// Draw the pieces (called when Preview piece is clicked)
function draw(x, y, w, h) {

    var move = d3.select(".moves")
        .append("rect")
        .lower() // placed as first child of svg for quick undo.
        .attr("class", "move")
        .attr("x", x)
        .attr("rx", rx)
        .attr("y", y)
        .attr("ry", ry)
        .attr("width", w)
        .attr("height", h)
        .style("margin", "1em")
        .style("fill", (turn === "Left") ? colorLeft : colorRight);
}


/* Draw the grid 
* 
** This is the main function. Grid is drawn and most event handlers ** are attached. 
*/
function drawGrid() {
    
    // Generate game data. D3 uses this Array to build the gameboard.
    function gridData() {
        var data = new Array();
        var xpos = 0;
        var ypos = 0;

        // iterate for rows 
        for (var row = 0; row < rows; row++) {
            data.push( new Array() );

            // iterate for cells/columns inside rows
            for (var column = 0; column < columns; column++) {
                data[row].push({
                    x: xpos,
                    y: ypos,
                    width: cellSize,
                    height: cellSize
                })
                // increment the x position. 
                xpos += cellSize;
            }
            // reset the x position after a row is complete
            xpos = 0;
            // increment the y position for the next row. Move it down 50 (height variable)
            ypos += cellSize; 
        }
        return data;
    }

    // generate the data needed to draw the grid
    var gridData = gridData();    
    // console.log(gridData);

    // place the containing svg to page
    var grid = d3.select("#grid")
        .append("svg")
        .attr("width", gridWidth)
        .attr("height", gridHeight)
        .attr("class", "grid")
        .on('mouseleave', () => {
            hidePreview();
        });

    // draw rows from gridData Array 
    var row = grid.selectAll(".row")
        .data(gridData)
        .enter().append("g")
        .attr("class", "row");

    /* Draw columns
    *
    ** Preview pieces are toggled in mouseenter
    */ 
    var column = row.selectAll(".square")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","square")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; })
        .style("fill", "#fff")
        .style("stroke", "#000")
        .on('mouseenter', function(e) {
            // get x,y values of element attributes defined in gridData
            x = parseInt(this.getAttribute("x"));
            y = parseInt(this.getAttribute("y"));


            if (turn === "Left") {
                if (y >= cellSize) {
                    if (moves[x / cellSize][y / cellSize] !== 1 &&
                    moves[x / cellSize][(y - cellSize) / cellSize] !== 1) {
                    // Left is not drawn when cursor in first row
                        togglePreviewVisibility(turn);
                    }
                }
            } else if (turn === "Right") {

                if (x < gridWidth - cellSize) {
                    if (moves[x / cellSize][y / cellSize] !== 1 &&
                    moves[(x + cellSize) / cellSize][y / cellSize] !== 1) {
                    // Right is not drawn when cursor in the last column
                        togglePreviewVisibility(turn);
                    }
                }
            }
        });

    // Add move group to svg
    var row = d3.selectAll("#grid svg")
        .append("g")
        .attr("class", "moves");

    // Add previews group to svg
    var row = d3.selectAll("#grid svg")
        .append("g")
        .attr("class", "previews");

    /* Draw preview pieces
    *
    ** Moves are placed to the board by clicking on the preview pieces. Previews are toggled by visibility attribute.
    **
    */
    var LeftPreview = d3.select('.previews')
        .append("rect")
        .attr("class", "preview Left")
        .style("fill", colorLeft)
        .style("visibility", "hidden")
        .attr("x", (0 + offset).toString())
        .attr("y", (0 + offset).toString())
        .attr("width", cellSize - (2 * offset))
        .attr("height", cellSize * 2 - (2 * offset))
        .attr("rx", rx)
        .attr("ry", ry)
        .on('click', () => {

            // playAudio();
            
            // place move
            draw(this.x + offset, this.y - cellSize + offset, cellSize - (2 * offset), cellSize * 2 - (2 * offset), colorLeft);
            
            // record moves to move array
            moves[this.x / cellSize][this.y / cellSize] = 1;
            moves[this.x / cellSize][(this.y - cellSize) / cellSize] = 1;
            
            hidePreview();
            togglePreviewVisibility();
            toggleTurn();
        })
        .on('mouseleave', () => {
            hidePreview();
        })
        .on('mousemove', (e) => {
            let middle = y;
            let mouseY = d3.pointer(e)[1];
            if (mouseY > cellSize) {
                if (mouseY < middle) {
                    d3.select(".Left")
                    .attr("y", this.y - (2 * cellSize))
                }
            }
        });
        
        var RightPreview = d3.select('.previews')
        .append("rect")
        .attr("class", "preview Right")
        .style("fill", colorRight)
        .style("visibility", "hidden")
        .attr("x", (0 + offset).toString())
        .attr("y", (0 + offset).toString())
        .attr("width", cellSize * 2 - (2 * offset))
        .attr("height", cellSize - (2 * offset))
        .attr("rx", rx)
        .attr("ry", ry)
        .on('click', () => {

            // playAudio();
            
            draw(this.x + offset, this.y + offset, cellSize * 2 - (2 * offset), cellSize - (2 * offset), colorLeft);
            
            // record moves to move array
            moves[this.x / cellSize][this.y / cellSize] = 1;
            moves[(this.x + cellSize) / cellSize][this.y / cellSize] = 1;
            
            console.log(moves);

            hidePreview();
            togglePreviewVisibility();
            toggleTurn();
        })
        .on('mousemove', (e) => {
            let middle = x + cellSize;
            let mouseX = d3.pointer(e)[0];
            if (mouseX < (gridWidth - cellSize)) {
                if (mouseX > middle) {
                    this.x = x + cellSize + offset;
                    d3.select(".Right")
                        .attr("x", x + cellSize + offset)
                }
            }
        });
}


// Where the magic happens...
drawGrid();