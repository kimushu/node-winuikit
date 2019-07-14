import { EventEmitter } from "events";
import { MsgWaitForMultipleObjects, PeekMessageA, MSG, QueueStatus } from "./win32/winuser";
import * as debug_module from "debug";

const debug = debug_module("wuk:messagelistener");

export class MessageListener extends EventEmitter {
  start(waitInterval: number = 500): void {
    this.stop();
    this.waitInterval = waitInterval;
    this.poller = this.poll.bind(this);
    this.timer = setImmediate(this.poller);
    debug(`Started message listener (waitInterval: ${this.waitInterval}ms)`);
  }

  private poll(): void {
    if (MsgWaitForMultipleObjects(0, null, false,
        this.waitInterval, QueueStatus.QS_ALLINPUT) === 0) {
      let msg = new MSG({});
      if (PeekMessageA(msg.ref(), null, 0, 0, 1)) {
        this.emit("message", msg);
      }
    }
    this.timer = setImmediate(this.poller);
  }

  stop(): void {
    if (this.running) {
      this.timer.unref();
      this.timer = null;
      debug("Stopped message listener");
    }
  }

  get running(): boolean {
    return (this.timer != null);
  }

  private constructor() {
    super();
  }

  static readonly mainLoop = new MessageListener;

  private timer: NodeJS.Immediate;
  private poller: () => void;
  private waitInterval: number;
}
