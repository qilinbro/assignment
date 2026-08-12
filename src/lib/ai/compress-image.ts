/**
 * 图片压缩算法 —— 用于把作业图片压缩后再发给 GLM-4V
 *
 * 背景：学生上传的作业图片往往 2~5MB，多张拼接成 base64 会超出 GLM 请求体上限，触发 400。
 * 策略：
 *   1. 缩放：长边超过 maxSize 时等比缩小（视觉模型 1568px 已足够清晰阅读手写/印刷文字）
 *   2. 降质：统一转 JPEG 并设质量（80 兼顾体积与可读性）
 *   3. 迭代：若一次压缩后仍超 targetBytes，逐步降质量直到达标或触底
 *
 * 输出为 data URL（base64），可直接塞进 GLM 的 image_url 字段。
 */

import sharp from "sharp";

export interface CompressOptions {
  /** 缩放后长边像素上限（默认 1568，GLM-4V 推荐分辨率） */
  maxSize?: number;
  /** 压缩后字节上限（默认 1.5MB，base64 后约 2MB，远低于 GLM 单图上限） */
  targetBytes?: number;
  /** 起始 JPEG 质量（默认 80） */
  initialQuality?: number;
  /** 最低 JPEG 质量（默认 40，再低文字难辨认） */
  minQuality?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxSize: 1568,
  targetBytes: 1.5 * 1024 * 1024,
  initialQuality: 80,
  minQuality: 40,
};

/**
 * 把任意图片 Buffer 压缩为 JPEG Buffer。
 * 先按长边缩放，再迭代降质量直到体积达标或触底。
 */
export async function compressImage(
  input: Buffer,
  options: CompressOptions = {}
): Promise<Buffer> {
  const { maxSize, targetBytes, initialQuality, minQuality } = {
    ...DEFAULTS,
    ...options,
  };

  let image = sharp(input, { failOn: "none" }).rotate(); // 自动按 EXIF 旋转

  // 等比缩放：长边不超过 maxSize
  image = image.resize({
    width: maxSize,
    height: maxSize,
    fit: "inside",
    withoutEnlargement: true, // 小图不放大
  });

  // 迭代降质量
  let quality = initialQuality;
  let buf = await image.jpeg({ quality, mozjpeg: true }).toBuffer();

  while (buf.length > targetBytes && quality > minQuality) {
    quality -= 10;
    // resize 已确定，这里只重新编码；重新构建 pipeline 以改质量
    buf = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }

  return buf;
}

/**
 * 便捷封装：拉取图片 URL → 压缩 → 返回 base64 data URL。
 * 失败返回 null。
 */
export async function fetchCompressedImageAsBase64(
  url: string,
  options?: CompressOptions
): Promise<string | null> {
  try {
    const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
    const res = await fetch(fullUrl);
    if (!res.ok) return null;

    const raw = Buffer.from(await res.arrayBuffer());
    const compressed = await compressImage(raw, options);
    return `data:image/jpeg;base64,${compressed.toString("base64")}`;
  } catch {
    return null;
  }
}
