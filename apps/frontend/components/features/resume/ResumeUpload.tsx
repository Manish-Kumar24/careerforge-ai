// apps/frontend/components/features/resume/ResumeUpload.tsx

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { resumeApi } from "@/features/resume/api";
import { ResumeAnalysis } from "@/types/resume";

interface Props {
  onAnalysisComplete: (result: ResumeAnalysis) => void;
  onError: (message: string) => void;
}

export default function ResumeUpload({ onAnalysisComplete, onError }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing">("idle");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validation
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      onError("Only PDF and DOCX files are supported");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError("File size must be under 10MB");
      return;
    }

    try {
      setStatus("uploading");
      setStatus("analyzing");
      const result = await resumeApi.uploadResume(file);
      onAnalysisComplete(result);
    } catch (error: any) {
      console.error("Upload failed:", error);
      onError(error.response?.data?.error || "Failed to analyze resume");
    } finally {
      setStatus("idle");
    }
  }, [onAnalysisComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
          : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
        }
        ${status !== "idle" ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} disabled={status !== "idle"} />
      
      {status === "idle" && (
        <>
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {isDragActive ? "Drop your resume here" : "Drag & drop your resume, or click to browse"}
          </p>
          <p className="mt-2 text-xs text-gray-400">PDF or DOCX • Max 10MB</p>
        </>
      )}
      
      {status === "uploading" && (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <p className="mt-4 text-sm text-gray-600">Uploading resume...</p>
        </div>
      )}
      
      {status === "analyzing" && (
        <div className="flex flex-col items-center">
          <FileText className="h-12 w-12 text-blue-500 animate-pulse" />
          <p className="mt-4 text-sm text-gray-600">AI is analyzing your resume...</p>
          <p className="mt-1 text-xs text-gray-400">This may take ~15 seconds</p>
        </div>
      )}
    </div>
  );
}