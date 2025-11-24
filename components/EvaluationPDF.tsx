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
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    padding: 5,
    color: 'white',
  },
  alphaHeader: {
    backgroundColor: '#1e40af',
  },
  betaHeader: {
    backgroundColor: '#991b1b',
  },
  kayceeHeader: {
    backgroundColor: '#166534',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  content: {
    lineHeight: 1.4,
    textAlign: 'justify',
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: '#999',
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
    alpha01?: string;
    alpha02?: string;
    beta01?: string;
    beta02?: string;
    kaycee01?: string;
    kaycee02?: string;
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
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Marshall, Ginsburg & Motley LLP</Text>
        <Text style={styles.subtitle}>Case Evaluation</Text>

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

        <Text style={styles.sectionTitle}>Client Story</Text>
        <Text style={styles.content}>{clientStory}</Text>

        <Text style={styles.footer}>Confidential - Attorney Work Product</Text>
      </Page>

      {/* Alpha 01 */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionHeader, styles.alphaHeader]}>ALPHA - Plaintiff Analysis</Text>
        <Text style={styles.sectionTitle}>Case Evaluation</Text>
        <Text style={styles.content}>{aiResponses.alpha01}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product</Text>
      </Page>

      {/* Alpha 02 */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionHeader, styles.alphaHeader]}>ALPHA - Plaintiff Analysis</Text>
        <Text style={styles.sectionTitle}>Draft Complaint</Text>
        <Text style={styles.content}>{aiResponses.alpha02}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product</Text>
      </Page>

      {/* Beta 01 */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionHeader, styles.betaHeader]}>BETA - Defense Analysis</Text>
        <Text style={styles.sectionTitle}>Defense Counter-Analysis</Text>
        <Text style={styles.content}>{aiResponses.beta01}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product</Text>
      </Page>

      {/* Beta 02 */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionHeader, styles.betaHeader]}>BETA - Defense Analysis</Text>
        <Text style={styles.sectionTitle}>Defense Strategy</Text>
        <Text style={styles.content}>{aiResponses.beta02}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product</Text>
      </Page>

      {/* Kaycee 01 */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionHeader, styles.kayceeHeader]}>KAYCEE - Final Plaintiff Strategy</Text>
        <Text style={styles.sectionTitle}>Strengthened Case Strategy</Text>
        <Text style={styles.content}>{aiResponses.kaycee01}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product</Text>
      </Page>

      {/* Kaycee 02 */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionHeader, styles.kayceeHeader]}>KAYCEE - Final Plaintiff Strategy</Text>
        <Text style={styles.sectionTitle}>Final Enhanced Complaint & Roadmap</Text>
        <Text style={styles.content}>{aiResponses.kaycee02}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product</Text>
      </Page>
    </Document>
  );
}