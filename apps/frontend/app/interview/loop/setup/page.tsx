// filepath: apps/frontend/app/interview/loop/setup/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { interviewApi } from "@/features/interview/api";
import { Info } from "lucide-react";

// Company templates with FIXED round configurations
const TEMPLATES = [
  {
    key: "meta_sde_2025",
    company: "Meta",
    role: "Software Engineer",
    description: "3 rounds: DSA → System Design → Behavioral",
    rounds: [
      { num: 1, type: "DSA", difficulty: "MEDIUM", duration: 45, dayOffset: 0 },
      { num: 2, type: "SYSTEM_DESIGN", difficulty: "MEDIUM", duration: 45, dayOffset: 3 },
      { num: 3, type: "BEHAVIORAL", difficulty: "MEDIUM", duration: 45, dayOffset: 6 }
    ]
  },
  {
    key: "google_swe_l3",
    company: "Google",
    role: "Software Engineer (L3)",
    description: "4 rounds: 2x DSA + System Design + Behavioral",
    rounds: [
      { num: 1, type: "DSA", difficulty: "MEDIUM", duration: 45, dayOffset: 0 },
      { num: 2, type: "DSA", difficulty: "HARD", duration: 45, dayOffset: 3 },
      { num: 3, type: "SYSTEM_DESIGN", difficulty: "MEDIUM", duration: 45, dayOffset: 6 },
      { num: 4, type: "BEHAVIORAL", difficulty: "EASY", duration: 30, dayOffset: 8 }
    ]
  },
  {
    key: "amazon_sde_i",
    company: "Amazon",
    role: "SDE I",
    description: "3 rounds: Technical → Behavioral → System Design",
    rounds: [
      { num: 1, type: "DSA", difficulty: "MEDIUM", duration: 60, dayOffset: 0 },
      { num: 2, type: "BEHAVIORAL", difficulty: "MEDIUM", duration: 45, dayOffset: 4 },
      { num: 3, type: "SYSTEM_DESIGN", difficulty: "MEDIUM", duration: 45, dayOffset: 7 }
    ]
  }
];

export default function LoopSetup() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0].key);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // ✅ Personalization state (merged correctly)
  const [personalization, setPersonalization] = useState({
    resumeText: "",
    jdText: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true); setError(null);
  
  try {
    // ✅ FIX: Look up the full template object from selectedTemplate key
    const tpl = TEMPLATES.find(t => t.key === selectedTemplate);
    if (!tpl) {
      throw new Error("Invalid template selected");
    }

    // Step 1: Create the loop
    console.log("🔄 Creating loop:", tpl.key);
    const loopRes = await interviewApi.createLoop({
      company: tpl.company,
      role: tpl.role,
      templateKey: tpl.key,
      resumeText: personalization.resumeText?.slice(0, 5000) || "",
      jdText: personalization.jdText?.slice(0, 5000) || ""
    });
    console.log("✅ Loop created:", loopRes.loopId);

    // Step 2: Immediately start Round 1
    console.log("🔄 Starting Round 1 for loop:", loopRes.loopId);
    const sessionRes = await interviewApi.startLoopRound(loopRes.loopId, 1);
    console.log("✅ Session started:", sessionRes.sessionId);

    // Step 3: Redirect to session
    router.push(`/interview/session/${sessionRes.sessionId}`);
    
  } catch (err: any) {
    // ✅ Surface actual error for debugging
    console.error("❌ Full error object:", err);
    console.error("❌ Server response:", err.response?.data);
    console.error("❌ HTTP status:", err.response?.status);
    
    const serverMsg = err.response?.data?.error || err.response?.data?.message;
    const fallbackMsg = err.message || "Failed to start loop";
    
    setError(serverMsg || fallbackMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Company Interview Loop
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Simulate a real hiring pipeline. Round formats, difficulty, and timing are predefined by the company.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Loop interviews use fixed formats. For custom difficulty/duration, use{" "}
          <button
            onClick={() => router.push("/interview/practice")}
            className="underline font-medium"
          >
            Quick Practice
          </button>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Company & Role
          </label>

          {TEMPLATES.map(tpl => {
            const isSelected = selectedTemplate === tpl.key;
            const isExpanded = showDetails === tpl.key;

            return (
              <div
                key={tpl.key}
                className={`border rounded-xl overflow-hidden transition-all ${isSelected
                    ? "border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
              >
                <label className="flex items-start p-4 cursor-pointer bg-white dark:bg-gray-800">
                  <input
                    type="radio"
                    name="template"
                    value={tpl.key}
                    checked={isSelected}
                    onChange={() => setSelectedTemplate(tpl.key)}
                    className="mt-1 mr-3 h-4 w-4 text-purple-600"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {tpl.company} • {tpl.role}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {tpl.description}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDetails(isExpanded ? null : tpl.key);
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {isExpanded ? "Hide Details" : "View Rounds"}
                      </button>
                    </div>
                  </div>
                </label>

                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                    <div className="space-y-2 pt-3">
                      {tpl.rounds.map(round => (
                        <div
                          key={round.num}
                          className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded"
                        >
                          <span className="font-medium">
                            Round {round.num}: {round.type.replace("_", " / ")}
                          </span>
                          <div className="flex gap-3 text-gray-600 dark:text-gray-400">
                            <span>{round.difficulty}</span>
                            <span>•</span>
                            <span>{round.duration} min</span>
                            <span>•</span>
                            <span>Day +{round.dayOffset}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ✅ PERSONALIZATION SECTION */}
        <div className="space-y-4 mt-6 pt-6 border-t dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Personalization (Optional)
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resume Text
            </label>
            <textarea
              value={personalization.resumeText} // or personalization.jdText
              onChange={(e) => setPersonalization({ ...personalization, resumeText: e.target.value })}
              placeholder="Paste resume for tailored questions..." // or JD placeholder
              rows={3}
              className="w-full p-2.5 border rounded-lg 
             bg-white dark:bg-gray-800 
             text-gray-900 dark:text-gray-100 
             border-gray-300 dark:border-gray-600 
             font-mono text-sm 
             placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Description
            </label>
            <textarea
              value={personalization.jdText} // or personalization.jdText
              onChange={(e) => setPersonalization({ ...personalization, jdText: e.target.value })}
              placeholder="Paste JD for role-specific tailoring..." // or JD placeholder
              rows={3}
              className="w-full p-2.5 border rounded-lg 
             bg-white dark:bg-gray-800 
             text-gray-900 dark:text-gray-100 
             border-gray-300 dark:border-gray-600 
             font-mono text-sm 
             placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <p className="text-xs text-gray-400">
            Text is injected into AI prompts only. Never stored in database.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {loading
            ? "Creating Loop..."
            : `Start ${TEMPLATES.find(t => t.key === selectedTemplate)?.company} Interview Loop`}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t dark:border-gray-700 text-center text-sm text-gray-500">
        <p>
          Want custom settings?{" "}
          <button
            onClick={() => router.push("/interview/practice")}
            className="text-purple-600 hover:underline font-medium"
          >
            Try Quick Practice instead
          </button>
        </p>
      </div>
    </div>
  );
}