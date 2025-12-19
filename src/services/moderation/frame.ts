import fs from "fs";
import * as tf from "@tensorflow/tfjs-node";
import * as nsfw from "nsfwjs";
import Tesseract from "tesseract.js";
import { Filter } from "bad-words";

const profanity = new Filter();

let nsfwModel: any = null;

async function ensureModel() {
  if (!nsfwModel) {
    nsfwModel = await nsfw.load();
  }
  return nsfwModel;
}

type FrameResult = {
  frame: string;
  unsafeProb: number;
  severityScore: number; 
  ocrText: string;
  ocrFlag: boolean;
  ocrScore: number; 
  totalFrameScore: number; 
};

type ModerationOutcome = {
  flagged: boolean;
  reason: string | null;
  avgScore: number;
  totalVideoScore: number;
  totalFrames: number;
  frameResults: FrameResult[];
  metrics: {
    flaggedFrames: number;
    highSeverityFrames: number;
    ocrHits: number;
    flaggedRatio: number;
    ocrRatio: number;
  };
};

function getUnsafeProb(preds: { className: string; probability: number }[]) {
  let maxUnsafe = -1;
  for (const p of preds) {
    if (["Porn", "Hentai", "Sexy"].includes(p.className)) {
      maxUnsafe = Math.max(maxUnsafe, p.probability);
    }
  }
  return maxUnsafe;
}

function mapSeverityScore(prob: number) {
  if (prob >= 0.98) return 100;
  if (prob >= 0.95) return 90;
  if (prob >= 0.9) return 80;
  if (prob >= 0.8) return 60;
  if (prob >= 0.6) return 40;
  if (prob >= 0.4) return 20;
  if (prob >= 0.2) return 8;
  if (prob >= 0.1) return 4;
  return 0;
}

function normalizeOCR(raw: string) {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isMeaningfulText(s: string) {
  if (!s) return false;
  if (s.length < 3) return false;
  const words = s.split(" ").filter(Boolean);
  return words.some((w) => /[a-z]{2,}/.test(w));
}

export async function frameModeration(
  framePaths: string[]
): Promise<ModerationOutcome> {
  if (!framePaths || framePaths.length === 0) {
    return {
      flagged: false,
      reason: null,
      avgScore: 0,
      totalVideoScore: 0,
      totalFrames: 0,
      frameResults: [],
      metrics: {
        flaggedFrames: 0,
        highSeverityFrames: 0,
        ocrHits: 0,
        flaggedRatio: 0,
        ocrRatio: 0,
      },
    };
  }

  const model = await ensureModel();
  const frameResults: FrameResult[] = [];

  const HIGH_SEVERITY_PROB = 0.95; 
  const AVERAGE_SCORE_THRESHOLD = 25; 
  const FLAGGED_FRAME_PROB = 0.6; 
  const RATIO_THRESHOLD = 0.05; 
  const OCR_FRAME_BONUS = 30;

  for (const framePath of framePaths) {
    try {
      const buf = await fs.promises.readFile(framePath);
      const tensor = tf.node.decodeImage(buf, 3) as tf.Tensor3D;

      let preds;
      try {
        preds = await model.classify(tensor);
      } catch (e) {
        preds = [{ className: "Neutral", probability: 1 }];
      } finally {
        tensor.dispose();
      }
      const unsafeProb = getUnsafeProb(preds);
      const severityScore = mapSeverityScore(unsafeProb);
      let rawOcr = "";
      try {
        const ocrRes = await Tesseract.recognize(framePath, "eng", {
          logger: () => {},
        });
        rawOcr =
          ocrRes && (ocrRes as any).data && (ocrRes as any).data.text
            ? (ocrRes as any).data.text
            : "";
      } catch {
        rawOcr = "";
      }

      const cleaned = normalizeOCR(rawOcr);
      const meaningful = isMeaningfulText(cleaned);
      const ocrProfane = meaningful && profanity.isProfane(cleaned);
      const ocrFlag = Boolean(ocrProfane && meaningful);
      const ocrScore = ocrFlag ? OCR_FRAME_BONUS : 0;

      const totalFrameScore = severityScore + ocrScore;

      frameResults.push({
        frame: framePath,
        unsafeProb,
        severityScore,
        ocrText: cleaned,
        ocrFlag,
        ocrScore,
        totalFrameScore,
      });
    } catch (err) {
      console.error("Error in frame analysis", framePath, err);
      frameResults.push({
        frame: framePath,
        unsafeProb: 0,
        severityScore: 0,
        ocrText: "",
        ocrFlag: false,
        ocrScore: 0,
        totalFrameScore: 0,
      });
    }
  }

  framePaths.forEach((path) => fs.unlinkSync(path));

  const totalFrames = frameResults.length;
  const totalVideoScore = frameResults.reduce(
    (s, f) => s + f.totalFrameScore,
    0
  ); 
  const avgScore = totalVideoScore / totalFrames;

  const flaggedFrames = frameResults.filter(
    (f) => f.unsafeProb >= FLAGGED_FRAME_PROB
  ).length;

  const highSeverityFrames = frameResults.filter(
    (f) => f.unsafeProb >= HIGH_SEVERITY_PROB
  ).length;

  const ocrHits = frameResults.filter((f) => f.ocrFlag).length;
  const flaggedRatio = flaggedFrames / totalFrames;
  const ocrRatio = ocrHits / totalFrames;

  if (highSeverityFrames >= 1) {
    return {
      flagged: true,
      reason: "high_severity_frame",
      avgScore,
      totalVideoScore,
      totalFrames,
      frameResults,
      metrics: {
        flaggedFrames,
        highSeverityFrames,
        ocrHits,
        flaggedRatio,
        ocrRatio,
      },
    };
  }

  if (avgScore >= AVERAGE_SCORE_THRESHOLD) {
    return {
      flagged: true,
      reason: "average_score_threshold",
      avgScore,
      totalVideoScore,
      totalFrames,
      frameResults,
      metrics: {
        flaggedFrames,
        highSeverityFrames,
        ocrHits,
        flaggedRatio,
        ocrRatio,
      },
    };
  }

  if (flaggedRatio >= RATIO_THRESHOLD || ocrRatio >= 0.02) {
    return {
      flagged: true,
      reason: "frequency_based",
      avgScore,
      totalVideoScore,
      totalFrames,
      frameResults,
      metrics: {
        flaggedFrames,
        highSeverityFrames,
        ocrHits,
        flaggedRatio,
        ocrRatio,
      },
    };
  }

  return {
    flagged: false,
    reason: null,
    avgScore,
    totalVideoScore,
    totalFrames,
    frameResults,
    metrics: {
      flaggedFrames,
      highSeverityFrames,
      ocrHits,
      flaggedRatio,
      ocrRatio,
    },
  };
}
