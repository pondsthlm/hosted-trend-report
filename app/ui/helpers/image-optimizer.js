import logger from "../../logger";

const imageAspectRatios = {
  "16x9": ["16x9", "16x6", "4x3", "1x1"],
  "16x6": ["16x6", "16x9", "4x3", "1x1"],
  "4x3": ["4x3", "16x9", "16x6", "1x1"],
  "1x1": ["1x1", "16x9", "16x6", "4x3"],
};

const getOptimizedImageUrl = (image, aspectRatio = "16x9", maxSize = 1350) => {
  if (!image || !image.versions || image.versions.length < 1) {
    logger.error("Missing image or versions");
    return null;
  }

  let imageRatioArray = imageAspectRatios[aspectRatio];
  if (!imageRatioArray) {
    imageRatioArray = imageAspectRatios["16x9"];
  }

  const selectedRatio = imageRatioArray.find((ratio) => {
    return image.versions.find((version) => {
      return version.aspectRatio === ratio;
    });
  });

  let selectedVersion = image.versions.find((version) => {
    return version.aspectRatio === selectedRatio;
  });
  if (!selectedVersion) {
    selectedVersion = image.versions[0];
  }

  if (!selectedVersion.url) {
    logger.error("Missing image url");
    return null;
  }

  return selectedVersion.url.replace("original", maxSize).replace(".png", ".jpg");
};

export default getOptimizedImageUrl;
