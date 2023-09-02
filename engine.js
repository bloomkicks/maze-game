const {World, Engine, Runner, Render, Bodies, Body, Events} = Matter

const canvasW = innerWidth
const canvasH = innerHeight
const engine = Engine.create()
const {world} = engine
world.gravity.y = 0
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width:canvasW,
        height:canvasH,
        wireframes : false,
        background: 'transparent'
    }
})
Render.run(render)
Runner.run(Runner.create(), engine)


// MAZE ALGORITHM
//variables
const rows = 20
const columns = 30
const scale = canvasW < canvasH ? canvasW / columns : canvasH / rows

const endColumn = columns - 1 
const endRow = rows - 1

const startRow = 0
const startColumn = 0

const minPart = scale / 10
const maxPart = scale


const mazeWidth = scale * columns
const mazeHeight = scale * rows

const topBoundX   = mazeWidth / 2 + ((canvasW - mazeWidth) / 2)
const topBoundY   = 0 + ((canvasH - mazeHeight) / 2)
const rightBoundX = mazeWidth + ((canvasW - mazeWidth) / 2)
const rightBoundY = mazeHeight / 2 + ((canvasH - mazeHeight) / 2)
const botBoundX   = mazeWidth / 2 + ((canvasW - mazeWidth) / 2)
const botBoundY   = mazeHeight + ((canvasH - mazeHeight) / 2)
const leftBoundX  = 0 + ((canvasW - mazeWidth) / 2)
const leftBoundY  = mazeHeight / 2 + ((canvasH - mazeHeight) / 2)

//setting grid and walls

const grid = Array(rows).fill(null).map(() => {
    return Array(columns).fill(false)
})
const verticals = Array(rows).fill(null).map(() => {
    return Array(columns - 1).fill(false)
})
const horizontals = Array(rows - 1).fill(null).map(() => {
    return Array(columns).fill(false)
})

function pickRandom(obj, ...disabled) {
    let result;     
    if (typeof(obj) === 'object') {
        result = obj[Math.floor(Math.random() * obj.length)] 
    } else {
        result = []
        for (let i = 0; i < obj; i++) {
            result.push(i)
        }
        if (disabled) disabled.forEach(value => {
            result = result.filter(item => item !== value)
        })
        result = result[Math.floor(Math.random() * result.length)] 
    }

    return result
}
//creating a maze path
function shuffle(array) {
    let arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
        const randIndex = Math.floor(Math.random() * (i + 1))

        const temp = arr[i]
        arr[i] = arr[randIndex]
        arr[randIndex] = temp 
    }
    return arr
}
function getNeighbors(row, column) {
    let neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ])
    
    return neighbors
}

function move(row, column) {
    if (grid[row][column]) {
        return;
    }
    grid[row][column] = true
    const neighbors = getNeighbors(row, column)
    for (let neighbor of neighbors) {

        const [nextRow, nextCol, direction] = neighbor
        if (nextRow < 0 || 
            nextRow >= rows ||
            nextCol < 0 ||
            nextCol >= columns) {
            continue;
        }
        if (grid[nextRow][nextCol]) {
            continue;
        }   
        if (direction === 'up') {
            horizontals[row - 1][column] = true
        } else if (direction === 'down') {
            horizontals[row][column] = true
        }

        if (direction === 'left') {
            verticals[row][column - 1] = true
        } else if (direction === 'right') {
            verticals[row][column] = true
        }

        
        move(nextRow, nextCol)
    }

}

move(startRow, startColumn)


//displaying maze with Matter.js

// const horWidth = scale
// const horHeight = scale / 20
// const verWidth = scale / 20
// const verHeight = scale 



horizontals.forEach((row, rowIndex) => {
    row.forEach((open, wallIndex) => {
        if (open) {
            return; 
        }      
        else {
            const wall = Bodies.rectangle(
                scale * wallIndex + (maxPart / 2) + ((canvasW - mazeWidth) / 2),
                scale * (rowIndex + 1) + ((canvasH - mazeHeight) / 2),
                maxPart, minPart, {
                    label : 'wall', 
                    isStatic : true
                })
            World.add(world, wall)
        }
    })
})

verticals.forEach((row, rowIndex) => {
    row.forEach((open, wallIndex) => {
        if (open) {
            return; 
        }      
        else {
            const wall = Bodies.rectangle(
                scale * (wallIndex + 1) + ((canvasW - mazeWidth) / 2),
                scale * rowIndex + (maxPart / 2) + ((canvasH - mazeHeight) / 2),
                minPart, maxPart, {
                    label : 'wall', 
                    isStatic : true
                })
            World.add(world, wall)
        }
    })
})

const Bounds = [
    Bodies.rectangle(topBoundX, topBoundY, mazeWidth, minPart, {isStatic : true}),
    Bodies.rectangle(rightBoundX, rightBoundY, minPart, mazeHeight , {isStatic : true}),
    Bodies.rectangle(botBoundX, botBoundY, mazeWidth, minPart, {isStatic : true}),
    Bodies.rectangle(leftBoundX, leftBoundY, minPart, mazeHeight, {isStatic : true}),
]
World.add(world, Bounds)

let finish = Bodies.rectangle(
scale * endColumn + (scale / 2) + ((canvasW - mazeWidth) / 2), 
scale * endRow + (scale / 2) + ((canvasH - mazeHeight) / 2), 
(scale / 100 * 70), (scale / 100 * 70), { 
    isStatic : true, 
    label : 'goal',
    isSensor : true,
    render : {
        fillStyle : 'green'
    }
})
let ball = Bodies.circle(
    scale * startColumn + (scale / 2) + ((canvasW - mazeWidth) / 2), 
    scale * startRow + (scale / 2) + ((canvasH - mazeHeight) / 2), (scale / 100 * 70) / 2, 
    {
        label : 'ball',
        render : {
            fillStyle : 'red'
        }
    })
World.add(world, [ball, finish])
const onKeydown = (e) => {
    const {x, y} = ball.velocity
    if (e.keyCode === 87) {

        Body.setVelocity(ball, {x, y: y - scale / 20})
    } 
    if (e.keyCode === 68) {

        Body.setVelocity(ball, {x: x +  scale / 20, y})
    }
    if (e.keyCode === 83) {

        Body.setVelocity(ball, {x, y: y + scale / 20})
    }
    if (e.keyCode === 65) {

        Body.setVelocity(ball, {x: x -  scale / 20, y})
    }
}
addEventListener('keydown', onKeydown)
Events.on(engine, 'collisionStart', e => {
    e.pairs.forEach(collision => {
        
        const labels = ['goal', 'ball']
        
        if (labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)) {
            world.gravity.y = 1
    
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                Body.setStatic(body, false)
                }
                if (body.label === 'goal') {
                    body.render = {opacity : 0}
                }
            })
        }
    })
})