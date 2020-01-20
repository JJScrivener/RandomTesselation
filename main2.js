const sites = [] //The locations of the sites
const beachLine = [-1,-1] //List of the sites that make up the beach line from left to right
let xBounds = [] //The x bounds of each site on the beach line

const size = 500  //The width and height of the screen
const space = 100 //The radius around each site where new sites are not allowed
let height = 0 //The current height of the sweep line
let hStep = 1 //The change in height each frame

let points = [] //An array of points equidistant from two or more sites
let run = true //For starting and stopping the animation

function setup(){
  createCanvas(size, size)
  createSites() //Create random sites with atleast "space" space around each one
  frameRate(30)

}

function draw(){
  if(run){
    background(0)
    calcBounds()
    for(let i = 0; i <= sites.length-2; i+=2){

      //display each site (an x,y pair in a 1D array)
      stroke(255)
      fill(255)
      ellipse(sites[i], sites[i+1], 3, 3)

      //if a site was just swept by the sweep line add the site to the beach line
      if(Math.abs(sites[i+1]-height) < hStep){
        add(sites[i], sites[i+1])
        calcBounds() //recalculate the bounds now that the new site has been added
      }

      //display the equidistant parabola for each site on the beach line
      for(let i = 0; i<=beachLine.length-2; i+=2){
        if(beachLine[i]>0){
          drawParabola(beachLine[i], beachLine[i+1], xBounds[i/2], xBounds[(i/2)+1])
        }
      }
    }

    rem()

    //show the intersection points
    noStroke()
    fill(255,0,0)
    for(let i = 0; i<=points.length-2; i+=2){
      ellipse(points[i],points[i+1],3,3)
    }

    //display the sweep line
    stroke(255)
    line(0,height,size,height)
    height = height + hStep


  }
}

/*
*Description: Finds the intersection between the two input curves defined by (x1,y1) and (x2,y2)
              The curves are assumed to be the lines y = 0, x = 0 or x = size or the
              equidistant paraboli between the point and the line y = height.\

*Inputs:      If x1,y1,x2 and y2 are all positive they define two sites and the intersection we are finding
              is the intersection between their respective equidistant paraboli.
              If (x1,y1) or (x2,y2) = (-1,-1) the respective segment is the line y = 0 and the intersection
              is between the other points parabola and y = 0.
              If (x1,y1) = (-2,-2) the left segment is the line x = 0
              If (x2,y2) = (-2,-2) the right segment is the line x = size

              Note: only the x coordinate is checked

*Outputs:     The output is an array with the (x,y) coordinates of the intersection
*/
function findIntersection(x1,y1,x2,y2){
  //calculate the coeficients for the two equidistant paraboli. (y = a*x^2 + b*x + c)
  let a1 = -1 / (2 * (height - y1))
  let b1 = x1 / (height - y1)
  let c1 = -(x1 * x1) / (2 * (height - y1)) + (height + y1) / 2

  let a2 = -1 / (2 * (height - y2))
  let b2 = x2 / (height - y2)
  let c2 = -(x2 * x2) / (2 * (height - y2)) + (height + y2) / 2

  let a = 0
  let b = 0
  let c = 0
  let x = null
  let y = null

  if(x1>0 && x2>0){ // both segements are paraboli
    a = a1-a2
    b = b1-b2
    c = c1-c2
    if(a != 0){
      x = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a)
    }
    else if(b != 0){
      x = -c/b
    }
    else{
      x = 0
    }
    y = a1*x*x + b1*x + c1
  }
  else if(x1==-1 && x2>0){ //left segment is y=0
    a = a2
    b = b2
    c = c2
    x = (-b + Math.sqrt(b*b - 4*a*c)) / (2*a)
    y = a*x*x + b*x + c
  }
  else if(x1>0 && x2==-1){ //right segment is y=0
    a = a1
    b = b1
    c = c1
    x = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a)
    y = a*x*x + b*x + c
  }
  else if(x1==-2 && x2>0){//left segment is x=0
    a = a2
    b = b2
    c = c2
    x = 0
    y = a*x*x + b*x + c
  }
  else if(x1>0 && x2==-2){//right segment is x=size
    a = a1
    b = b1
    c = c1
    x = size
    y = a*x*x + b*x + c
  }

  return([x,y])

}

function drawParabola(px,py,startx,endx){
  let a = -1 / (2 * (height - py))
  let b = px / (height - py)
  let c = -(px * px) / (2 * (height - py)) + (height + py) / 2
  let x_step = 1 //The parabola is made of many straight lines and x_step is the delta x of each straight line

  let x1 = startx
  let y1 = a*x1*x1 + b*x1 + c
  let x2 = x1 + x_step
  let y2 = a*x2*x2 + b*x2 + c

  stroke(255)

  while(x1 < endx ){
    line(x1, y1, x2, y2)
    x1 = x2
    y1 = y2
    x2 = x1 + x_step
    y2 = y2 = a*x2*x2 + b*x2 + c
  }
}

function calcBounds(){
  xBounds = [0]

  for(let i = 0; i<=beachLine.length-4; i+=2){
    let point = findIntersection(beachLine[i], beachLine[i+1], beachLine[i+2], beachLine[i+3])
    points.push(point[0],point[1])
    xBounds.splice(i+1, 0, point[0])
  }
  xBounds.splice(xBounds.length, 0, size)
}

function createSites(){
  let full = false
  let checks = 10000

  while(!full){
    let finished = false
    let count = 0
    let x = 0
    let y = 0
    while(!finished){
      full = true
      x = Math.round(size * Math.random())
      y = Math.round(size * Math.random())
      let dist = 2*size
      for(let j = 0; j < sites.length; j+=2){
          if(Math.sqrt((x-sites[j]) * (x-sites[j]) + (y-sites[j+1]) * (y-sites[j+1])) < dist){
            dist = Math.sqrt((x-sites[j]) * (x-sites[j]) + (y-sites[j+1]) * (y-sites[j+1]))
          }
      }
      finished = (dist > space || count > checks)
      count++
      if(finished && count < checks){
        full = false
        sites.push(x)
        sites.push(y)
      }
    }
  }
}

function add(newx, newy){
  let index = 0
  while(xBounds[index]<newx){
    index++
  }
  index = (index-1)*2
  beachLine.splice(index,0,beachLine[index],beachLine[index+1],newx,newy)
}

function rem(){
  for(let i = 0; i<xBounds.length-1; i++){
    if(xBounds[i+1]<xBounds[i]){
      beachLine.splice(i*2,2)
    }
  }
}

function keyPressed(){
  if (key === ' ') {
    run = !run
  }
}
