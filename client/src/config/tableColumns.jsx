/**
 * DataTable Column Configuration
 * Defines the structure and rendering logic for all table columns
 */

export const tableColumns = [
  {
    label: "Employee",
    key: "profile.firstName",
    filterKey: "profile.firstName,profile.lastName",
    width: "250px",
    sticky: "left",
    render: (row) => (
      <div className="dt-employee-cell">
        <img
          src={row.avatar}
          alt={row.profile.firstName}
          className="dt-avatar"
        />
        <div className="dt-info-stack">
          <span className="dt-info-stack-title">
            {row.profile.firstName} {row.profile.lastName}
          </span>
          <span className="dt-info-stack-subtitle">
            {row.contact.primaryEmail}
          </span>
        </div>
      </div>
    ),
  },

  {
    label: "Department",
    key: "work.department",
    filterType: "text",
    editable: true,
    dynamicOptions: true,
  },
  {
    label: "Company",
    key: "work.company",
    filterType: "text",
    editable: true,
    dynamicOptions: true,
  },
  {
    label: "Designation",
    key: "work.title",
    filterType: "text",
    editable: true,
    dynamicOptions: true,
  },
  {
    label: "City",
    key: "contact.address.city",
    filterType: "text",
    editable: true,
    dynamicOptions: true,
  },
  {
    label: "Contract",
    key: "work.contractType",
    filterType: "text",
    editable: true,
    dynamicOptions: true,
    render: (r) => (
      <span
        className={`dt-badge ${
          r.work.contractType === "Full-Time"
            ? "dt-badge-info"
            : "dt-badge-warning"
        }`}
      >
        {r.work.contractType}
      </span>
    ),
  },
  {
    label: "Skills",
    key: "work.skills",
    filterType: "text",
    editorType: "tags",
    editable: true,
    dynamicOptions: true,
    render: (r) => {
      const skills = Array.isArray(r.work?.skills) ? r.work.skills : [];
      return (
        <div className="dt-chips-container">
          {skills.slice(0, 2).map((skill, i) => (
            <span key={i} className="dt-chip">
              {skill}
            </span>
          ))}
          {skills.length > 2 && (
            <span style={{ fontSize: "11px", color: "var(--dt-text-muted)" }}>
              +{skills.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
  {
    label: "Annual Salary",
    key: "finance.salary",
    filterType: "number",
    editable: true,
    render: (r) => (
      <span style={{ fontWeight: "600", color: "#0f172a" }}>
        {r.finance.currency} {r.finance.salary.toLocaleString()}
      </span>
    ),
  },
  {
    label: "Joined",
    key: "work.dateJoined",
    filterType: "date",
    editable: true,
    render: (r) => (
      <span style={{ color: "#64748b", fontSize: "13px" }}>
        {new Date(r.work.dateJoined).toLocaleDateString()}
      </span>
    ),
  },
  {
    label: "Credit",
    key: "finance.creditScore",
    filterType: "number",
    editable: true,
    render: (r) => {
      const score = r.finance.creditScore;
      const color =
        score >= 750 ? "#16a34a" : score >= 650 ? "#d97706" : "#dc2626";
      return <span style={{ fontWeight: "bold", color }}>{score}</span>;
    },
  },

  {
    label: "Nationality",
    key: "profile.nationality",
    filterType: "text",
    editable: true,
    dynamicOptions: true,
  },
  {
    label: "Bio",
    key: "profile.bio",
    filterType: "text",
    editorType: "textarea",
    editable: true,
    width: "300px",
    render: (r) => (
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "280px",
          color: "var(--dt-text-muted)",
          fontSize: "13px",
        }}
      >
        {r.profile.bio || "No biography provided..."}
      </div>
    ),
  },
];
