import { useEffect, useMemo, useState } from "react";
import { getAllResources } from "../../api/resourceApi";
import UserResourceCard from "../../components/resources/UserResourceCard";

const UserResources = () => {
  const [resources, setResources] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await getAllResources();
      setResources(data);
    } catch (error) {
      alert(error.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const search = searchText.toLowerCase();

      const matchesSearch =
        resource.resourceName?.toLowerCase().includes(search) ||
        resource.location?.toLowerCase().includes(search) ||
        resource.type?.toLowerCase().includes(search);

      const matchesType = typeFilter === "ALL" || resource.type === typeFilter;

      const matchesAvailability =
        availabilityFilter === "ALL" ||
        (availabilityFilter === "AVAILABLE" && resource.status === "ACTIVE") ||
        (availabilityFilter === "UNAVAILABLE" &&
          resource.status === "OUT_OF_SERVICE");

      return matchesSearch && matchesType && matchesAvailability;
    });
  }, [resources, searchText, typeFilter, availabilityFilter]);

  const availableCount = resources.filter(
    (resource) => resource.status === "ACTIVE"
  ).length;

  const totalCapacity = resources.reduce(
    (total, resource) => total + Number(resource.capacity || 0),
    0
  );

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroTextBox}>
          <p style={styles.kicker}>Student / User View</p>
          <h1 style={styles.title}>Available Campus Resources</h1>
          <p style={styles.subtitle}>
            Browse labs, lecture halls, meeting rooms, and equipment added by the
            admin. Use filters to quickly find the right resource.
          </p>
        </div>

        <div style={styles.heroCards}>
          <div style={styles.heroMiniCard}>
            <h2 style={styles.heroNumber}>{resources.length}</h2>
            <p style={styles.heroLabel}>Total Resources</p>
          </div>

          <div style={styles.heroMiniCard}>
            <h2 style={styles.heroNumber}>{availableCount}</h2>
            <p style={styles.heroLabel}>Available</p>
          </div>

          <div style={styles.heroMiniCard}>
            <h2 style={styles.heroNumber}>{totalCapacity}</h2>
            <p style={styles.heroLabel}>Capacity</p>
          </div>
        </div>
      </section>

      <section style={styles.filterPanel}>
        <div style={styles.searchBox}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by name, location, or type..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <button style={styles.refreshButton} onClick={loadResources}>
            Refresh
          </button>
        </div>

        <div style={styles.filterRow}>
          <select
            style={styles.select}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Resource Types</option>
            <option value="LECTURE_HALL">Lecture Halls</option>
            <option value="LAB">Labs</option>
            <option value="MEETING_ROOM">Meeting Rooms</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>

          <select
            style={styles.select}
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="ALL">All Availability</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="UNAVAILABLE">Unavailable Only</option>
          </select>

          <p style={styles.resultText}>
            Showing <strong>{filteredResources.length}</strong> resource(s)
          </p>
        </div>
      </section>

      {loading ? (
        <div style={styles.messageBox}>
          <div style={styles.messageIcon}>🌿</div>
          <p style={styles.messageText}>Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div style={styles.messageBox}>
          <div style={styles.messageIcon}>📭</div>
          <h2 style={styles.emptyTitle}>No resources found</h2>
          <p style={styles.messageText}>
            Try changing your search or filter options.
          </p>
        </div>
      ) : (
        <section style={styles.grid}>
          {filteredResources.map((resource) => (
            <UserResourceCard key={resource.id} resource={resource} />
          ))}
        </section>
      )}
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
    maxWidth: "1180px",
    margin: "0 auto 24px auto",
    padding: "34px",
    borderRadius: "28px",
    background: "linear-gradient(135deg, #2f3e2f 0%, #556b2f 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "center",
    boxShadow: "0 18px 40px rgba(47, 62, 47, 0.25)",
  },
  heroTextBox: {
    maxWidth: "650px",
  },
  kicker: {
    margin: "0 0 10px 0",
    color: "#dcebd2",
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontSize: "13px",
  },
  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: "1.1",
  },
  subtitle: {
    color: "#edf4e7",
    fontSize: "17px",
    lineHeight: "1.7",
    marginTop: "14px",
  },
  heroCards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
    gap: "12px",
  },
  heroMiniCard: {
    minWidth: "130px",
    backgroundColor: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "20px",
    padding: "18px",
    textAlign: "center",
  },
  heroNumber: {
    margin: 0,
    fontSize: "34px",
  },
  heroLabel: {
    margin: "6px 0 0 0",
    color: "#e7f0de",
    fontSize: "13px",
  },
  filterPanel: {
    maxWidth: "1180px",
    margin: "0 auto 28px auto",
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    padding: "20px",
    border: "1px solid #d8e0d2",
    boxShadow: "0 10px 24px rgba(47, 62, 47, 0.08)",
  },
  searchBox: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "260px",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #d8e0d2",
    backgroundColor: "#fbfcfa",
    outline: "none",
    fontSize: "15px",
  },
  refreshButton: {
    padding: "14px 22px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#556b2f",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "14px",
    flexWrap: "wrap",
  },
  select: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d8e0d2",
    backgroundColor: "#fbfcfa",
    color: "#2f3e2f",
    fontWeight: 600,
    outline: "none",
  },
  resultText: {
    margin: 0,
    color: "#6b7a55",
  },
  grid: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "22px",
  },
  messageBox: {
    maxWidth: "600px",
    margin: "30px auto",
    textAlign: "center",
    backgroundColor: "#ffffff",
    padding: "36px",
    borderRadius: "24px",
    border: "1px solid #d8e0d2",
  },
  messageIcon: {
    fontSize: "42px",
  },
  emptyTitle: {
    color: "#2f3e2f",
    marginBottom: "8px",
  },
  messageText: {
    color: "#6b7a55",
  },
};

export default UserResources;