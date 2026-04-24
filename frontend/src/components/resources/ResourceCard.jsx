const getResourceIcon = (type) => {
  if (type === "LAB") return "💻";
  if (type === "LECTURE_HALL") return "🎓";
  if (type === "MEETING_ROOM") return "🤝";
  return "📦";
};

const formatType = (type) => {
  return type ? type.replace("_", " ") : "N/A";
};

const formatDateTime = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ResourceCard = ({ resource, onDelete }) => {
  return (
    <article style={styles.card}>
      <div style={styles.topLine}></div>

      <div style={styles.header}>
        <div style={styles.iconBox}>{getResourceIcon(resource.type)}</div>

        <span
          style={{
            ...styles.status,
            backgroundColor:
              resource.status === "ACTIVE" ? "#e8f3df" : "#f7e3e3",
            color: resource.status === "ACTIVE" ? "#2f3e2f" : "#8b2f2f",
          }}
        >
          {resource.status === "ACTIVE" ? "Active" : "Out of Service"}
        </span>
      </div>

      <h3 style={styles.name}>{resource.resourceName}</h3>
      <p style={styles.location}>📍 {resource.location}</p>

      <div style={styles.infoGrid}>
        <div style={styles.infoBox}>
          <span style={styles.infoLabel}>Type</span>
          <strong style={styles.infoValue}>{formatType(resource.type)}</strong>
        </div>

        <div style={styles.infoBox}>
          <span style={styles.infoLabel}>Capacity</span>
          <strong style={styles.infoValue}>{resource.capacity}</strong>
        </div>
      </div>

      <div style={styles.availabilityBox}>
        <span style={styles.infoLabel}>Available From</span>
        <p style={styles.availabilityText}>
          {formatDateTime(resource.availabilityStart)}
        </p>

        <span style={styles.infoLabel}>Available Until</span>
        <p style={styles.availabilityText}>
          {formatDateTime(resource.availabilityEnd)}
        </p>
      </div>

      <p style={styles.description}>
        {resource.description || "No description added for this resource."}
      </p>

      {resource.id !== undefined && (
        <button style={styles.deleteButton} onClick={() => onDelete(resource.id)}>
          Delete Resource
        </button>
      )}
    </article>
  );
};

const styles = {
  card: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 12px 30px rgba(47, 62, 47, 0.12)",
    border: "1px solid #d8e0d2",
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "6px",
    background: "linear-gradient(90deg, #2f3e2f, #7a8f4b)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
  },
  iconBox: {
    width: "52px",
    height: "52px",
    borderRadius: "17px",
    backgroundColor: "#eef5e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
  },
  status: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  name: {
    color: "#2f3e2f",
    margin: "18px 0 6px 0",
    fontSize: "21px",
  },
  location: {
    color: "#6b7a55",
    margin: 0,
    fontSize: "14px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "18px",
  },
  infoBox: {
    backgroundColor: "#f7faf4",
    borderRadius: "16px",
    padding: "13px",
    border: "1px solid #d8e0d2",
  },
  infoLabel: {
    display: "block",
    color: "#6b7a55",
    fontSize: "12px",
    marginBottom: "5px",
    marginTop: "8px",
    fontWeight: 600,
  },
  infoValue: {
    color: "#2f3e2f",
    fontSize: "14px",
  },
  availabilityBox: {
    backgroundColor: "#fbfcfa",
    borderRadius: "16px",
    padding: "13px",
    border: "1px solid #d8e0d2",
    marginTop: "12px",
  },
  availabilityText: {
    color: "#2f3e2f",
    margin: "0 0 8px 0",
    fontWeight: 600,
    fontSize: "14px",
  },
  description: {
    color: "#4b5563",
    lineHeight: "1.6",
    fontSize: "14px",
    minHeight: "44px",
  },
  deleteButton: {
    width: "100%",
    marginTop: "10px",
    padding: "12px 15px",
    border: "none",
    borderRadius: "14px",
    backgroundColor: "#8b2f2f",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default ResourceCard;