/**
 * @since 2019-04-21 16:13:03
 * @author vivaxy
 */

setup = () => {
  poses = []
  createCanvas(window.innerWidth, window.innerHeight);
  video = createCapture(VIDEO);
  video.size(width, height);

  poseNet = ml5.poseNet(video);
  poseNet.on('pose', (results) => {
    poses = results;
  });
};

draw = () => {
  image(video, 0, 0, width, height);
  poses.forEach((pose) => {
    ellipse(pose.pose.keypoints[0].position.x, pose.pose.keypoints[0].position.y, 10, 10);
  });
};
