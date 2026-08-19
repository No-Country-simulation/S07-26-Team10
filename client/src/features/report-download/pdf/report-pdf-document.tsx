import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type {
  FullReport,
  FullReportCategory,
  FullReportReference,
  FullReportSection,
} from "@/features/report-download/types/report";

interface ReportPdfDocumentProps {
  report: FullReport;
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 48,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: "#1a1a1a",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#8a8f8c",
    borderTopWidth: 0.5,
    borderTopColor: "#d9d9d6",
    paddingTop: 6,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 14,
    color: "#08201a",
  },
  coverMeta: {
    fontSize: 9.5,
    color: "#4a4a4a",
    marginBottom: 3,
  },
  coverDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#08201a",
    marginVertical: 18,
  },
  summaryLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#00603a",
    marginBottom: 6,
  },
  summary: {
    fontSize: 11,
    color: "#333",
    marginBottom: 14,
  },
  citation: {
    fontSize: 9,
    color: "#555",
    fontStyle: "italic",
    marginTop: 14,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#08201a",
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#c9a961",
    paddingBottom: 4,
  },
  sectionContent: {
    fontSize: 10,
    color: "#2a2a2a",
  },
  resourceBlock: {
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: "#c9a961",
  },
  resourceTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#555",
  },
  resourceUrl: {
    fontSize: 8,
    color: "#8a8f8c",
  },
  categoryBlock: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#00603a",
    marginBottom: 4,
  },
  conceptRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 10,
  },
  conceptName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#2a2a2a",
    width: 140,
  },
  conceptDesc: {
    fontSize: 9.5,
    color: "#444",
    flex: 1,
  },
  referenceBlock: {
    marginBottom: 9,
  },
  referenceText: {
    fontSize: 9.5,
    color: "#333",
  },
  referenceUrl: {
    fontSize: 8.5,
    color: "#00603a",
    marginTop: 1,
  },
  heading: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#08201a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#08201a",
    paddingBottom: 6,
  },
  status: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#00603a",
    marginBottom: 8,
  },
});

function markdownToPlainText(input: string): string {
  if (!input) return "";
  return input
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (/^#{1,6}\s/.test(trimmed)) return trimmed.replace(/^#{1,6}\s/, "");
      if (/^>\s?/.test(trimmed)) return trimmed.replace(/^>\s?/, "");
      if (/^[-*+]\s/.test(trimmed)) return `• ${trimmed.replace(/^[-*+]\s/, "")}`;
      if (/^\d+\.\s/.test(trimmed)) return trimmed;
      return trimmed;
    })
    .filter((line) => line.length > 0)
    .join("\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<\/?[^>]+>/g, "");
}

function SectionContent({ section }: { section: FullReportSection }) {
  const content = markdownToPlainText(section.content);
  return (
    <View style={styles.sectionBlock} wrap={false}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {content ? <Text style={styles.sectionContent}>{content}</Text> : null}
      {section.resources.length > 0 ? (
        <View style={styles.resourceBlock}>
          {section.resources.map((resource) => (
            <View key={resource.id}>
              <Text style={styles.resourceTitle}>
                {resource.title}
                {resource.downloadable ? " (descargable)" : ""}
              </Text>
              {resource.file_url ? (
                <Text style={styles.resourceUrl}>{resource.file_url}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function CategoriesSection({ categories }: { categories: FullReportCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <View>
      <Text style={styles.heading}>Taxonomía</Text>
      {categories.map((category) => (
        <View key={category.id} style={styles.categoryBlock} wrap={false}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          {category.concepts.map((concept) => (
            <View key={concept.id} style={styles.conceptRow} wrap={false}>
              <Text style={styles.conceptName}>{concept.name}</Text>
              <Text style={styles.conceptDesc}>{concept.description}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function ReferencesSection({ references }: { references: FullReportReference[] }) {
  if (references.length === 0) return null;
  return (
    <View>
      <Text style={styles.heading}>Referencias</Text>
      {references.map((reference) => (
        <View key={reference.id} style={styles.referenceBlock} wrap={false}>
          <Text style={styles.referenceText}>
            {[reference.authors, reference.title, reference.year]
              .filter(Boolean)
              .join(". ")}
            {reference.source ? ` · ${reference.source}` : ""}
          </Text>
          {reference.citation_url ? (
            <Text style={styles.referenceUrl}>{reference.citation_url}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function ReportPdfDocument({ report }: ReportPdfDocumentProps) {
  return (
    <Document
      title={report.title}
      author="PhysaFlow Research"
      subject={`${report.title} — ${report.version} (${report.language})`}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.status}>{report.status}</Text>
        <Text style={styles.coverTitle}>{report.title}</Text>
        <Text style={styles.coverMeta}>Versión: {report.version}</Text>
        <Text style={styles.coverMeta}>Idioma: {report.language}</Text>
        <Text style={styles.coverMeta}>Publicado: {report.updated_at}</Text>
        <View style={styles.coverDivider} />

        <Text style={styles.summaryLabel}>Resumen</Text>
        <Text style={styles.summary}>{report.summary}</Text>

        {report.citation_text ? (
          <Text style={styles.citation}>Cita: {report.citation_text}</Text>
        ) : null}

        {report.sections.length > 0 ? (
          <View>
            <Text style={styles.heading}>Capítulos</Text>
            {report.sections.map((section) => (
              <SectionContent key={section.id} section={section} />
            ))}
          </View>
        ) : null}

        <CategoriesSection categories={report.categories} />
        <ReferencesSection references={report.references} />

        <View fixed style={styles.footer}>
          <Text>{report.title}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}