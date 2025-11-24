import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  clientInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  clientInfoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontWeight: 'bold',
    width: 120,
  },
  value: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  jaytemHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
});

interface EvaluationPDFProps {
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    primaryLanguage: string;
    secondaryLanguage: string;
  };
  clientStory: string;
  aiResponses: {
    persona?: string;
    caseAnalysis?: string;
    caseStrategy?: string;
  };
  createdAt: string;
}

export default function EvaluationPDF({
  clientInfo,
  clientStory,
  aiResponses,
  createdAt,
}: EvaluationPDFProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Marshall, Ginsburg & Motley LLP</Text>
          <Text style={styles.subtitle}>Case Evaluation</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{clientInfo.firstName} {clientInfo.lastName}</Text>
          </View>
          <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{clientInfo.email}</Text>
          </View>
          <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{clientInfo.phone}</Text>
          </View>
          <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Primary Language:</Text>
            <Text style={styles.value}>{clientInfo.primaryLanguage}</Text>
          </View>
          {clientInfo.secondaryLanguage && (
            <View style={styles.clientInfoRow}>
              <Text style={styles.label}>Secondary Language:</Text>
              <Text style={styles.value}>{clientInfo.secondaryLanguage}</Text>
            </View>
          )}
          <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Prepared on:</Text>
            <Text style={styles.value}>{formatDate(createdAt)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Client Story */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Story</Text>
          <Text style={styles.content}>{clientStory}</Text>
        </View>

        <View style={styles.divider} />

        {/* Jaytem Persona */}
        <View style={styles.section}>
          <Text style={styles.jaytemHeader}>JAYTEM</Text>
          <Text style={styles.sectionSubtitle}>Jaytem Persona</Text>
          <Text style={styles.content}>{aiResponses.persona}</Text>
        </View>

        <Text style={styles.footer}>
          Confidential - Attorney Work Product
        </Text>
      </Page>

      {/* Page 2 - Case Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Case Analysis</Text>
          <Text style={styles.content}>{aiResponses.caseAnalysis}</Text>
        </View>

        <Text style={styles.footer}>
          Confidential - Attorney Work Product
        </Text>
      </Page>

      {/* Page 3 - Case Strategy */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Case Strategy</Text>
          <Text style={styles.content}>{aiResponses.caseStrategy}</Text>
        </View>

        <Text style={styles.footer}>
          Confidential - Attorney Work Product
        </Text>
      </Page>
    </Document>
  );
}