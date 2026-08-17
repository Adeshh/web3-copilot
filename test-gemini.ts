import { generateReply } from "./ai/gemini";
generateReply([{ role: "USER", content: "What is the ETH balance of vitalik.eth?" }])
  .then(console.log)
  .catch(console.error);
