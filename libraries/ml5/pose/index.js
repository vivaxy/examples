/**
 * @since 2019-04-21 16:13:03
 * @author vivaxy
 */
setup = () => {
  poses = [];
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  video = createCapture(VIDEO);
  video.hide();

  poseNet = ml5.poseNet(video);
  poseNet.on('pose', (results) => {
    poses = results;
  });
};

draw = () => {
  scale(-1.0, 1.0);
  image(video, -video.width / 2, -video.height / 2, video.width, video.height);
  poses.forEach((pose) => {
    ellipse(
      pose.pose.nose.x - video.width / 2,
      pose.pose.nose.y - video.height / 2,
      10,
      10,
    );
  });
};
