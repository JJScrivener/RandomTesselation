const sites = [196,130,171,466,372,356,493,41,12,251,7,33] //The locations of the initial sites
const beachLine = [-1,-1] //List of the sites that make up the beach line from left to right
let xBounds = [] //The x bounds of each site on the beach line

const size = 500  //The width and height of the screen
const space = 200 //The radius around each site where new sites are not allowed
let height = 0 //The current height of the sweep line

let points = [] //An array of points equidistant from two or more sites
let run = true //For starting and stopping the animation

const test = []

function setup(){
  createCanvas(size, size)
  //createSites() //Create random sites with atleast "space" space around each one
  frameRate(20)

}

function draw(){
  if(run){
    if(height < size*2){
      background(0)
      calcBounds()
      for(let i = 0; i <= sites.length-2; i+=2){
        stroke(255)
        fill(255)
        ellipse(sites[i], sites[i+1], 3, 3) //display each site (an x,y pair in a 1D array)

        for(let i = 0; i<=beachLine.length-2; i+=2){
          if(beachLine[i]>0){
            parabola(beachLine[i], beachLine[i+1], height) //display the equidistant parabola for each site on the beach line
          }
        }

        if(Math.abs(sites[i+1]-height) < 1){ //if a site was just swept by the sweep line add the site to the beach line
          newAdd(sites[i], sites[i+1])
        }
      }

      for(let i = 0; i <= beachLine.length - 4; i+=2){
        if(beachLine[i]>0){
          checkIntersection(beachLine[i], beachLine[i+1], beachLine[i+2], beachLine[i+3], height) //add the intersection of adjacent parabola to the points array
        }
      }
      rem() //remove sections of parabola that are squeezed off the left and right of the screen
      circ() //remove sections of parabola that are squeezed out by the two adjacent paraboli
      edgeRem()
      noStroke()
      fill(255,0,0)
      for(let i = 0; i <= points.length-2; i+=2){
        ellipse(points[i],points[i+1],2,2) //display the equidistant points
      }

      fill(0,0,255)
      for(let i = 0; i <= test.length-2; i+=2){
        ellipse(test[i],test[i+1],5,5)
      }
      stroke(255)
      line(0,height,size,height) //display the sweep line
      height++
    }
  }
  line(160,0,160,size)
}

function testParabola(a,b,c,px){
  stroke(255,0,0)
  let x_step = 1
  let x1 = px
  let y1 = a*x1*x1 + b*x1 + c
  let x2 = x1 + x_step
  let y2 = a*x2*x2 + b*x2 + c
  while(y1 > 0 ){
    line(x1, y1, x2, y2)
    line(2 * px - x1, y1, 2 * px - x2, y2) //draw the second half of the parabola by reflecting the first half
    x1 = x2
    y1 = y2
    x2 = x1 + x_step
    y2 = y2 = a*x2*x2 + b*x2 + c
  }
  run = false
}

function parabola(px, py, h){ //draw the parabola that is equidistant from the point (px,py) and the line y=h
  let a = -1 / (2 * (h - py))
  let b = px / (h - py)
  let c = -(px * px) / (2 * (h - py)) + (h + py) / 2
  let x_step = 1 //The parabola is made of many straight lines and x_step is the delta x of each straight line

  let x1 = px
  let y1 = a*x1*x1 + b*x1 + c
  let x2 = x1 + x_step
  let y2 = a*x2*x2 + b*x2 + c

  stroke(255)

  while(y1 > 0 ){
    line(x1, y1, x2, y2)
    line(2 * px - x1, y1, 2 * px - x2, y2) //draw the second half of the parabola by reflecting the first half
    x1 = x2
    y1 = y2
    x2 = x1 + x_step
    y2 = y2 = a*x2*x2 + b*x2 + c
  }
}

function checkIntersection(px1, py1, px2, py2, h){

  let a1 = -1 / (2 * (h - py1))
  let b1 = px1 / (h - py1)
  let c1 = -(px1 * px1) / (2 * (h - py1)) + (h + py1) / 2

  let a2 = -1 / (2 * (h - py2))
  let b2 = px2 / (h - py2)
  let c2 = -(px2 * px2) / (2 * (h - py2)) + (h + py2) / 2

  let a = a1 - a2
  let b = b1 - b2
  let c = c1 - c2

  let x = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a)
  let y = a1*x*x + b1*x + c1

  points.push(x)
  points.push(y)
}

