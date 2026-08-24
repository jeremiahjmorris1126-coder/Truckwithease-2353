// Runware AI Image Generation Service
// Powers Game Up training visuals, HRease job post images, accident scene diagrams

const RUNWARE_KEY_STORAGE = 'runware_api_key';

export function hasRunwareKey() {
  try {
    const saved = localStorage.getItem('twe_platform_keys');
    if (saved) {
      const keys = JSON.parse(saved);
      return !!(keys.runware_api_key);
    }
  } catch(e) {}
  return false;
}

export function getRunwareKey() {
  try {
    const saved = localStorage.getItem('twe_platform_keys');
    if (saved) {
      const keys = JSON.parse(saved);
      return keys.runware_api_key || null;
    }
  } catch(e) {}
  return null;
}

// Generate a training module image for Game Up
export async function generateTrainingImage(moduleTitle, scenario) {
  const key = getRunwareKey();
  if (!key) return null;

  const prompt = `Professional trucking training illustration for "${moduleTitle}": ${scenario}. Clean, clear, educational style. Dark background with gold accents. No text overlay.`;

  try {
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify([{
        taskType: 'imageInference',
        taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        width: 512,
        height: 512,
        model: 'runware:100@1',
        numberResults: 1,
        outputFormat: 'WEBP',
      }])
    });
    const data = await response.json();
    if (data?.data?.[0]?.imageURL) return data.data[0].imageURL;
  } catch(e) {}
  return null;
}

// Generate a job posting image for HRease
export async function generateJobPostingImage(role, location, pay) {
  const key = getRunwareKey();
  if (!key) return null;

  const prompt = `Professional trucking job advertisement visual for ${role} position in ${location} paying ${pay}. Bold, attractive, dark background with gold and white text areas. Truck on highway at sunrise. No actual text.`;

  try {
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify([{
        taskType: 'imageInference',
        taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        width: 1024,
        height: 512,
        model: 'runware:100@1',
        numberResults: 1,
        outputFormat: 'WEBP',
      }])
    });
    const data = await response.json();
    if (data?.data?.[0]?.imageURL) return data.data[0].imageURL;
  } catch(e) {}
  return null;
}

// Generate an accident scene diagram
export async function generateAccidentDiagram(description) {
  const key = getRunwareKey();
  if (!key) return null;

  const prompt = `Clear accident scene diagram for insurance report: ${description}. Top-down view, road markings visible, vehicles shown as simple shapes with arrows indicating direction of travel. Clean, professional, black and white with red highlights.`;

  try {
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify([{
        taskType: 'imageInference',
        taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        width: 512,
        height: 512,
        model: 'runware:100@1',
        numberResults: 1,
        outputFormat: 'WEBP',
      }])
    });
    const data = await response.json();
    if (data?.data?.[0]?.imageURL) return data.data[0].imageURL;
  } catch(e) {}
  return null;
}

export default { hasRunwareKey, getRunwareKey, generateTrainingImage, generateJobPostingImage, generateAccidentDiagram };
