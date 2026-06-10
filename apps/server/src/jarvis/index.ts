import JarvisConfig from "./config";
import JarvisCron from "./cron";
import JarvisMultimodalSubagent from "./multimodal-subagent";
import JarvisNotification from "./notification";
import JarvisPrompt from "./prompt";
import JarvisPush from "./push";
import JarvisRunner from "./runner";
import JarvisRuntime from "./runtime";
import JarvisSession from "./session";
import JarvisTool from "./tool";
import JarvisUpload from "./upload";
import JarvisWs from "./ws";

export default class Jarvis {
  public config = new JarvisConfig();
  public prompt = new JarvisPrompt();
  public runner = new JarvisRunner(this);
  public runtime = new JarvisRuntime();
  public session = new JarvisSession(this);
  public push = new JarvisPush();
  public notification = new JarvisNotification(this);
  public tool = new JarvisTool(this);
  public ws = new JarvisWs();
  public upload = new JarvisUpload();
  public multimodalSubagent = new JarvisMultimodalSubagent(this);
  public cron = new JarvisCron(this);
  constructor() {
    this.init();
  }
  init() {
    this.runtime.init();
    this.config.init();
    this.session.init();
    this.push.init();
    this.notification.init();
    this.cron.init();
  }
}
