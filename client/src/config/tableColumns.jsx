import DataTable from "../components/DataTable";

/**
 * DataTable Column Configuration
 * Defines the structure and rendering logic for all table columns
 */

const expenseColumns = [
  { label: "Merchant", key: "merchant", width: "150px" },
  {
    label: "Amount",
    key: "amount",
    width: "120px",
    render: (r) => (
      <span style={{ fontWeight: "600" }}>
        {r.currency} {r.amount.toLocaleString()}
      </span>
    ),
  },
  {
    label: "Date",
    key: "date",
    width: "120px",
    render: (r) => new Date(r.date).toLocaleDateString(),
  },
  {
    label: "Status",
    key: "status",
    width: "100px",
    render: (r) => (
      <span
        className={`dt-badge ${
          r.status === "approved"
            ? "dt-badge-success"
            : r.status === "pending"
              ? "dt-badge-warning"
              : "dt-badge-danger"
        }`}
      >
        {r.status}
      </span>
    ),
  },
];

export const renderEmployeeSubTable = (row) => {
  const expenses = row.appData?.expenses || [];

  return (
    <div className="sub-table-content-wrapper">
      {expenses.length > 0 ? (
        <DataTable
          columns={expenseColumns}
          data={expenses}
          enableSearch={false}
          disableUrlSync={true}
        />
      ) : (
        <div className="sub-table-empty-state">
          No expense claims recorded for this employee.
        </div>
      )}
    </div>
  );
};

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
  },
  {
    label: "Skills",
    key: "work.skills",
    filterType: "text",
    editorType: "tags",
    editable: true,
    dynamicOptions: true,
    render: (r) => {
      const skills = r.work?.skills || [];
      if (skills.length === 0) return <span className="dt-text-muted">-</span>;

      return (
        <div className="dt-tooltip-trigger">
          <div className="dt-chips-container">
            {skills.slice(0, 2).map((skill, i) => (
              <span key={i} className="dt-chip">
                {skill}
              </span>
            ))}
            {skills.length > 2 && (
              <span className="dt-chip-more">+{skills.length - 2}</span>
            )}
          </div>

          <div className="dt-tooltip-content">
            {skills.map((skill, i) => (
              <span key={i} className="dt-chip">
                {skill}
              </span>
            ))}
          </div>
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
