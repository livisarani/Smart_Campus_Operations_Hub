import ResourceForm from "../../components/resources/ResourceForm";
import { createResource } from "../../api/resourceApi";

const CreateResource = () => {
  const handleCreateResource = async (resource) => {
    try {
      await createResource(resource);
      alert("Resource created successfully");
    } catch (error) {
      alert(error.message || "Failed to create resource. Check backend is running.");
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.iconBox}>➕</div>
        <p style={styles.kicker}>Resource Registration</p>
        <h1 style={styles.heroTitle}>Create Campus Resource</h1>
        <p style={styles.heroText}>
          Add a new lab, lecture hall, meeting room, or equipment item to the
          campus catalogue.
        </p>
      </section>

      <ResourceForm onSubmit={handleCreateResource} />
    </main>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px",
    background:
      "radial-gradient(circle at top left, #eef5e8 0, #f4f7f1 38%, #ffffff 100%)",
  },
  hero: {
    maxWidth: "900px",
    margin: "0 auto 26px auto",
    background: "linear-gradient(135deg, #2f3e2f 0%, #556b2f 100%)",
    color: "#ffffff",
    padding: "34px",
    borderRadius: "28px",
    boxShadow: "0 18px 40px rgba(47, 62, 47, 0.24)",
    textAlign: "center",
  },
  iconBox: {
    width: "58px",
    height: "58px",
    margin: "0 auto 14px auto",
    borderRadius: "18px",
    backgroundColor: "#ffffff",
    color: "#2f3e2f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    boxShadow: "0 8px 18px rgba(0,0,0,0.16)",
  },
  kicker: {
    margin: "0 0 8px 0",
    color: "#dcebd2",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "bold",
    fontSize: "13px",
  },
  heroTitle: {
    margin: 0,
    fontSize: "36px",
  },
  heroText: {
    margin: "12px auto 0 auto",
    color: "#edf4e7",
    fontSize: "16px",
    lineHeight: "1.7",
    maxWidth: "650px",
  },
};

export default CreateResource;