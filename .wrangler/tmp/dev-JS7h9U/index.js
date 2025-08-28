var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/db.ts
async function getTenantBySlug(env2, slug) {
  const { results } = await env2.DB.prepare(
    "SELECT id, slug, name FROM tenants WHERE slug=?1 LIMIT 1"
  ).bind(slug).all();
  return results?.[0];
}
__name(getTenantBySlug, "getTenantBySlug");
async function getTenantById(env2, id) {
  const { results } = await env2.DB.prepare(
    "SELECT id, slug, name FROM tenants WHERE id=?1 LIMIT 1"
  ).bind(id).all();
  return results?.[0];
}
__name(getTenantById, "getTenantById");
async function createConversation(env2, tenantId) {
  const stmt = env2.DB.prepare(
    "INSERT INTO conversations (tenant_id) VALUES (?1) RETURNING id, phase, status, created_at"
  ).bind(tenantId);
  const { results } = await stmt.run();
  return results?.[0];
}
__name(createConversation, "createConversation");
async function getConversation(env2, id) {
  const stmt = env2.DB.prepare(
    "SELECT id, tenant_id, status, phase, nome, motivo, created_at FROM conversations WHERE id=?1"
  ).bind(id);
  const { results } = await stmt.all();
  return results?.[0];
}
__name(getConversation, "getConversation");
async function updateConversation(env2, id, patch) {
  const sets = [];
  const binds = [];
  let i = 1;
  for (const [k, v] of Object.entries(patch)) {
    sets.push(`${k}=?${i++}`);
    binds.push(v);
  }
  binds.push(id);
  const sql = `UPDATE conversations SET ${sets.join(", ")} WHERE id=?${i}`;
  await env2.DB.prepare(sql).bind(...binds).run();
}
__name(updateConversation, "updateConversation");
async function insertMessage(env2, conversationId, role, content) {
  await env2.DB.prepare(
    "INSERT INTO messages (conversation_id, role, content) VALUES (?1, ?2, ?3)"
  ).bind(conversationId, role, content).run();
}
__name(insertMessage, "insertMessage");
async function listMessages(env2, conversationId, limit = 12) {
  const stmt = env2.DB.prepare(
    "SELECT role, content FROM messages WHERE conversation_id=?1 ORDER BY created_at DESC LIMIT ?2"
  ).bind(conversationId, limit);
  const { results } = await stmt.all();
  return (results ?? []).reverse();
}
__name(listMessages, "listMessages");