function calcBounds(){
  xBounds = [0,size]

  for(let i = 0; i<=beachLine.length-4; i+=2){
    let a1 = -1 / (2 * (height - beachLine[i+1]))
    let b1 = beachLine[i] / (height - beachLine[i+1])
    let c1 = -(beachLine[i] * beachLine[i]) / (2 * (height - beachLine[i+1])) + (height + beachLine[i+1]) / 2

    let a2 = -1 / (2 * (height - beachLine[i+3]))
    let b2 = beachLine[i+2] / (height - beachLine[i+3])
    let c2 = -(beachLine[i+2] * beachLine[i+2]) / (2 * (height - beachLine[i+3])) + (height + beachLine[i+3]) / 2
    if(beachLine[i] == -1){ //if the left segment of the beach is actualy y = 0
      let x = (-b2 + Math.sqrt(b2*b2 - 4*a2*c2)) / (2*a2)
      if(x>0){
        xBounds.splice(i, 0, x)
      }
    }
    else if(beachLine[i+2] == -1){//if the right segment of the beach is actualy y = 0
      let x = (-b1 - Math.sqrt(b1*b1 - 4*a1*c1)) / (2*a1)
      if(x<size){
        xBounds.splice(i, 0, x)
      }
    }
    else{//both segments are paraboli
      let a = a1 - a2
      let b = b1 - b2
      let c = c1 - c2
      let x = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a)
      xBounds.splice(i, 0, x)
    }
  }

  for(let i = 0; i<xBounds.length; i++){
    noStroke()
    fill(0,255,0)
    ellipse(xBounds[i],0,5,5)
  }
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

function newAdd(newx, newy){
  let index = 0
  while(newx > xBounds[index]){
    index++
  }
  beachLine.splice(2*index, 0, newx, newy, beachLine[2*index-2],beachLine[2*index-1]) // add the new point to the beach line
  console.log("beach line")
  for(let i = 0; i<=beachLine.length-2; i+=2){
    console.log(beachLine[i],beachLine[i+1])
  }
  calcBounds()
  console.log("index = ",index)
  console.log("xbounds")
  for(let i = 0; i<xBounds.length; i++){
    console.log(xBounds[i])
  }
}

function add(newx, newy){
  let max = 0
  let index = 0

  if(beachLine.length > 0){ // if there are already points on the beach line
    for(let i = 0; i <= beachLine.length-2; i+=2){ //check which point is highest at the new position
      let a = -1 / (2 * (height - beachLine[i+1]))
      let b = beachLine[i] / (height - beachLine[i+1])
      let c = -(beachLine[i] * beachLine[i]) / (2 * (height - beachLine[i+1])) + (height + beachLine[i+1]) / 2
      if(a*newx*newx+b*newx+c > max){
        max = a*newx*newx+b*newx+c
        index = i+2
      }
    }

    if(max == 0){ // there is no parabola at newx yet
      while(index <= beachLine.length && newx > beachLine[index]){ // check where on the beach your newx fits
        index+=2
      }
      beachLine.splice(index, 0, newx, newy) // add the new point to the beach line
    }
    else{
      beachLine.splice(index, 0, newx, newy, beachLine[index-2],beachLine[index-1]) // add the new point to the beach line
    }
  }
  else{
    beachLine.push(newx, newy)
  }

  console.log("new")
  for(let i = 0; i<=beachLine.length-2; i+=2){
    console.log(beachLine[i],beachLine[i+1])
  }
}

function rem(){
  for(let i = 0; i <= beachLine.length - 4; i+=2){
    let a1 = -1 / (2 * (height - beachLine[i+1]))
    let b1 = beachLine[i] / (height - beachLine[i+1])
    let c1 = -(beachLine[i] * beachLine[i]) / (2 * (height - beachLine[i+1])) + (height + beachLine[i+1]) / 2

    let a2 = -1 / (2 * (height - beachLine[i+3]))
    let b2 = beachLine[i+2] / (height - beachLine[i+3])
    let c2 = -(beachLine[i+2] * beachLine[i+2]) / (2 * (height - beachLine[i+3])) + (height + beachLine[i+3]) / 2

    let a = a1 - a2
    let b = b1 - b2
    let c = c1 - c2

    let x = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a)
    let y = a1*x*x + b1*x + c1
    if(x<0 && beachLine[i]>0 && beachLine[i+2]>0){
      beachLine.shift(), beachLine.shift()
      console.log("remove left")
      for(let i = 0; i<=beachLine.length-2; i+=2){
        console.log(beachLine[i],beachLine[i+1])
      }
    }
    if(x>size && beachLine[i]>0 && beachLine[i+2]>0){
      beachLine.pop(), beachLine.pop()
      console.log("remove right")
      for(let i = 0; i<=beachLine.length-2; i+=2){
        console.log(beachLine[i],beachLine[i+1])
      }
    }

  }
}

function circ(){
  let index = -1
  for(let i = 0; i<=beachLine.length-6; i+=2){
    let x1 = beachLine[i]
    let y1 = beachLine[i+1]
    let x2 = beachLine[i+2]
    let y2 = beachLine[i+3]
    let x3 = beachLine[i+4]
    let y3 = beachLine[i+5]

    let x = ((x1*x1+y1*y1)*(y2-y3)+(x2*x2+y2*y2)*(y3-y1)+(x3*x3+y3*y3)*(y1-y2))/(2*(x1*(y2-y3)-y1*(x2-x3)+x2*y3-x3*y2))
    let y = ((x1*x1+y1*y1)*(x3-x2)+(x2*x2+y2*y2)*(x1-x3)+(x3*x3+y3*y3)*(x2-x1))/(2*(x1*(y2-y3)-y1*(x2-x3)+x2*y3-x3*y2))
    let r = Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1))

    if(Math.abs(y+r-height)<.5 && x1>0 && x2>0 && x3>0){
      index = i
    }
  }

  if(index>=0){
    beachLine.splice(index+2, 2)
    console.log("new remove circle")
    for(let i = 0; i<=beachLine.length-2; i+=2){
      console.log(beachLine[i],beachLine[i+1])
    }
  }


}

