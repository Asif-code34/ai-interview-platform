// async function transcribeInterviewAudio(buffer) {
//   try {
//     const response = await fetch(
//       "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&filler_words=true",
//       {
//         method: "POST",

//         headers: {
//           Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
//           "Content-Type": "audio/webm",
//         },

//         body: buffer,
//       },
//     );

//     const data = await response.json();

//     const transcript = data.results.channels[0].alternatives[0].transcript;

//     return transcript;
//   } catch (error) {
//     console.log("DEEPGRAM ERROR:", error);

//     throw error;
//   }
// }

// module.exports = {
//   transcribeInterviewAudio,
// };

const DEEPGRAM_URL = "https://api.deepgram.com/v1/listen";

const REQUEST_TIMEOUT_MS = 30_000;

function createTimeoutSignal(ms) {
  return AbortSignal.timeout(ms);
}

async function transcribeInterviewAudio(buffer, mimeType = "audio/webm") {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY is not configured");
  }

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Invalid audio buffer");
  }

  const url = new URL(DEEPGRAM_URL);

  url.searchParams.set("model", "nova-2");
  url.searchParams.set("smart_format", "true");
  url.searchParams.set("punctuate", "true");
  url.searchParams.set("filler_words", "true");

  let response;

  try {
    response = await fetch(url, {
      method: "POST",

      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": mimeType,
      },

      body: buffer,

      signal: createTimeoutSignal(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error("Speech transcription timed out");
    }

    throw new Error(`Speech transcription request failed: ${error.message}`);
  }

  const rawText = await response.text();

  let data;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error("Invalid response from speech provider");
  }

  if (!response.ok) {
    console.error("Deepgram API error:", {
      status: response.status,
      response: data,
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Speech service authentication failed");
    }

    if (response.status === 429) {
      throw new Error("Speech service rate limit exceeded");
    }

    throw new Error(
      data?.err_msg ||
        data?.message ||
        `Speech provider failed with status ${response.status}`,
    );
  }

  const transcript =
    data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

  if (typeof transcript !== "string") {
    throw new Error("Speech provider returned no transcript");
  }

  return transcript.trim();
}

module.exports = {
  transcribeInterviewAudio,
};
