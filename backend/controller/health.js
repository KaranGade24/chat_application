import os from "os";
import fs from "fs/promises";
import checkDiskSpace from "check-disk-space";

/* ---------- Helpers ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatBytes(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "N/A";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatUptime(seconds) {
  if (!Number.isFinite(seconds)) return "N/A";
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function simplifyNetworkInterfaces(rawIfaces) {
  const out = {};
  for (const [name, addrs] of Object.entries(rawIfaces)) {
    out[name] = addrs.map((a) => ({
      address: a.address,
      family: a.family,
      mac: a.mac,
      internal: a.internal,
      cidr: a.cidr,
    }));
  }
  return out;
}

/* sample CPU usage over short interval to compute percent */
async function sampleCpuUsage(intervalMs = 100) {
  const start = os.cpus();
  const procStart = process.cpuUsage(); // microseconds
  await sleep(intervalMs);
  const end = os.cpus();
  const procEnd = process.cpuUsage();

  // per-core usage percent
  const perCore = start.map((sCore, idx) => {
    const eCore = end[idx];
    const sTimes = sCore.times;
    const eTimes = eCore.times;

    const sTotal = Object.values(sTimes).reduce((a, b) => a + b, 0);
    const eTotal = Object.values(eTimes).reduce((a, b) => a + b, 0);

    const totalDelta = eTotal - sTotal;
    const idleDelta = eTimes.idle - sTimes.idle;
    const usagePercent =
      totalDelta > 0 ? (1 - idleDelta / totalDelta) * 100 : 0;

    return {
      model: eCore.model,
      speed: eCore.speed,
      usagePercent: Number(usagePercent.toFixed(2)),
      times: {
        user: eTimes.user - sTimes.user,
        nice: eTimes.nice - sTimes.nice,
        sys: eTimes.sys - sTimes.sys,
        idle: eTimes.idle - sTimes.idle,
        irq: eTimes.irq - sTimes.irq,
      },
    };
  });

  // overall system CPU usage
  const startTotals = start.reduce(
    (acc, c) => {
      const t = Object.values(c.times).reduce((a, b) => a + b, 0);
      acc.total += t;
      acc.idle += c.times.idle;
      return acc;
    },
    { total: 0, idle: 0 }
  );

  const endTotals = end.reduce(
    (acc, c) => {
      const t = Object.values(c.times).reduce((a, b) => a + b, 0);
      acc.total += t;
      acc.idle += c.times.idle;
      return acc;
    },
    { total: 0, idle: 0 }
  );

  const totalDelta = endTotals.total - startTotals.total;
  const idleDelta = endTotals.idle - startTotals.idle;
  const overallUsage = totalDelta > 0 ? (1 - idleDelta / totalDelta) * 100 : 0;

  // process CPU %
  const procDeltaMicros =
    procEnd.user + procEnd.system - (procStart.user + procStart.system);
  const procDeltaMs = procDeltaMicros / 1000; // convert to ms
  const numCpus = os.cpus().length || 1;
  const procCpuPercent = (procDeltaMs / (intervalMs * numCpus)) * 100;

  return {
    overall: Number(overallUsage.toFixed(2)),
    perCore,
    processPercent: Number(procCpuPercent.toFixed(2)),
    sampledMs: intervalMs,
    numCpus,
  };
}

/* fetch file descriptor count (Linux) */
async function getFdCount() {
  try {
    // /proc/self/fd exists on Linux/container environments
    const list = await fs.readdir("/proc/self/fd");
    return list.length;
  } catch (e) {
    // not available on non-linux or restricted containers
    return null;
  }
}

/* disk info for interesting mount points */
async function getDiskInfo(paths = ["/", process.cwd()]) {
  const out = {};
  for (const p of paths) {
    try {
      const ds = await checkDiskSpace(p);
      out[p] = {
        size: ds.size,
        free: ds.free,
        used: ds.size - ds.free,
        pretty: {
          size: formatBytes(ds.size),
          free: formatBytes(ds.free),
          used: formatBytes(ds.size - ds.free),
          percentUsed: `${(((ds.size - ds.free) / ds.size) * 100).toFixed(2)}%`,
        },
      };
    } catch (err) {
      out[p] = { error: String(err) };
    }
  }
  return out;
}

/* ---------- Health route ---------- */
export const health = async (req, res) => {
  try {
    const startTime = Date.now();
    // gather synchronous values quickly
    const memory = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // sample CPU usage (system + process) over 100ms (tunable)
    const cpuSample = await sampleCpuUsage(100);

    // disk info (root and cwd)
    const diskInfo = await getDiskInfo(["/", process.cwd()]);

    // FD count (if available)
    const fdCount = await getFdCount();

    // network simplified
    const netIfaces = simplifyNetworkInterfaces(os.networkInterfaces());

    const payload = {
      status: "ok",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime, // how long the health endpoint took to compute

      process: {
        pid: process.pid,
        nodeVersion: process.version,
        argv: process.argv,
        execPath: process.execPath,
        uptime: {
          raw: process.uptime(),
          pretty: formatUptime(process.uptime()),
        },
        memory: {
          raw: memory,
          pretty: {
            rss: formatBytes(memory.rss),
            heapTotal: formatBytes(memory.heapTotal),
            heapUsed: formatBytes(memory.heapUsed),
            external: formatBytes(memory.external),
          },
        },
        cpuUsageRaw: process.cpuUsage(), // microseconds since process start
        cpu: {
          processPercent: `${cpuSample.processPercent}%`,
          numCpus: cpuSample.numCpus,
        },
        fdCount, // may be null if not available
      },

      system: {
        hostname: os.hostname(),
        os: `${os.type()} ${os.release()} (${os.platform()} ${os.arch()})`,
        uptime: {
          raw: os.uptime(),
          pretty: formatUptime(os.uptime()),
        },
        loadAverage: os.loadavg().map((n) => Number(n.toFixed(2))),
        memory: {
          total: {
            raw: totalMem,
            pretty: formatBytes(totalMem),
          },
          free: {
            raw: freeMem,
            pretty: formatBytes(freeMem),
          },
          used: {
            raw: usedMem,
            pretty: formatBytes(usedMem),
          },
          usagePercent: `${((usedMem / totalMem) * 100).toFixed(2)}%`,
        },
        cpu: {
          count: os.cpus().length,
          model: os.cpus()[0]?.model ?? "N/A",
          speedMHz: os.cpus()[0]?.speed ?? 0,
          overallUsagePercent: `${cpuSample.overall}%`,
          perCore: cpuSample.perCore,
        },
        networkInterfaces: netIfaces,
        disks: diskInfo,
      },

      // metadata about this report
      meta: {
        sampledCpuMs: cpuSample.sampledMs,
        generatedAt: new Date().toISOString(),
      },
    };

    res.status(200).json(payload);
  } catch (err) {
    console.error("Health endpoint error:", err);
    res.status(500).json({ status: "error", error: String(err) });
  }
};
