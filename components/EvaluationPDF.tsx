import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #1e1060',
    paddingBottom: 15,
  },
  firmName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1060',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 15,
  },
  clientInfo: {
    marginBottom: 25,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  clientInfoRow: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9,
  },
  label: {
    fontWeight: 'bold',
    width: 110,
    color: '#374151',
  },
  value: {
    flex: 1,
    color: '#1f2937',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    paddingBottom: 6,
    borderBottom: '2 solid #1e1060',
    color: '#1e1060',
  },
  h1: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    color: '#1e1060',
  },
  h2: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 14,
    color: '#374151',
  },
  h3: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 12,
    color: '#374151',
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 8,
    color: '#1f2937',
    textAlign: 'justify',
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 4,
    marginLeft: 15,
    color: '#1f2937',
  },
  bold: {
    fontWeight: 'bold',
  },
  content: {
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 12,
    color: '#1f2937',
  },
  storyBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  disclaimer: {
    position: 'absolute',
    bottom: 45,
    left: 50,
    right: 50,
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 8,
    color: '#9ca3af',
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
    kaycee01?: string;
    kaycee02?: string;
  };
  createdAt: string;
  organization: string;
  acknowledgedAt?: string;
}

// Simple markdown parser for PDF
const parseMarkdown = (text: string) => {
  if (!text) return [];

  const lines = text.split('\n');
  const elements: { type: string; content: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Headers
    if (line.startsWith('### ')) {
      elements.push({ type: 'h3', content: line.replace('### ', '') });
    } else if (line.startsWith('## ')) {
      elements.push({ type: 'h2', content: line.replace('## ', '') });
    } else if (line.startsWith('# ')) {
      elements.push({ type: 'h1', content: line.replace('# ', '') });
    }
    // List items
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push({ type: 'listItem', content: '• ' + line.substring(2) });
    } else if (/^\d+\.\s/.test(line)) {
      elements.push({ type: 'listItem', content: line });
    }
    // Regular paragraph
    else {
      elements.push({ type: 'paragraph', content: line });
    }
  }

  return elements;
};

// Strip markdown formatting for inline text (bold, italic)
const cleanInlineMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold **
    .replace(/\*(.*?)\*/g, '$1')       // Remove italic *
    .replace(/__(.*?)__/g, '$1')       // Remove bold __
    .replace(/_(.*?)_/g, '$1')         // Remove italic _
    .replace(/`(.*?)`/g, '$1');        // Remove inline code
};

const MarkdownContent = ({ text }: { text: string }) => {
  const elements = parseMarkdown(text);

  return (
    <View>
      {elements.map((el, idx) => {
        const content = cleanInlineMarkdown(el.content);

        switch (el.type) {
          case 'h1':
            return <Text key={idx} style={styles.h1}>{content}</Text>;
          case 'h2':
            return <Text key={idx} style={styles.h2}>{content}</Text>;
          case 'h3':
            return <Text key={idx} style={styles.h3}>{content}</Text>;
          case 'listItem':
            return <Text key={idx} style={styles.listItem}>{content}</Text>;
          default:
            return <Text key={idx} style={styles.paragraph}>{content}</Text>;
        }
      })}
    </View>
  );
};

export default function EvaluationPDF({
  clientInfo,
  clientStory,
  aiResponses,
  createdAt,
  organization,
   acknowledgedAt,
}: EvaluationPDFProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const disclaimerText = 'This document was generated using Microsoft Azure AI services. Client data is not stored or retained after the session ends. This does not constitute legal advice. All information should be reviewed by a licensed attorney before any action is taken.';

  return (
    <Document>
      {/* Cover Page with Client Story */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.firmName}>{organization}</Text>
          <Text style={styles.subtitle}>Case Evaluation & Strategic Analysis</Text>
        </View>

        <View style={styles.clientInfo}>
          <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{clientInfo.firstName} {clientInfo.lastName}</Text>
          </View>
          <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Date Prepared:</Text>
            <Text style={styles.value}>{formatDate(createdAt)}</Text>
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
       <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Secondary Language:</Text>
            <Text style={styles.value}>{clientInfo.secondaryLanguage || 'N/A'}</Text>
          </View>
          <View style={styles.clientInfoRow}>
            <Text style={styles.label}>Disclaimer Acknowledged:</Text>
            <Text style={styles.value}>
              {acknowledgedAt 
                ? new Date(acknowledgedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : 'N/A'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Client Narrative</Text>
        <View style={styles.storyBox}>
          <Text style={styles.content}>{clientStory}</Text>
        </View>

        <Text style={styles.disclaimer}>{disclaimerText}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product — {organization}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Case Assessment Page */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionHeader}>Case Assessment</Text>
        <MarkdownContent text={aiResponses.kaycee01 || ''} />
        <Text style={styles.disclaimer}>{disclaimerText}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product — {organization}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Strategic Action Plan Page */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionHeader}>Strategic Action Plan</Text>
        <MarkdownContent text={aiResponses.kaycee02 || ''} />
        <Text style={styles.disclaimer}>{disclaimerText}</Text>
        <Text style={styles.footer}>Confidential - Attorney Work Product — {organization}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>
    </Document>
  );
}