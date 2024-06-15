const stream = require("stream");
const debug = require("debug")("camera-server-js:stderr");
const cv = require("opencv4nodejs");
const through2 = require("through2");
const command = require('./command')

const numToFormat = (fourcc) =>
  String.fromCharCode(fourcc & 255) +
  String.fromCharCode((fourcc >> 8) & 255) +
  String.fromCharCode((fourcc >> 16) & 255) +
  String.fromCharCode((fourcc >> 24) & 255);

class CameraStream {
  constructor() {
    this.camera = new cv.VideoCapture(0);
    this.camera.set(cv.CAP_PROP_BUFFERSIZE, 1);

    this.camera.set(cv.CAP_PROP_FRAME_WIDTH, 1280);
    this.camera.set(cv.CAP_PROP_FRAME_HEIGHT, 720);

    this.pipes = [];
    this.count = 0;
    this.fps = 0;
  }

  setFramerate(fps) {
    // reset the count
    this.count = 0;
    if (this.interval) {
      clearInterval(this.interval);

      if (this.streaming){
        this.endLiveStream();
      }  
    }

    console.log(numToFormat(this.camera.get(cv.CAP_PROP_FOURCC)));

    this.camera.set(cv.CAP_PROP_FPS, fps);

    console.log(numToFormat(this.camera.get(cv.CAP_PROP_FOURCC)));

    this.fps = this.camera.get(cv.CAP_PROP_FPS);

    this.interval = setInterval(this.processFrame.bind(this), 1000 / fps);
  }

  async getFrame() {
    const frame = await this.camera.readAsync();

    if (frame.empty) {
      console.log("empty");
      return await this.getFrame();
    }

    return await cv.imencodeAsync(".jpg", frame);
  }

  async processFrame() {
    if (this.pipes.length == 0) return;

    this.count = this.count + 1;
    const current = this.count;

    console.log("capturing frame", current);

    let frame = await this.camera.readAsync();

    if (frame.empty) {
      return;
    }

    console.log("piping frame", current, this.pipes.length);

    this.pipes.forEach((pipe) => {
      return pipe.push({ current, frame });
    });
  }

  getLiveStream(fps) {
    if (this.streaming){
      this.endLiveStream();
    }

    this.setFramerate(fps);

    this.inStream = new stream.Readable({
      objectMode: true,
      read: function () {},
    });

    //const self = this

    this.liveStream = through2.obj(async function (entry, enc, cb) {
      const { frame, current } = entry;

      console.log("processing frame", current);

      try {
        const data = await cv.imencodeAsync(".bmp", frame);
        this.push(data);
      } catch (e) {
        console.log(e);
      }

      cb();
    });

    this.pipes.push(this.inStream);

    this.ffmpeg = command(
      "ffmpeg",
      `-f image2pipe -framerate ${fps} -vcodec bmp -i - -g 5 -c:v h264_omx -c:a copy -b:v 1500k -r 30 -movflags frag_keyframe+empty_moov -f mp4 -`
    );

    this.inStream.pipe(this.liveStream).pipe(this.ffmpeg.stdin);

    this.stream = new stream.PassThrough();

    this.ffmpeg.stdout.pipe(this.stream);

    // error logging
    this.ffmpeg.stderr.setEncoding("utf8");
    this.ffmpeg.stderr.on("data", (data) => {
      debug(data);
    });

    this.ffmpeg.on("end", () => {
      this.endLiveStream();
    });

    this.streaming = true;

    return this.stream;
  }

  endLiveStream() {
    const index = this.pipes.indexOf(this.inStream);
    if (index > -1) {
      this.pipes.splice(index, 1);
    }

    this.liveStream.destroy();
    this.inStream.destroy();
  
    this.streaming = false;
  }
}

module.exports = new CameraStream();