// src/playbooks.ts
var PLAYBOOKS = {
  clinica_demo: {
    version: "1.0.0",
    language: "pt-BR",
    domain: "clinica_dermatologica",
    persona: { name: "Ana", tone: "amigavel", emoji: "moderado" },
    goals: ["triagem", "agendamento", "qualifica\xE7\xE3o"],
    required_fields: ["nome", "contato", "tipo_consulta"],
    intents: [
      { name: "agendar", utterances: ["marcar", "consulta", "hor\xE1rio", "agendar"] },
      { name: "preco", utterances: ["pre\xE7o", "valor", "custa"] },
      { name: "duvida_geral", utterances: ["duvida", "informa\xE7\xE3o", "atende"] }
    ],
    flows: {
      triagem_agendamento: {
        entry_intents: ["agendar"],
        nodes: [
          {
            id: "saudacao",
            ask: "Oi! Sou a Ana da Cl\xEDnica Demo. Voc\xEA quer agendar consulta, tirar d\xFAvidas ou conhecer valores?",
            type: "choice",
            choices: ["Agendar", "D\xFAvidas", "Valores"],
            next: { Agendar: "tipo_consulta", "D\xFAvidas": "faq", Valores: "politica_precos" }
          },
          {
            id: "tipo_consulta",
            ask: "Qual o tipo de consulta? (Dermatol\xF3gica geral, Est\xE9tica, Retorno)",
            validate: { enum: ["Dermatol\xF3gica geral", "Est\xE9tica", "Retorno"] },
            capture: "tipo_consulta",
            next: "contato"
          },
          {
            id: "contato",
            ask: "Perfeito! Seu nome e um WhatsApp para confirmarmos?",
            validate: { whatsapp: true },
            capture: ["nome", "contato"],
            next: "confirmacao"
          },
          {
            id: "confirmacao",
            type: "summary",
            complete: true
          }
        ]
      },
      faq: { rag_required: true },
      politica_precos: { policy: "nao_divulgar_preco", fallback: "encaminhar_recepcao" }
    },
    handoff_rules: {
      incerteza_resposta: "score < 0.65 => handoff",
      palavras_gatilho: ["falar com humano", "atendente", "reclama\xE7\xE3o"]
    },
    privacy: { pii_masking: true, consent_required: true }
  },
  imobiliaria_demo: {
    version: "1.0.0",
    language: "pt-BR",
    domain: "imobiliaria",
    persona: { name: "Leo", tone: "profissional", emoji: "nenhum" },
    goals: ["triagem", "encaminhar_corretor"],
    required_fields: ["nome", "contato", "tipo_operacao", "bairro"],
    intents: [
      { name: "agendar", utterances: ["visita", "ver im\xF3vel", "agendar visita"] },
      { name: "preco", utterances: ["pre\xE7o", "aluguel", "compra", "valor"] },
      { name: "duvida_geral", utterances: ["im\xF3vel", "casa", "apartamento", "bairro"] }
    ],
    flows: {
      triagem: {
        entry_intents: ["duvida_geral", "agendar"],
        nodes: [
          {
            id: "saudacao",
            ask: "Ol\xE1! Sou o Leo da Imobili\xE1ria Demo. Voc\xEA procura aluguel ou compra?",
            type: "choice",
            choices: ["Aluguel", "Compra"],
            capture: "tipo_operacao",
            next: "bairro"
          },
          {
            id: "bairro",
            ask: "Qual bairro voc\xEA prefere?",
            capture: "bairro",
            next: "contato"
          },
          {
            id: "contato",
            ask: "Seu nome e um WhatsApp para enviarmos op\xE7\xF5es?",
            validate: { whatsapp: true },
            capture: ["nome", "contato"],
            next: "confirmacao"
          },
          { id: "confirmacao", type: "summary", complete: true }
        ]
      },
      politica_precos: { policy: "n\xE3o_fixar_pre\xE7o_sem_cadastrar", fallback: "encaminhar_corretor" }
    },
    handoff_rules: { incerteza_resposta: "score < 0.6 => handoff", palavras_gatilho: [] },
    privacy: { pii_masking: true, consent_required: true }
  }
};

// src/prompt.ts
function buildSystemPrompt(pb) {
  return [
    `Voc\xEA \xE9 ${pb.persona.name}, assistente do dom\xEDnio ${pb.domain}.`,
    `Objetivos: ${pb.goals.join(", ")}.`,
    `TOM: ${pb.persona.tone}. Emojis: ${pb.persona.emoji}.`,
    `SEMPRE:`,
    `- Fa\xE7a no m\xE1ximo 1 pergunta por vez.`,
    `- Confirme entendimento em 1 frase quando o usu\xE1rio responder algo crucial.`,
    `- Se a pergunta n\xE3o estiver coberta pelo playbook, admita e ofere\xE7a encaminhar para humano.`,
    `- N\xE3o invente pol\xEDticas ou pre\xE7os; se policy do fluxo exigir, direcione ao canal correto.`,
    `- Responda em pt-BR.`,
    ``,
    `Playbook (resumo estruturado):`,
    JSON.stringify(simplifyPlaybook(pb))
  ].join("\n");
}
__name(buildSystemPrompt, "buildSystemPrompt");
function simplifyPlaybook(pb) {
  const { version: version2, domain: domain2, goals, required_fields, intents, flows, handoff_rules } = pb;
  return { version: version2, domain: domain2, goals, required_fields, intents, flows, handoff_rules };
}
__name(simplifyPlaybook, "simplifyPlaybook");

