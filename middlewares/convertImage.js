// import sharp
const sharp = require('sharp')
// import fs
const fs = require('fs')
// import path
const path = require('path')

async function convertImageFile(inputPath) {
    if (!inputPath) return null

    const inputStats = fs.statSync(inputPath)
    const inputSizeKB = inputStats.size / 1024

    const dir = path.dirname(inputPath)
    const baseName = path.basename(inputPath, path.extname(inputPath))
    const outputPath = path.join(dir, baseName + '.webp')

    fs.mkdirSync(dir, { recursive: true })

    if (inputSizeKB < 500) {
        await sharp(inputPath)
            .rotate()
            .webp({ quality: 80 })
            .toFile(outputPath)
    } else {
        let quality = 75
        let success = false
        while (quality >= 5) {
            await sharp(inputPath)
                .rotate()
                .webp({ quality })
                .toFile(outputPath)

            const outputStats = fs.statSync(outputPath)
            const outputSizeKB = outputStats.size / 1024
            if (outputSizeKB <= 500) {
                success = true
                break
            }
            quality -= 10
        }

        if (!success) {
            // Keep last produced output even if > 500KB
        }
    }

    try { fs.unlinkSync(inputPath) } catch (_) {}

    const newStats = fs.statSync(outputPath)
    return { outputPath, size: newStats.size }
}

module.exports = { convertImageFile }