function edgeRem(){
  let index = -1
  for(let i = 0; i<=beachLine.length-6; i+=2){

    let a1 = -1 / (2 * (height - beachLine[i+1]))
    let b1 = beachLine[i] / (height - beachLine[i+1])
    let c1 = -(beachLine[i] * beachLine[i]) / (2 * (height - beachLine[i+1])) + (height + beachLine[i+1]) / 2

    let a2 = -1 / (2 * (height - beachLine[i+3]))
    let b2 = beachLine[i+2] / (height - beachLine[i+3])
    let c2 = -(beachLine[i+2] * beachLine[i+2]) / (2 * (height - beachLine[i+3])) + (height + beachLine[i+3]) / 2

    let a3 = -1 / (2 * (height - beachLine[i+5]))
    let b3 = beachLine[i+4] / (height - beachLine[i+5])
    let c3 = -(beachLine[i+4] * beachLine[i+4]) / (2 * (height - beachLine[i+5])) + (height + beachLine[i+5]) / 2

    let aS = a1 - a3
    let bS = b1 - b3
    let cS = c1 - c3

    let xS = (-bS - Math.sqrt(bS*bS - 4*aS*cS)) / (2*aS) //two paraboli squeeze out a y=0 section
    let yS = a1*xS*xS + b1*xS + c1

    let aOL = a2 - a3
    let bOL = b2 - b3
    let cOL = c2 - c3

    let xOL = (-bOL - Math.sqrt(bOL*bOL - 4*aOL*cOL)) / (2*aOL) //one parabola overtakes another one on the left that is next to a y=0 section
    let yOL = a2*xOL*xOL + b2*xOL + c2

    let aOR = a1 - a2
    let bOR = b1 - b2
    let cOR = c1 - c2

    let xOR = (-bOR - Math.sqrt(bOR*bOR - 4*aOR*cOR)) / (2*aOR) //one parabola overtakes another one on the right that is next to a y=0 section
    let yOR = a1*xOR*xOR + b1*xOR + c1

    if(beachLine[i]>0 && beachLine[i+2]<0 && beachLine[i+4]>0 && yS>0){ //Squeeze remove
      beachLine.splice(i+2,2)
      console.log("remove top squeeze")
      for(let i = 0; i<=beachLine.length-2; i+=2){
        console.log(beachLine[i],beachLine[i+1])
      }
    }

    else if(beachLine[i]<0 && beachLine[i+2]>0 && beachLine[i+4]>0 && yOL<0){//over take left remove
      beachLine.splice(i+2,2)
      console.log("remove left over take")
      for(let i = 0; i<=beachLine.length-2; i+=2){
        console.log(beachLine[i],beachLine[i+1])
      }
    }

    else if(beachLine[i]>0 && beachLine[i+2]>0 && beachLine[i+4]<0 && yOR<0){//over take right remove
      beachLine.splice(i,2)
      console.log("remove right over take")
      for(let i = 0; i<=beachLine.length-2; i+=2){
        console.log(beachLine[i],beachLine[i+1])
      }
    }
  }
  if(beachLine.length>2 && beachLine[0]<0 && beachLine[2]>0){ //remove y=0 from the left corner
    let a = -1 / (2 * (height - beachLine[1]))
    let b = beachLine[0] / (height - beachLine[1])
    let c = -(beachLine[0] * beachLine[0]) / (2 * (height - beachLine[1])) + (height + beachLine[1]) / 2
    let x = (-b + Math.sqrt(b*b - 4*a*c)) / (2*a)
    if(x<0){
      beachLine.shift(), beachLine.shift()
      console.log("remove left corner")
      for(let i = 0; i<=beachLine.length-2; i+=2){
        console.log(beachLine[i],beachLine[i+1])
      }
    }
  }
  if(beachLine.length>2 && beachLine[beachLine.length-3]>0 && beachLine[beachLine.length-1]<0){ //remove y=0 from the right corner
    let a = -1 / (2 * (height - beachLine[beachLine.length-3]))
    let b = beachLine[beachLine.length-4] / (height - beachLine[beachLine.length-3])
    let c = -(beachLine[beachLine.length-4] * beachLine[beachLine.length-4]) / (2 * (height - beachLine[beachLine.length-3])) + (height + beachLine[beachLine.length-3]) / 2
    let x = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a)
    if(x>size){
      beachLine.pop(), beachLine.pop()
      console.log("remove right corner")
      for(let i = 0; i<=beachLine.length-2; i+=2){
        console.log(beachLine[i],beachLine[i+1])
      }
    }
  }
}

function keyPressed(){
  if (key === ' ') {
    run = !run
  }
}
