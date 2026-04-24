import { useEffect, useState } from "react";
import { getAllResources } from "../../api/resourceApi";

const ResourceForm = ({ onSubmit }) => {
  const [existingResources, setExistingResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceName: "",
    type: "LAB",
    capacity: 1,
    location: "",
    availabilityStart: "",
    availabilityEnd: "",
    status: "ACTIVE",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    const loadExistingResources = async () => {
      try {
        const data = await getAllResources();
        setExistingResources(data);
      } catch {
        console.log("Could not load existing resources for overlap checking");
      }
    };

    loadExistingResources();
  }, []);

  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const checkOverlap = (start, end) => {
    if (!start || !end) return false;

    const newStart = new Date(start).getTime();
    const newEnd = new Date(end).getTime();

    return existingResources.some((resource) => {
      if (!resource.availabilityStart || !resource.availabilityEnd) {
        return false;
      }

      const existingStart = new Date(resource.availabilityStart).getTime();
      const existingEnd = new Date(resource.availabilityEnd).getTime();

      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  const validateAvailability = (start, end) => {
    const now = new Date();
    const selectedStart = new Date(start);
    const selectedEnd = new Date(end);

    if (!start || !end) {
      return "Please choose both available from and available until date/time.";
    }

    if (selectedStart < now) {
      return "Available from date/time cannot be in the past.";
    }

    if (selectedEnd < now) {
      return "Available until date/time cannot be in the past.";
    }

    if (selectedEnd <= selectedStart) {
      return "Available until date/time must be after available from date/time.";
    }

    if (checkOverlap(start, end)) {
      return "This availability window overlaps with an existing resource availability.";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: name === "capacity" ? Number(value) : value,
    };

    setFormData(updatedFormData);

    if (name === "availabilityStart" || name === "availabilityEnd") {
      const error = validateAvailability(
        updatedFormData.availabilityStart,
        updatedFormData.availabilityEnd
      );
      setAvailabilityError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateAvailability(
      formData.availabilityStart,
      formData.availabilityEnd
    );

    if (error) {
      setAvailabilityError(error);
      alert(error);
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        ...formData,
        availabilityWindow: `${formatDateTime(
          formData.availabilityStart
        )} - ${formatDateTime(formData.availabilityEnd)}`,
      });

      setFormData({
        resourceName: "",
        type: "LAB",
        capacity: 1,
        location: "",
        availabilityStart: "",
        availabilityEnd: "",
        status: "ACTIVE",
        description: "",
      });

      setAvailabilityError("");

      const refreshedData = await getAllResources();
      setExistingResources(refreshedData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formHeader}>
        <div style={styles.formIcon}>🌿</div>
        <h2 style={styles.title}>Resource Details</h2>
        <p style={styles.subtitle}>
          Choose only future availability times. Overlapping windows are blocked.
        </p>
      </div>

      <div style={styles.twoColumn}>
        <div style={styles.field}>
          <label style={styles.label}>Resource Name</label>
          <input
            style={styles.input}
            type="text"
            name="resourceName"
            placeholder="Computer Lab 01"
            value={formData.resourceName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Resource Type</label>
          <select
            style={styles.input}
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>
      </div>

      <div style={styles.twoColumn}>
        <div style={styles.field}>
          <label style={styles.label}>Capacity</label>
          <input
            style={styles.input}
            type="number"
            name="capacity"
            placeholder="40"
            value={formData.capacity}
            onChange={handleChange}
            min={1}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Status</label>
          <select
            style={styles.input}
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Location</label>
        <input
          style={styles.input}
          type="text"
          name="location"
          placeholder="Block A - Floor 2"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div style={styles.availabilityBox}>
        <div style={styles.availabilityHeader}>
          <div>
            <h3 style={styles.availabilityTitle}>Availability Date & Time</h3>
            <p style={styles.availabilitySubtitle}>
              Past dates and overlapping time ranges are not allowed.
            </p>
          </div>
          <span style={styles.calendarIcon}>📅</span>
        </div>

        <div style={styles.twoColumn}>
          <div style={styles.field}>
            <label style={styles.label}>Available From</label>
            <input
              style={styles.input}
              type="datetime-local"
              name="availabilityStart"
              min={getCurrentDateTimeLocal()}
              value={formData.availabilityStart}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Available Until</label>
            <input
              style={styles.input}
              type="datetime-local"
              name="availabilityEnd"
              min={formData.availabilityStart || getCurrentDateTimeLocal()}
              value={formData.availabilityEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {formData.availabilityStart && formData.availabilityEnd && (
          <div style={availabilityError ? styles.errorBox : styles.previewBox}>
            {availabilityError ? (
              <strong>⚠️ {availabilityError}</strong>
            ) : (
              <>
                <strong>Preview:</strong>{" "}
                {formatDateTime(formData.availabilityStart)} -{" "}
                {formatDateTime(formData.availabilityEnd)}
              </>
            )}
          </div>
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <textarea
          style={styles.textarea}
          name="description"
          placeholder="Short description about the resource"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <button
        style={{
          ...styles.button,
          opacity: availabilityError ? 0.6 : 1,
          cursor: availabilityError ? "not-allowed" : "pointer",
        }}
        type="submit"
        disabled={loading || Boolean(availabilityError)}
      >
        {loading ? "Saving Resource..." : "Save Resource"}
      </button>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "30px",
    borderRadius: "28px",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 45px rgba(47, 62, 47, 0.14)",
    border: "1px solid #d8e0d2",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  formHeader: {
    textAlign: "center",
    marginBottom: "8px",
  },
  formIcon: {
    width: "54px",
    height: "54px",
    margin: "0 auto 10px auto",
    borderRadius: "18px",
    backgroundColor: "#eef5e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
  },
  title: {
    color: "#2f3e2f",
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    color: "#6b7a55",
    margin: "8px 0 0 0",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    color: "#2f3e2f",
    fontWeight: "bold",
    fontSize: "14px",
  },
  input: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #d8e0d2",
    fontSize: "15px",
    backgroundColor: "#fbfcfa",
    outline: "none",
  },
  availabilityBox: {
    backgroundColor: "#f7faf4",
    border: "1px solid #d8e0d2",
    borderRadius: "22px",
    padding: "20px",
  },
  availabilityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  availabilityTitle: {
    color: "#2f3e2f",
    margin: 0,
    fontSize: "20px",
  },
  availabilitySubtitle: {
    color: "#6b7a55",
    margin: "5px 0 0 0",
    fontSize: "14px",
  },
  calendarIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    boxShadow: "0 8px 18px rgba(47, 62, 47, 0.10)",
  },
  previewBox: {
    marginTop: "16px",
    padding: "13px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    color: "#2f3e2f",
    border: "1px dashed #9aaa7c",
    fontSize: "14px",
  },
  errorBox: {
    marginTop: "16px",
    padding: "13px",
    borderRadius: "14px",
    backgroundColor: "#fff1f1",
    color: "#8b2f2f",
    border: "1px solid #efb5b5",
    fontSize: "14px",
  },
  textarea: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #d8e0d2",
    minHeight: "110px",
    fontSize: "15px",
    backgroundColor: "#fbfcfa",
    outline: "none",
    resize: "vertical",
  },
  button: {
    marginTop: "8px",
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: "linear-gradient(135deg, #556b2f 0%, #2f3e2f 100%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    boxShadow: "0 10px 22px rgba(85, 107, 47, 0.26)",
  },
};

export default ResourceForm;