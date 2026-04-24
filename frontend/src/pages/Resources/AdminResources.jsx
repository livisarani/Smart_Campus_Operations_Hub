import { useEffect, useMemo, useState } from "react";
import {
  deleteResource,
  getAllResources,
  searchResourcesByName,
} from "../../api/resourceApi";
import ResourceCard from "../../components/resources/ResourceCard";

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
      const matchesType = typeFilter === "ALL" || resource.type === typeFilter;
      const matchesStatus =
        statusFilter === "ALL" || resource.status === statusFilter;

      return matchesType && matchesStatus;
    });
  }, [resources, typeFilter, statusFilter]);

  const activeCount = resources.filter((item) => item.status === "ACTIVE").length;
  const outOfServiceCount = resources.filter(
    (item) => item.status === "OUT_OF_SERVICE"
  ).length;
  const totalCapacity = resources.reduce(
    (sum, item) => sum + Number(item.capacity || 0),
    0
  );

  const handleSearch = async () => {
    if (!searchText.trim()) {
      await loadResources();
      return;
    }

    try {
      setLoading(true);
      const data = await searchResourcesByName(searchText);
      setResources(data);
    } catch (error) {
      alert(error.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) return;

    try {
      await deleteResource(id);
      await loadResources();
    } catch (error) {
      alert(error.message || "Failed to delete resource");
    }
  };

  const clearFilters = async () => {
    setSearchText("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    await loadResources();
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <p style={styles.kicker}>Admin Resource Management</p>
          <h1 style={styles.title}>Facilities & Assets Catalogue</h1>
          <p style={styles.subtitle}>
            Manage labs, lecture halls, meeting rooms, and campus equipment with
            a clean resource dashboard.
          </p>

          <div style={styles.heroActions}>
            <button style={styles.heroButton} onClick={loadResources}>
              Refresh Catalogue
            </button>
            <span style={styles.heroNote}>Connected to Spring Boot API</span>
          </div>
        </div>

        <div style={styles.heroCard}>
          <div style={styles.heroIcon}>🏫</div>
          <h2 style={styles.heroNumber}>{resources.length}</h2>
          <p style={styles.heroLabel}>Total Resources</p>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>✅</span>
          <div>
            <h3 style={styles.statNumber}>{activeCount}</h3>
            <p style={styles.statText}>Active Resources</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>🛠️</span>
          <div>
            <h3 style={styles.statNumber}>{outOfServiceCount}</h3>
            <p style={styles.statText}>Out of Service</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>👥</span>
          <div>
            <h3 style={styles.statNumber}>{totalCapacity}</h3>
            <p style={styles.statText}>Total Capacity</p>
          </div>
        </div>
      </section>

      <section style={styles.controlPanel}>
        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by resource name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <button style={styles.searchButton} onClick={handleSearch}>
            Search
          </button>

          <button style={styles.clearButton} onClick={clearFilters}>
            Clear
          </button>
        </div>

        <div style={styles.filterRow}>
          <select
            style={styles.select}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="LECTURE_HALL">Lecture Halls</option>
            <option value="LAB">Labs</option>
            <option value="MEETING_ROOM">Meeting Rooms</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>

          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>

          <p style={styles.resultText}>
            Showing <strong>{filteredResources.length}</strong> resource(s)
          </p>
        </div>
      </section>

      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner}>🌿</div>
          <p style={styles.message}>Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📭</div>
          <h2 style={styles.emptyTitle}>No resources found</h2>
          <p style={styles.emptyText}>
            Add a new resource or adjust your search and filters.
          </p>
        </div>
      ) : (
        <section style={styles.grid}>
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDelete={handleDelete}
            />
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
      "radial-gradient(circle at top left, #eef5e8 0, #f4f7f1 35%, #ffffff 100%)",
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
  heroLeft: {
    maxWidth: "720px",
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
  heroActions: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginTop: "22px",
    flexWrap: "wrap",
  },
  heroButton: {
    backgroundColor: "#ffffff",
    color: "#2f3e2f",
    border: "none",
    borderRadius: "14px",
    padding: "12px 18px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  heroNote: {
    color: "#dcebd2",
    fontSize: "14px",
  },
  heroCard: {
    minWidth: "210px",
    backgroundColor: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "24px",
    padding: "24px",
    textAlign: "center",
  },
  heroIcon: {
    fontSize: "38px",
  },
  heroNumber: {
    fontSize: "46px",
    margin: "8px 0 0 0",
  },
  heroLabel: {
    margin: "4px 0 0 0",
    color: "#e7f0de",
  },
  statsGrid: {
    maxWidth: "1180px",
    margin: "0 auto 24px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #d8e0d2",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 10px 24px rgba(47, 62, 47, 0.09)",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    backgroundColor: "#eef5e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },
  statNumber: {
    margin: 0,
    color: "#2f3e2f",
    fontSize: "26px",
  },
  statText: {
    margin: "4px 0 0 0",
    color: "#6b7a55",
  },
  controlPanel: {
    maxWidth: "1180px",
    margin: "0 auto 28px auto",
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    padding: "20px",
    border: "1px solid #d8e0d2",
    boxShadow: "0 10px 24px rgba(47, 62, 47, 0.08)",
  },
  searchRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "240px",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #d8e0d2",
    backgroundColor: "#fbfcfa",
    outline: "none",
    fontSize: "15px",
  },
  searchButton: {
    padding: "14px 22px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#556b2f",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  clearButton: {
    padding: "14px 22px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#2f3e2f",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: "22px",
  },
  loadingBox: {
    textAlign: "center",
    padding: "50px",
  },
  spinner: {
    fontSize: "38px",
    marginBottom: "10px",
  },
  message: {
    color: "#2f3e2f",
    fontSize: "18px",
  },
  emptyBox: {
    maxWidth: "600px",
    margin: "30px auto",
    textAlign: "center",
    backgroundColor: "#ffffff",
    padding: "36px",
    borderRadius: "24px",
    border: "1px solid #d8e0d2",
  },
  emptyIcon: {
    fontSize: "42px",
  },
  emptyTitle: {
    color: "#2f3e2f",
    marginBottom: "8px",
  },
  emptyText: {
    color: "#6b7a55",
  },
};

export default AdminResources;