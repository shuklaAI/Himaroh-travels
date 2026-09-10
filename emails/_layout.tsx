import { Html, Head, Preview, Body, Container, Section, Text, Hr, Img } from "@react-email/components";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#F7F2E8", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", maxWidth: 560, borderRadius: 12, overflow: "hidden" }}>
          <Section style={{ backgroundColor: "#071B33", padding: "24px 32px" }}>
            <Text style={{ color: "#E8C76A", fontSize: 20, fontWeight: 700, margin: 0 }}>
              Himaroh Travels
            </Text>
          </Section>
          <Section style={{ padding: "32px" }}>{children}</Section>
          <Hr style={{ borderColor: "#f0ece1", margin: 0 }} />
          <Section style={{ padding: "20px 32px" }}>
            <Text style={{ fontSize: 12, color: "#8a8578", margin: 0 }}>
              Himaroh Travels · +91 85273 93969 · info@himarohtravels.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  heading: { fontSize: 20, fontWeight: 700, color: "#071B33", margin: "0 0 12px" },
  text: { fontSize: 14, lineHeight: "22px", color: "#374151", margin: "0 0 12px" },
  label: { fontSize: 12, color: "#8a8578", margin: "0 0 2px" },
  value: { fontSize: 14, fontWeight: 600, color: "#071B33", margin: "0 0 12px" },
  badge: {
    display: "inline-block",
    backgroundColor: "#D6A63A",
    color: "#071B33",
    fontWeight: 700,
    fontSize: 13,
    padding: "6px 14px",
    borderRadius: 999,
  },
} as const;
