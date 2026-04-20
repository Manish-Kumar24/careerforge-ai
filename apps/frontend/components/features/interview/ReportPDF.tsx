// apps/frontend/components/features/interview/ReportPDF.tsx

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ✅ @react-pdf uses a strict Flexbox/CSS subset. This stylesheet is optimized for it.
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1F2937",
    lineHeight: 1.4
  },
  header: { textAlign: "center" as const, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold" as const, marginBottom: 4, color: "#111827" },
  subtitle: { fontSize: 9, color: "#6B7280" },
  
  scoreSection: {
    textAlign: "center" as const,
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 6
  },
  scoreLabel: { fontSize: 9, color: "#6B7280", marginBottom: 2 },
  scoreValue: { fontSize: 28, fontWeight: "bold" as const, color: "#2563EB" },
  
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold" as const,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomStyle: "solid" as const,
    borderBottomColor: "#D1D5DB",
    paddingBottom: 3,
    color: "#374151"
  },
  row: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 3 },
  bulletRow: { flexDirection: "row" as const, marginBottom: 2 },
  bulletDot: { marginRight: 4, fontSize: 9 },
  bulletText: { fontSize: 9, flex: 1 },
  
  twoCol: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 16 },
  colHalf: { flex: 1 },
  
  qaBlock: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "solid" as const,
    borderColor: "#E5E7EB"
  },
  qaQuestion: { fontSize: 10, fontWeight: "bold" as const, marginBottom: 3, color: "#111827" },
  qaFeedback: { fontSize: 9, marginBottom: 4, color: "#4B5563" },
  qaAnswer: { fontSize: 8, color: "#6B7280", fontStyle: "italic" as const, marginTop: 2 },
  scoreBadge: {
    fontSize: 9,
    fontWeight: "bold" as const,
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start" as const,
    marginTop: 4
  },
  
  footer: {
    position: "absolute" as const,
    bottom: 25,
    left: 30,
    right: 30,
    textAlign: "center" as const,
    fontSize: 8,
    color: "#9CA3AF",
    borderTopWidth: 1,
    borderTopStyle: "solid" as const,
    borderTopColor: "#E5E7EB",
    paddingTop: 6
  }
});

// ✅ Safe bullet renderer
const BulletItem = ({ text }: { text: string }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bulletDot}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

interface ReportPDFProps {
  report: any;
  sessionId: string;
}

// ✅ UPDATED SAFER COMPONENT
const ReportPDF = ({ report, sessionId }: ReportPDFProps) => {
  // ✅ Comprehensive validation to prevent hasOwnProperty errors
  const safeReport = {
    overallScore: report?.overallScore ?? 0,
    categoryScores: report?.categoryScores && typeof report.categoryScores === 'object' 
      ? report.categoryScores 
      : {},
    strengths: Array.isArray(report?.strengths) ? report.strengths : [],
    improvements: Array.isArray(report?.improvements) ? report.improvements : [],
    perQuestionFeedback: Array.isArray(report?.perQuestionFeedback) ? report.perQuestionFeedback : [],
    meta: report?.meta && typeof report.meta === 'object' ? report.meta : {}
  };

  // Early return if report is completely invalid
  if (!report) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ textAlign: "center", marginTop: 100 }}>
            No report data available.
          </Text>
        </Page>
      </Document>
    );
  }

  const categories = Object.entries(safeReport.categoryScores) as [string, number][];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mock Interview Report</Text>
          <Text style={styles.subtitle}>
            Session: {sessionId?.slice(-8) || "N/A"} • {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Overall Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Overall Score</Text>
          <Text style={styles.scoreValue}>{safeReport.overallScore}/100</Text>
          {typeof safeReport.meta?.hintsUsed === 'number' && safeReport.meta.hintsUsed > 0 && (
            <Text style={styles.subtitle}>
              Hints Used: {safeReport.meta.hintsUsed}
            </Text>
          )}
        </View>

        {/* Category Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {categories.map(([key, val], i) => (
            <View key={i} style={styles.row}>
              <Text>{key.replace(/([A-Z])/g, " $1").trim()}</Text>
              <Text style={{ fontWeight: "bold" }}>
                {typeof val === 'number' ? val : 0}/100
              </Text>
            </View>
          ))}
        </View>

        {/* Strengths & Improvements */}
        <View style={styles.twoCol}>
          <View style={styles.colHalf}>
            <Text style={styles.sectionTitle}>✅ Strengths</Text>
            {safeReport.strengths.map((s, i) => (
              <BulletItem key={i} text={typeof s === 'string' ? s : ''} />
            ))}
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.sectionTitle}>🔧 Improvements</Text>
            {safeReport.improvements.map((s, i) => (
              <BulletItem key={i} text={typeof s === 'string' ? s : ''} />
            ))}
          </View>
        </View>

        {/* Per Question Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Per-Question Feedback</Text>
          {safeReport.perQuestionFeedback.map((q, i) => {
            const question = typeof q?.question === 'string' ? q.question : 'Unknown question';
            const feedback = typeof q?.feedback === 'string' ? q.feedback : '';
            const answer = typeof (q?.answerOriginal || q?.answer) === 'string' 
              ? (q.answerOriginal || q.answer) 
              : 'No answer provided';
            const score = typeof q?.score === 'number' ? q.score : 0;

            return (
              <View key={i} style={styles.qaBlock} wrap>
                <Text style={styles.qaQuestion}>
                  Q{i + 1}: {question.slice(0, 90)}
                  {question.length > 90 ? '...' : ''}
                </Text>
                <Text style={styles.qaFeedback}>{feedback}</Text>
                <Text style={styles.qaAnswer}>
                  Your answer: {answer.slice(0, 150)}
                  {answer.length > 150 ? '...' : ''}
                </Text>
                <View style={styles.scoreBadge}>
                  <Text>Score: {score}/100</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Generated by CareerForge AI • {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};

export default ReportPDF;