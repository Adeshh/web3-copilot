async function testAnalyzer() {
  console.log("🚀 Requesting Smart Contract Audit for USDT (0xdAC17F958D2ee523a2206206994597C13D831ec7)...");
  console.log("Waiting for AI analysis... (This might take 10-15 seconds for a large contract)\n");

  try {
    const res = await fetch("http://localhost:3000/api/contract-analyzer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error("❌ Error from API:", data);
      return;
    }

    console.log("✅ AUDIT COMPLETE!\n");
    console.dir(data, { depth: null, colors: true });

  } catch (err: any) {
    console.error("❌ Request Failed:", err.message);
  }
}

testAnalyzer();