// src/index.ts
function streamJsonLines(text) {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/);
  let i = 0;
  return new ReadableStream({
    start(controller) {
      function push() {
        if (i >= words.length) {
          controller.close();
          return;
        }
        const chunk = JSON.stringify({ response: words[i++] }) + "\n";
        controller.enqueue(encoder.encode(chunk));
        setTimeout(push, 10);
      }
      __name(push, "push");
      push();
    }
  });
}
__name(streamJsonLines, "streamJsonLines");
var src_default = {
  async fetch(req, env2) {
    const url = new URL(req.url);
    if (url.pathname === "/profiles" && req.method === "GET") {
      const items = Object.keys(PLAYBOOKS).map((id) => ({
        id,
        name: PLAYBOOKS[id].domain
      }));
      return Response.json({ profiles: items });
    }
    if (url.pathname === "/api/chat" && req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}));
        const message = (body.message ?? "").trim();
        if (!message)
          return Response.json(
            { error: 'campo "message" \xE9 obrigat\xF3rio' },
            { status: 400 }
          );
        let conversationId = body.conversationId;
        let conv = conversationId ? await getConversation(env2, conversationId) : void 0;
        if (!conv) {
          const created = await createConversation(env2, "t_clinica");
          conversationId = created.id;
          conv = await getConversation(env2, conversationId);
        }
        await insertMessage(env2, conversationId, "user", message);
        const tenantMap = {
          t_clinica: "clinica_demo",
          t_imob: "imobiliaria_demo"
        };
        const tenant = await getTenantById(env2, conv.tenant_id);
        const tenantSlug = tenant?.slug ?? "clinica_demo";
        const pb = PLAYBOOKS[tenantSlug];
        const phase = Number(conv.phase ?? 0);
        if (phase === 0) {
          await updateConversation(env2, conversationId, { phase: 1 });
          const stream = streamJsonLines(
            "Ol\xE1! Para come\xE7ar, qual \xE9 o seu nome?"
          );
          await insertMessage(
            env2,
            conversationId,
            "assistant",
            "Ol\xE1! Para come\xE7ar, qual \xE9 o seu nome?"
          );
          return new Response(stream, {
            headers: { "Content-Type": "application/json" }
          });
        }
        if (phase === 1) {
          await updateConversation(env2, conversationId, {
            phase: 2,
            nome: message
          });
          const reply = `Prazer, ${message}! Qual \xE9 o motivo do seu contato?`;
          await insertMessage(env2, conversationId, "assistant", reply);
          return new Response(streamJsonLines(reply), {
            headers: { "Content-Type": "application/json" }
          });
        }
        if (phase === 2) {
          await updateConversation(env2, conversationId, {
            phase: 3,
            motivo: message
          });
          const system = [
            buildSystemPrompt(pb),
            `NUNCA responda fora do dom\xEDnio "${pb.domain}". Se fugir do escopo, ofere\xE7a encaminhar para humano.`,
            `Responda em pt-BR, breve, com no m\xE1ximo uma pergunta por vez.`
          ].join("\n");
          const history = await listMessages(env2, conversationId, 12);
          const model = env2.MODEL ?? "@cf/meta/llama-3.1-8b-instruct";
          const userSummary = [
            "Gere uma sauda\xE7\xE3o de acolhimento e pr\xF3ximos passos, mantendo o contexto do dom\xEDnio.",
            `Nome: ${conv.nome ?? "cliente"}`,
            `Motivo: ${message}`
          ].join("\n");
          const result = await env2.AI.run(model, {
            messages: [
              { role: "system", content: system },
              ...history,
              { role: "user", content: userSummary }
            ]
          });
          const text = result?.response || "Obrigado! Vamos prosseguir com seu atendimento.";
          await insertMessage(env2, conversationId, "assistant", text);
          return new Response(streamJsonLines(text), {
            headers: { "Content-Type": "application/json" }
          });
        }
        {
          const system = buildSystemPrompt(pb);
          const history = await listMessages(env2, conversationId, 12);
          const model = env2.MODEL ?? "@cf/meta/llama-3.1-8b-instruct";
          const result = await env2.AI.run(model, {
            messages: [{ role: "system", content: system }, ...history]
          });
          const text = result?.response || "Certo, como posso ajudar?";
          await insertMessage(env2, conversationId, "assistant", text);
          return new Response(streamJsonLines(text), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (e) {
        return Response.json(
          { error: e?.message || "internal_error" },
          { status: 500 }
        );
      }
    }
    if (url.pathname === "/api/session" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const tenantSlug = body.tenantId ?? "clinica_demo";
      const tenantRow = await getTenantBySlug(env2, tenantSlug);
      if (!tenantRow) {
        return Response.json(
          { error: `tenant n\xE3o encontrado: ${tenantSlug}` },
          { status: 400 }
        );
      }
      const conv = await createConversation(env2, tenantRow.id);
      await insertMessage(
        env2,
        conv.id,
        "assistant",
        "Ol\xE1! Para come\xE7ar, qual \xE9 o seu nome?"
      );
      return Response.json({
        conversationId: conv.id,
        reply: "Ol\xE1! Para come\xE7ar, qual \xE9 o seu nome?",
        phase: 1
      });
    }
    if (url.pathname === "/" && req.method === "GET") {
    }
    return new Response("Not found", { status: 404 });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-AhLBBi/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-AhLBBi/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
