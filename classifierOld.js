//do not use, this was the OG confidence rating which was hot garbage, and should never see the light of day

import { pipeline } from "@xenova/transformers";

let classifier = null;

// Load the model once when the bot starts
async function loadClassifier() {
  console.log("Loading classifier model...");
  classifier = await pipeline(
    "zero-shot-classification",
    "Xenova/nli-deberta-v3-small",
  );
  console.log("Classifier ready!");
}

// Check if a message is a rotation complaint
async function isRotationComplaint(message) {
  if (!classifier) {
    throw new Error("Classifier not loaded yet");
  }

  const labels = ["complaint about map rotation", "other"];

  const result = await classifier(message, labels);

  // result.scores[0] is the score for the first label
  const complaintScore =
    result.scores[result.labels.indexOf("complaint about map rotation")];

  console.log(`Message: "${message}"`);
  console.log(`Complaint score: ${complaintScore}`);

  // Only flag as complaint if we're fairly confident (70% threshold)
  return complaintScore > 0.7;
}

export { loadClassifier, isRotationComplaint };
