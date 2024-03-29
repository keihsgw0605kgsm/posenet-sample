const player = document.getElementById('video')
const download = document.getElementById('download')
const p_test = document.getElementById('test')
//const txt = document.getElementById('text')
//const txt2 = document.getElementById('text2')
//const posenet = require('@tensorflow-models/posenet')
//import * as posenet from '@tensorflow-models/posenet'
//const modelUrl = './weights'
var imageScaleFactor = 0.5;
var outputStride = 32;
var flipHorizontal = false;
var pose_ = "No Data";
var test_csv = []

//const net = posenet.load().then(txt.textContent = "OK").then(startVideo)

window.onload = function () {
  startVideo();
}


/*posenet.load()
.then((net) => {
  startVideo();
  return net
})
.then((net) => {
  return net.estimateSinglePose(player, imageScaleFactor, flipHorizontal, outputStride)
})
.then((pose) => {
  txt.textContent = JSON.stringify(pose)
})
.catch((e) => {
  txt.textContent = e
})*/

/**カメラを用いたビデオストリーミング**/
function startVideo() {
  var constraints = {
    audio: true,
    video: {
      width: player.width,
      height: player.height
    }
  };
  
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    player.srcObject = stream;
    player.onloadedmetadata = function(e) {
      player.play();
    };
  })
  .catch(function(err) {
    console.log(err.name+": "+err.message);
  });
}

/**カメラオン時のイベント**/
player.addEventListener('play', () => {
  const canvas = document.createElement("canvas");
  canvas.width = player.width;
  canvas.height = player.height;
  document.body.append(canvas);
  
  setInterval(async () => {
    const ctx = canvas.getContext('2d');
    //ctx.drawImage(player, 0, 0);
    
    posenet.load()
    .then((net) => {
      return net.estimateSinglePose(player, imageScaleFactor, flipHorizontal, outputStride)
    })
    .then((pose) => {
      console.log(JSON.stringify(pose))
      drawParts(ctx, pose);
      pose_ = JSON.stringify(pose, null, '\t');

      p_test.textContent = pose["keypoints"][0]["position"]["x"]
      test_csv = [
        ['x0', 'y0', 'x1', 'y1'],
        [pose["keypoints"][0]["position"]["x"], pose["keypoints"][0]["position"]["y"], pose["keypoints"][1]["position"]["x"], pose["keypoints"][1]["position"]["y"]]
      ]

    })
    .catch((e) => {
      consoloe.log(e)
    })

    //const pose = await net.estimateSinglePose(player, imageScaleFactor, flipHorizontal, outputStride)
    /*net.estimateSinglePose(player, imageScaleFactor, flipHorizontal, outputStride)
    then((pose) => {
      txt.textContent = "pose2"
    })
    .catch((e) => {txt.textContent = e})*/
    //txt.textContent = "pose"//JSON.stringify(pose)
    
    //drawParts(ctx, pose);

    //結果の出力
    //console.log(JSON.stringify(pose));
  }, 100)
  .catch((e) => {
    console.log('setIntervalでエラー：'+e);
  })
})
.catch((e) => {
  console.log('player.addEventListenerでエラー：'+e);
})

/*function drawPoint(y,x,r) {
  ctx.beginPath();
  ctx.arc(x,y,r,0,2*Math.PI);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
}

function drawKeypoints(keypoints) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];
    console.log(`keypoint in drawkeypoints ${keypoint}`);
    const { y, x } = keypoint.position;
    drawPoint(y, x, 3);
  }
}

function drawSegment(
  pair1,
  pair2,
  color,
  scale
) {
  ctx.beginPath();
  ctx.moveTo(pair1.x * scale, pair1.y * scale);
  ctx.lineTo(pair2.x * scale, pair2.y * scale);
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawSkeleton(keypoints) {
  const color = "#FFFFFF";
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  );

  adjacentKeyPoints.forEach((keypoint) => {
    drawSegment(
      keypoint[0].position,
      keypoint[1].position,
      color,
      1,
    );
  });
}*/

function drawParts(ctx, pose) {
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  const points = pose.keypoints;
  const radius = 7; //円の半径

  for (let i = 0; i < points.length; i++) {
    const xpos = points[i].position.x; //x位置
    const ypos = points[i].position.y; //y位置
    const part = points[i].part; //部位の名前

    //円の色
    ctx.fillStyle = "red";
    //円で塗る
    ctx.beginPath();
    ctx.arc(xpos, ypos, radius, 0, Math.PI*2);
    ctx.fill();
  }

  //上半身，左右別に部位を線で結ぶ
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  //leftsholder5 - leftsholder7 - leftsholder9
  ctx.moveTo(points[5].position.x, points[5].position.y);
  ctx.lineTo(points[7].position.x, points[7].position.y);
  ctx.lineTo(points[9].position.x, points[9].position.y);
  //rightsholder6 - rightsholder8 - rightsholder10
  ctx.moveTo(points[6].position.x, points[6].position.y);
  ctx.lineTo(points[8].position.x, points[8].position.y);
  ctx.lineTo(points[10].position.x, points[10].position.y);
  //線を描く
  ctx.stroke();

  // 下半身、左右別に部位を線で結ぶ
  /*ctx.beginPath();
  ctx.strokeStyle = 'blue';
  // leftHip11 - leftKnee13 - leftAnkle15
  ctx.moveTo(points[11].position.x, points[11].position.y);
  ctx.lineTo(points[13].position.x, points[13].position.y);
  ctx.lineTo(points[15].position.x, points[15].position.y);
  // rightHip12 - rightKnee14 - rightAnkle16
  ctx.moveTo(points[12].position.x, points[12].position.y);
  ctx.lineTo(points[14].position.x, points[14].position.y);
  ctx.lineTo(points[16].position.x, points[16].position.y);
  ctx.stroke();*/
}

/** jsonファイルの保存 **/
/*function handleDownload() {
  var blob = new Blob([ pose_ ], { "type" : "text/plain" });
  var url = window.URL.createObjectURL(blob);
  download.href = url;
  window.navigator.msSaveBlob(blob, "test_posenet.json"); 
}*/

/** csvファイルの保存 **/
function handleDownload() {
  
  let data = test_csv.map((record)=>record.join(',')).join('\r\n');
  
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF])

  var blob = new Blob([ bom, data ], { "type" : "text/csv" });
  let url = (window.URL || window.webkitURL).createObjectURL(blob);
  download.href = url;
  window.navigator.msSaveBlob(blob, "test_posenet.csv");
}