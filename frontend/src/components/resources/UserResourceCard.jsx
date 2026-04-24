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

const UserResourceCard = ({ resource }) => {
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
          {resource.status === "ACTIVE" ? "Available" : "Unavailable"}
        </span>
      </div>

      <h3 style={styles.name}>{resource.resourceName}</h3>
      <p style={styles.location}>📍 {resource.location}</p>

      <div style={styles.infoGrid}>
        <div style={styles.infoBox}>
          <span style={styles.infoLabel}>Resource Type</span>
          <strong style={styles.infoValue}>{formatType(resource.type)}</strong>
        </div>

        <div style={styles.infoBox}>
          <span style={styles.infoLabel}>Capacity</span>
          <strong style={styles.infoValue}>{resource.capacity} people</strong>
        </div>
      </div>

      <div style={styles.availabilityBox}>
        <div style={styles.timeRow}>
          <span style={styles.timeIcon}>🕒</span>
          <div>
            <span style={styles.infoLabel}>Available From</span>
            <p style={styles.availabilityText}>
              {formatDateTime(resource.availabilityStart)}
            </p>
          </div>
        </div>

        <div style={styles.timeRow}>
          <span style={styles.timeIcon}>⏳</span>
          <div>
            <span style={styles.infoLabel}>Available Until</span>
            <p style={styles.availabilityText}>
              {formatDateTime(resource.availabilityEnd)}
            </p>
          </div>
        </div>
      </div>

      <p style={styles.description}>
        {resource.description || "No description added for this resource."}
      </p>

      <button
        style={{
          ...styles.viewButton,
          opacity: resource.status === "ACTIVE" ? 1 : 0.55,
          cursor: resource.status === "ACTIVE" ? "pointer" : "not-allowed",
        }}
        disabled={resource.status !== "ACTIVE"}
        onClick={() => {
          if (resource.status === "ACTIVE") {
            alert(
              `${resource.resourceName} is available.\n\nYou can request/book this resource through the booking module.`
            );
          }
        }}
      >
        {resource.status === "ACTIVE"
          ? "View Availability"
          : "Currently Unavailable"}
      </button>
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
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    backgroundColor: "#eef5e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },
  status: {
    padding: "8px 13px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  name: {
    color: "#2f3e2f",
    margin: "18px 0 6px 0",
    fontSize: "22px",
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
    fontWeight: 600,
  },
  infoValue: {
    color: "#2f3e2f",
    fontSize: "14px",
  },
  availabilityBox: {
    backgroundColor: "#fbfcfa",
    borderRadius: "16px",
    padding: "14px",
    border: "1px solid #d8e0d2",
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  timeRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  timeIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    backgroundColor: "#eef5e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  availabilityText: {
    color: "#2f3e2f",
    margin: 0,
    fontWeight: 600,
    fontSize: "14px",
  },
  description: {
    color: "#4b5563",
    lineHeight: "1.6",
    fontSize: "14px",
    minHeight: "44px",
  },
  viewButton: {
    width: "100%",
    marginTop: "10px",
    padding: "12px 15px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #556b2f 0%, #2f3e2f 100%)",
    color: "#ffffff",
    fontWeight: "bold",
  },
};

export default UserResourceCard;