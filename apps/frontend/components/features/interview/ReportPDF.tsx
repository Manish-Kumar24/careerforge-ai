// filepath: apps/frontend/components/features/interview/ReportPDF.tsx

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  title: { fontSize: 20, fontWeight: "bold" as const, marginBottom: 10 },
  score: { fontSize: 28, fontWeight: "bold" as const, color: "#2563EB", marginBottom: 20 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: "bold" as const, marginBottom: 5 },
  row: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 4,
    borderBottom: 1,
    borderBottomColor: "#E5E7EB"
  },
  text: { fontSize: 11 },
  questionBlock: { marginBottom: 8 },
  questionTitle: { fontWeight: "bold" as const },
  scoreText: { color: "#6B7280" as const }
});

// ✅ FIX: Define report prop type locally (avoids circular dependency with types/interview.ts)
type ReportData = {
  overallScore: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  improvements: string[];
  perQuestionFeedback: Array<{
    questionIndex: number;
    question: string;
    feedback: string;
    score: number;
    answerOriginal?: string;  // ✅ NEW
    didNotAnswer?: boolean;
  }>;
  meta?: { hintsUsed: number };
};

// ✅ FIX: Explicit return type for @react-pdf compatibility
const ReportPDF = ({ report }: { report: ReportData }): React.ReactElement => {
  // ✅ FIX: Safe typed iteration
  const categoryEntries = Object.entries(report.categoryScores) as [string, number][];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Mock Interview Report</Text>
        <Text style={styles.score}>{report.overallScore}/100</Text>
        {/* ✅ POLISH: Show hints used in PDF */}
        {report.meta?.hintsUsed !== undefined && report.meta.hintsUsed > 0 && (
          <Text style={{ fontSize: 10, color: "#6B7280", marginBottom: 10 }}>
            Hints used: {report.meta.hintsUsed}
          </Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {categoryEntries.map(([k, v], i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.text}>{k.replace(/([A-Z])/g, " $1").trim()}</Text>
              <Text style={styles.text}>{v}/100</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strengths</Text>
          {report.strengths.map((s, i) => (
            <Text key={i} style={styles.text}>• {s}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas for Improvement</Text>
          {report.improvements.map((s, i) => (
            <Text key={i} style={styles.text}>• {s}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Per-Question Feedback</Text>
          {report.perQuestionFeedback.map((q, i) => (
            <View key={i} style={styles.questionBlock}>
              <Text style={styles.questionTitle}>
                Q{q.questionIndex}: {q.question}
                {/* ✅ POLISH: Show no-answer indicator */}
                {q.didNotAnswer ? " (No answer)" : ""}
              </Text>
              <Text style={styles.text}>{q.feedback}</Text>
              <Text style={{ ...styles.text, ...styles.scoreText }}>Score: {q.score}/100</Text>
              {/* ✅ POLISH: Show original answer if available */}
              {q.answerOriginal && (
                <Text style={{ fontSize: 9, color: "#9CA3AF", marginTop: 2, fontStyle: "italic" }}>
                  Your answer: {q.answerOriginal.slice(0, 200)}{q.answerOriginal.length > 200 ? "..." : ""}
                </Text>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;